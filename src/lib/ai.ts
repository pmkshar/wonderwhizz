/**
 * Multi-provider AI client with automatic fallback.
 *
 * Provider chain (in order):
 *   1. ZAI           — primary; used when ZAI_API_KEY + ZAI_BASE_URL are set
 *                      AND the account has balance. Falls through on 429 /
 *                      "Insufficient balance" / malformed response.
 *   2. Groq          — fast (~1-3s) Llama 3.3 70B; free tier; needs GROQ_API_KEY.
 *   3. Gemini        — Google Gemini 1.5 Flash; very generous free tier;
 *                      needs GEMINI_API_KEY. (Vercel runs from US/EU — geo OK.)
 *   4. Pollinations  — truly free, no API key, no signup. OpenAI-compatible
 *                      endpoint powered by gpt-oss-20b. "Free forever" safety net.
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

export type ProviderName = 'zai' | 'groq' | 'gemini' | 'pollinations'

export interface ChatResult {
  content: string
  provider: ProviderName
}

// ---------------------------------------------------------------------------
// ZAI
// ---------------------------------------------------------------------------

/**
 * Try ZAI first. Returns null if ZAI is unavailable OR returns an
 * "insufficient balance" / 429-style error — in which case we fall back
 * silently to the next provider.
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
    const isFallbackWorthy =
      /429|insufficient balance|1113|quota|rate.?limit|econnrefused|enotfound|401|403|unauthor|forbidden/i.test(
        msg
      )
    if (isFallbackWorthy) {
      console.warn('[ai] ZAI failed, falling back:', msg)
      return null
    }
    throw err
  }
}

// ---------------------------------------------------------------------------
// Groq (Llama 3.3 70B, ~1-3s typical latency)
// ---------------------------------------------------------------------------

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_TIMEOUT_MS = 25_000

async function tryGroq(opts: ChatOptions): Promise<ChatResult | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS)

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.5,
        max_tokens: opts.maxTokens ?? 1400,
        top_p: 0.9,
      }),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.warn(`[ai] Groq HTTP ${res.status}: ${txt.slice(0, 200)}`)
      return null
    }

    const data = (await res.json().catch(() => null)) as {
      choices?: Array<{ message?: { content?: string } }>
    } | null
    const content = data?.choices?.[0]?.message?.content ?? ''
    if (!content.trim()) {
      console.warn('[ai] Groq returned empty content')
      return null
    }
    return { content, provider: 'groq' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[ai] Groq failed:', msg)
    return null
  } finally {
    clearTimeout(timer)
  }
}

// ---------------------------------------------------------------------------
// Gemini (1.5 Flash — very generous free tier)
// ---------------------------------------------------------------------------

const GEMINI_URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const GEMINI_MODEL = 'gemini-1.5-flash'
const GEMINI_TIMEOUT_MS = 30_000

async function tryGemini(opts: ChatOptions): Promise<ChatResult | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return null

  // Gemini uses a different request shape: separate `systemInstruction` +
  // `contents` array. Convert OpenAI-style messages.
  const systemParts = opts.messages
    .filter((m) => m.role === 'system')
    .map((m) => ({ text: m.content }))
  const conversationParts = opts.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  const body: Record<string, unknown> = {
    contents: conversationParts,
    generationConfig: {
      temperature: opts.temperature ?? 0.5,
      maxOutputTokens: opts.maxTokens ?? 1400,
      topP: 0.9,
    },
  }
  if (systemParts.length > 0) {
    body.systemInstruction = { parts: systemParts }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

  try {
    const res = await fetch(
      `${GEMINI_URL_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.warn(`[ai] Gemini HTTP ${res.status}: ${txt.slice(0, 200)}`)
      return null
    }

    const data = (await res.json().catch(() => null)) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    } | null
    const content =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('\n') ?? ''
    if (!content.trim()) {
      console.warn('[ai] Gemini returned empty content')
      return null
    }
    return { content, provider: 'gemini' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[ai] Gemini failed:', msg)
    return null
  } finally {
    clearTimeout(timer)
  }
}

// ---------------------------------------------------------------------------
// Pollinations (free forever, no API key, last resort)
// ---------------------------------------------------------------------------

const POLLINATIONS_URL = 'https://text.pollinations.ai/openai'
// Pollinations (gpt-oss-20b reasoning model) can take 15-30s on cold starts.
const POLLINATIONS_TIMEOUT_MS = 50_000

async function callPollinations(opts: ChatOptions): Promise<ChatResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), POLLINATIONS_TIMEOUT_MS)

  try {
    const res = await fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'openai',
        messages: opts.messages,
        temperature: opts.temperature ?? 0.5,
        max_tokens: opts.maxTokens ?? 1400,
        private: true,
      }),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new Error(`Pollinations HTTP ${res.status}: ${txt.slice(0, 200)}`)
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

async function callPollinationsGet(opts: ChatOptions): Promise<ChatResult> {
  const systemMsgs = opts.messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n')
  const userMsgs = opts.messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join('\n\n')
  const prompt = `${systemMsgs}\n\nQuestion: ${userMsgs}\n\nAnswer:`

  const url = `https://text.pollinations.ai/${encodeURIComponent(
    prompt.slice(0, 3500)
  )}?model=openai&private=true&seed=${Math.floor(Math.random() * 1e6)}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), POLLINATIONS_TIMEOUT_MS)

  try {
    const res = await fetch(url, { method: 'GET', signal: controller.signal })
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

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Main entry point. Tries providers in order: ZAI → Groq → Gemini → Pollinations.
 * Each provider returns null on a recoverable error so we can fall through to
 * the next one. Only Pollinations (the last resort) throws on failure.
 */
export async function chatWithFallback(opts: ChatOptions): Promise<ChatResult> {
  const tried: string[] = []

  const zai = await tryZai(opts)
  if (zai) return zai
  tried.push('zai')

  const groq = await tryGroq(opts)
  if (groq) return groq
  tried.push('groq')

  const gemini = await tryGemini(opts)
  if (gemini) return gemini
  tried.push('gemini')

  console.warn(`[ai] All primary providers failed (${tried.join(', ')}). Falling back to Pollinations.`)
  try {
    return await callPollinations(opts)
  } catch (postErr) {
    console.warn('[ai] Pollinations POST failed, trying GET fallback:', postErr)
    return await callPollinationsGet(opts)
  }
}
