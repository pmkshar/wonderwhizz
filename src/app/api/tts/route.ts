import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createZaiClient } from '@/lib/zai-client'

// Cap TTS input to keep responses fast
const MAX_TTS_CHARS = 1200

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Please sign in to use voice-over.' }, { status: 401 })
  }
  const body = (await req.json().catch(() => ({}))) as {
    text?: string
    voice?: string
    speed?: number
  }
  const text = (body.text ?? '').trim()
  const voice = (body.voice ?? 'tongtong').trim()
  const speed =
    typeof body.speed === 'number' && body.speed >= 0.5 && body.speed <= 2
      ? body.speed
      : 1.0

  if (text.length === 0) {
    return NextResponse.json({ error: 'Nothing to read aloud.' }, { status: 400 })
  }
  const truncated = text.slice(0, MAX_TTS_CHARS)

  try {
    const zai = await createZaiClient()
    const response = await zai.audio.tts.create({
      input: truncated,
      voice,
      speed,
      response_format: 'wav',
      stream: false,
    })
    if (!response.ok) {
      const txt = await response.text().catch(() => '')
      console.error('[tts] non-OK', response.status, txt.slice(0, 200))
      return NextResponse.json(
        { error: 'Voice service unavailable.' },
        { status: 502 }
      )
    }
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(new Uint8Array(arrayBuffer))
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[tts] error', err)
    return NextResponse.json(
      { error: 'Failed to generate audio. Please try again.' },
      { status: 502 }
    )
  }
}
