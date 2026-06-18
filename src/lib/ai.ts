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
const POLLINATIONS_TIMEOUT_MS = 60_000

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
    const content = completion.choices[0]?.message?.content ?? ''
    if (!content.trim()) return null
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
 * Main entry point. Tries ZAI first (if configured), then falls back to
 * the free Pollinations.ai endpoint. Always returns content or throws.
 */
export async function chatWithFallback(opts: ChatOptions): Promise<ChatResult> {
  const zaiResult = await tryZai(opts)
  if (zaiResult) return zaiResult

  return await callPollinations(opts)
}
