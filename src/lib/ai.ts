/**
 * Multi-provider AI client with automatic fallback.
 *
 * Provider chain (in order):
 *   1. ZAI         — used when ZAI_API_KEY + ZAI_BASE_URL env vars are set AND the
 *                    account has balance. Falls through on 429 / "Insufficient balance".
 *   2. Pollinations.ai — truly free, no API key, no signup. OpenAI-compatible endpoint
 *                    at https://text.pollinations.ai/openai. Powered by gpt-oss-20b.
 *                    This is the "free forever" safety net.
 *
 * All providers expose the same call signature:
 *   chat({ messages, temperature, maxTokens }) -> { content, provider }
 */

import { createZaiClient } from '@/lib/zai-client'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}

export interface ChatResult {
  content: string
  provider: 'zai' | 'pollinations'
}

const POLLINATIONS_URL = 'https://text.pollinations.ai/openai'
// Pollinations (gpt-oss-20b reasoning model) can take 15-30s on cold starts.
// 50s timeout leaves a comfortable buffer under Vercel's 60s maxDuration.
const POLLINATIONS_TIMEOUT_MS = 50_000

/**
 * Try ZAI first. Returns null if ZAI is unavailable OR returns an
 * "insufficient balance" / 429-style error — in which case we fall back
 * to Pollinations silently.
 */
async function tryZai(opts: ChatOptions): Promise<ChatResult | null> {
  const baseUrl = process.env.ZAI_BASE_URL?.trim()
  const apiKey = process.env.ZAI_API_KEY?.trim()

  if (!baseUrl || !apiKey) return null

  try {
    const zai = await createZaiClient()
    const completion = await zai.chat.completions.create({
      messages: opts.messages,
      thinking: { type: 'disabled' },
      temperature: opts.temperature ?? 0.5,
      max_tokens: opts.maxTokens ?? 1400,
    })
    // ZAI returns malformed responses (no choices array) when the API key
    // has insufficient balance — guard against this and fall back gracefully.
    const choices = (completion as { choices?: Array<{ message?: { content?: string } }> }).choices
    const content = choices?.[0]?.message?.content ?? ''
    if (!content.trim()) {
      console.warn('[ai] ZAI returned empty/malformed response (likely 0 balance), falling back')
      return null
    }
    return { content, provider: 'zai' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // Common failure modes that should trigger fallback:
    //   - HTTP 429 / 1113 "Insufficient balance"  (zero-credit ZAI key)
    //   - ECONNREFUSED / ENOTFOUND                (internal-api.z.ai unreachable from Vercel)
    //   - 401 / 403                               (bad key)
    const isFallbackWorthy =
      /429|insufficient balance|1113|quota|rate.?limit|econnrefused|enotfound|401|403|unauthor/i.test(
        msg
      )
    if (isFallbackWorthy) {
      console.warn('[ai] ZAI failed, falling back to Pollinations:', msg)
      return null
    }
    // Unknown error — bubble up
    throw err
  }
}

/**
 * Free, no-API-key fallback powered by Pollinations.ai.
 * OpenAI-compatible request shape.
 */
async function callPollinations(opts: ChatOptions): Promise<ChatResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), POLLINATIONS_TIMEOUT_MS)

  try {
    const res = await fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        // "openai" maps to gpt-oss-20b on Pollinations — solid general-purpose model.
        model: 'openai',
        messages: opts.messages,
        temperature: opts.temperature ?? 0.5,
        max_tokens: opts.maxTokens ?? 1400,
        // Anonymous tier — no auth, no API key.
        // `private: true` keeps the request out of the public Pollinations feed.
        private: true,
      }),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new Error(
        `Pollinations HTTP ${res.status}: ${txt.slice(0, 200)}`
      )
    }

    const data = (await res.json().catch(() => null)) as {
      choices?: Array<{ message?: { content?: string } }>
    } | null
    const content = data?.choices?.[0]?.message?.content ?? ''
    if (!content.trim()) {
      throw new Error('Pollinations returned empty content')
    }
    return { content, provider: 'pollinations' }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Last-resort GET endpoint fallback. Pollinations also exposes a simple
 * text endpoint at https://text.pollinations.ai/{prompt} which is sometimes
 * faster than the OpenAI-compatible POST. Used only if the POST fails.
 */
async function callPollinationsGet(opts: ChatOptions): Promise<ChatResult> {
  // Compose a single prompt from the message list
  const systemMsgs = opts.messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n')
  const userMsgs = opts.messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n\n')
  const prompt = `${systemMsgs}\n\nQuestion: ${userMsgs}\n\nAnswer:`

  const url = `https://text.pollinations.ai/${encodeURIComponent(prompt.slice(0, 3500))}?model=openai&private=true&seed=${Math.floor(Math.random() * 1e6)}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), POLLINATIONS_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`Pollinations GET HTTP ${res.status}`)
    }
    const content = await res.text()
    if (!content.trim()) {
      throw new Error('Pollinations GET returned empty body')
    }
    return { content, provider: 'pollinations' }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Main entry point. Tries ZAI first (if configured), then falls back to
 * the free Pollinations.ai endpoint. Always returns content or throws.
 */
export async function chatWithFallback(opts: ChatOptions): Promise<ChatResult> {
  const zaiResult = await tryZai(opts)
  if (zaiResult) return zaiResult

  try {
    return await callPollinations(opts)
  } catch (postErr) {
    console.warn('[ai] Pollinations POST failed, trying GET fallback:', postErr)
    return await callPollinationsGet(opts)
  }
}
