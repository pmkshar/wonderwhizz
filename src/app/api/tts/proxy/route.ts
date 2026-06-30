import { NextResponse } from 'next/server'

/**
 * Server-side Google Translate TTS proxy.
 *
 * WHY: The browser cannot fetch translate.google.com/translate_tts directly
 * because Google does not return CORS headers. All non-English voice-overs
 * (Hindi, Kannada, Telugu, Tamil, etc.) were silently failing.
 *
 * HOW: This route fetches Google TTS server-side (no CORS restriction),
 * with a desktop Chrome User-Agent (Google 403s requests with a Node.js UA),
 * and returns the MP3 audio with permissive CORS headers so the browser can
 * play it.
 *
 * Supports: hi, kn, te, ta, en, mr, bn, ml, gu, pa — all major Indian languages.
 * Long text is chunked at sentence boundaries (~200 chars per Google TTS request),
 * and the MP3 frames are concatenated into a single audio/mpeg response.
 */

export const runtime = 'nodejs'

const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const MAX_TOTAL_CHARS = 2000

// Google TTS accepts these language codes. We map our BCP-47 ids to the
// code Google expects (usually the 2-letter prefix; English uses en-IN).
const LANG_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi',
  kn: 'kn',
  te: 'te',
  ta: 'ta',
  mr: 'mr',
  bn: 'bn',
  ml: 'ml',
  gu: 'gu',
  pa: 'pa',
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    text?: string
    lang?: string // e.g. 'hi', 'kn', 'te', 'ta', 'en'
  }

  const rawText = (body.text ?? '').trim().slice(0, MAX_TOTAL_CHARS)
  const langCode = (body.lang ?? 'en').toLowerCase().trim()
  const googleLang = LANG_MAP[langCode] ?? langCode

  if (!rawText) {
    return NextResponse.json({ error: 'Nothing to read aloud.' }, { status: 400 })
  }

  try {
    const chunks = chunkText(rawText, 190)
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Nothing to read aloud.' }, { status: 400 })
    }

    // Fetch each chunk and concatenate the MP3 frames
    const buffers: Uint8Array[] = []

    for (const chunk of chunks) {
      const url = buildGoogleTtsUrl(chunk, googleLang)
      const res = await fetch(url, {
        headers: {
          'User-Agent': DESKTOP_UA,
          Accept: 'audio/mpeg, audio/mp3, */*',
        },
      })

      if (!res.ok) {
        const statusText = await res.text().catch(() => '')
        console.warn(
          `[tts/proxy] Google TTS chunk failed: HTTP ${res.status} for lang=${googleLang} len=${chunk.length}`,
          statusText.slice(0, 200)
        )
        // Skip failed chunk rather than aborting entirely
        continue
      }

      const buf = new Uint8Array(await res.arrayBuffer())
      if (buf.length > 0) buffers.push(buf)
    }

    if (buffers.length === 0) {
      return NextResponse.json(
        { error: 'Voice service unavailable. Please try again.' },
        { status: 502 }
      )
    }

    // Concatenate all MP3 frames into one buffer
    const totalLen = buffers.reduce((sum, b) => sum + b.length, 0)
    const merged = new Uint8Array(totalLen)
    let offset = 0
    for (const b of buffers) {
      merged.set(b, offset)
      offset += b.length
    }

    return new NextResponse(merged, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(totalLen),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (err) {
    console.error('[tts/proxy] error', err)
    return NextResponse.json(
      { error: 'Failed to generate audio. Please try again.' },
      { status: 502 }
    )
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

/** Build a Google Translate TTS URL for a single chunk. */
function buildGoogleTtsUrl(text: string, lang: string): string {
  const params = new URLSearchParams({
    ie: 'UTF-8',
    q: text,
    tl: lang,
    total: '1',
    idx: '0',
    textlen: String(text.length),
    client: 'tw-ob',
  })
  return `https://translate.google.com/translate_tts?${params.toString()}`
}

/** Split text into chunks of maxLen chars, breaking at sentence boundaries. */
function chunkText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text]
  const chunks: string[] = []
  // Split on sentence-ending punctuation (including Indian danda ।)
  const sentences = text.split(/(?<=[.!?।؟])\s+/)
  let current = ''
  for (const s of sentences) {
    if ((current + ' ' + s).trim().length <= maxLen) {
      current = (current + ' ' + s).trim()
    } else {
      if (current) chunks.push(current)
      // If a single sentence is longer than maxLen, hard-split on spaces
      if (s.length > maxLen) {
        const words = s.split(' ')
        let buf = ''
        for (const w of words) {
          if ((buf + ' ' + w).trim().length <= maxLen) {
            buf = (buf + ' ' + w).trim()
          } else {
            if (buf) chunks.push(buf)
            buf = w
          }
        }
        if (buf) chunks.push(buf)
      } else {
        current = s
      }
    }
  }
  if (current) chunks.push(current)
  return chunks
}
