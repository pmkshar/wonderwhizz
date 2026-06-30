'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { toast } from 'sonner'
import { getVoiceById } from '@/lib/languages'

interface VoicePlayerProps {
  text: string
  voiceId: string
  disabled?: boolean
  /** If true, automatically start playing when the component mounts or text changes */
  autoPlay?: boolean
}

/**
 * Voice player using the browser's built-in Web Speech API (SpeechSynthesis)
 * as the primary engine. This is:
 *   - 100% free, no API key, no quota
 *   - Works offline (built into Chrome/Edge/Safari/Firefox)
 *   - Strongly prefers Indian-accent voices (en-IN, hi-IN, kn-IN) so the
 *     tutor always sounds Indian regardless of which system voices are
 *     installed.
 *
 * For Hindi (hi) and Kannada (kn), we DON'T rely solely on SpeechSynthesis —
 * most desktop browsers (Chrome on Windows/Mac, Firefox) ship en-IN but NOT
 * hi-IN or kn-IN voices, so the previous version appeared to "do nothing"
 * for Hindi/Kannada. We now:
 *   1. Try SpeechSynthesis with the exact Indian-locale voice first.
 *   2. If no matching voice exists for hi/kn, fall back to Google Translate
 *      TTS (`translate.google.com/translate_tts`) which supports hi + kn
 *      natively, is free, requires no API key, and returns MP3 audio we can
 *      play with an <audio> element.
 *   3. As a last resort, try the server-side /api/tts route (ZAI TTS).
 */
export function VoicePlayer({ text, voiceId, disabled, autoPlay }: VoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [voicesVersion, setVoicesVersion] = useState(0) // forces re-render when voices load
  const [voiceMode, setVoiceMode] = useState<'system' | 'google' | 'server' | null>(null)
  const voice = getVoiceById(voiceId)

  // Map our voiceId to BCP-47 language codes the browser understands.
  // All voices resolve to Indian-accent locales.
  const bcp47 = voice.bcp47 ?? (voiceId === 'hi' ? 'hi-IN' : voiceId === 'kn' ? 'kn-IN' : 'en-IN')
  const langPrefix = bcp47.slice(0, 2).toLowerCase() // 'hi' | 'kn' | 'en'

  // In real browsers, getVoices() returns [] initially and populates
  // asynchronously via the `voiceschanged` event. Listen for it.
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const handler = () => setVoicesVersion((v) => v + 1)
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    setVoicesVersion((v) => v + 1)
    const pollTimer = setInterval(() => {
      if (window.speechSynthesis.getVoices().length > 0) {
        setVoicesVersion((v) => v + 1)
        clearInterval(pollTimer)
      }
    }, 250)
    setTimeout(() => clearInterval(pollTimer), 3000)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler)
      clearInterval(pollTimer)
    }
  }, [])

  // Cleanup previous blob URL when audioUrl changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Reset state when text or voice changes — also stop any in-flight speech
  useEffect(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setPlaying(false)
    setVoiceMode(null)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [text, voiceId, audioUrl])

  // Cleanup speechSynthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Auto-play: when autoPlay is true and text becomes non-empty, start playing
  const hasAutoPlayed = useRef(false)
  useEffect(() => {
    if (autoPlay && text.trim() && !hasAutoPlayed.current && !playing && !loading) {
      hasAutoPlayed.current = true
      // Small delay to let the UI settle before starting voice
      const timer = setTimeout(() => {
        handlePlay()
      }, 500)
      return () => clearTimeout(timer)
    }
    // Reset when text changes (new answer)
    return () => {
      hasAutoPlayed.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text])

  /**
   * Score a system voice by how well it matches our preferred Indian accent.
   * Higher score = better match. We bias towards:
   *   1. Exact BCP-47 match (e.g. "hi-IN" when we want "hi-IN")         +100
   *   2. Same language prefix + Indian region code                      +80
   *   3. Same language prefix + any region (non-Indian)                 +40
   *   4. Voice name contains "India" / "Hindi" / "Kannada" / "Heera"    +30
   *   5. Google / Microsoft branded Indian voices                       +25
   */
  function scoreVoice(v: SpeechSynthesisVoice): number {
    const lang = (v.lang || '').toLowerCase()
    const name = (v.name || '').toLowerCase()
    let score = 0

    if (lang === bcp47.toLowerCase()) score += 100
    else if (lang.startsWith(langPrefix) && lang.includes('-in')) score += 80
    else if (lang.startsWith(langPrefix)) score += 40

    if (
      name.includes('india') ||
      name.includes('hindi') ||
      name.includes('heera') ||
      name.includes('kalpana') ||
      name.includes('kannada') ||
      name.includes('swara') ||
      name.includes('veer') ||
      name.includes('mira')
    ) {
      score += 30
    }
    if (name.includes('google') && lang.includes('-in')) score += 25
    if (name.includes('microsoft') && lang.includes('-in')) score += 20

    return score
  }

  /**
   * Try to find the best Indian-accented system voice for the requested
   * language. Returns null only if NO voice with the same language prefix
   * exists at all.
   *
   * NOTE: `voicesVersion` is read here (not in state) so the function always
   * sees the latest voices list — re-renders triggered by setVoicesVersion
   * make sure pickSystemVoice is re-invoked on the latest data.
   */
  function pickSystemVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null
    }
    // touch voicesVersion so React re-renders re-call this fn after voices load
    void voicesVersion
    const voices = window.speechSynthesis.getVoices()
    if (!voices || voices.length === 0) return null

    const scored = voices
      .map((v) => ({ v, score: scoreVoice(v) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)

    return scored[0]?.v ?? null
  }

  /**
   * Returns true if the browser has any system voice that EXACTLY matches
   * the requested Indian locale (e.g. hi-IN, kn-IN). If false, the Web Speech
   * API can't actually speak this language and we should fall back to Google
   * Translate TTS instead.
   */
  function hasExactIndianVoice(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false
    }
    void voicesVersion
    const voices = window.speechSynthesis.getVoices()
    if (!voices || voices.length === 0) return false
    return voices.some((v) => v.lang?.toLowerCase() === bcp47.toLowerCase())
  }

  async function handlePlay() {
    if (!text.trim()) {
      toast.error('Nothing to read aloud yet.')
      return
    }

    // If we're already playing, pause
    if (playing) {
      if (usingFallback && audioRef.current) {
        audioRef.current.pause()
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setPlaying(false)
      return
    }

    // If we have a server-generated audio URL (fallback mode), just play it
    if (audioUrl && audioRef.current) {
      try {
        await audioRef.current.play()
        setPlaying(true)
      } catch {
        toast.error('Please tap play again to listen.')
      }
      return
    }

    // PRIMARY PATH (English / Indian-English): Browser Web Speech API
    // We try this for en first because en-IN voices are widely available.
    if (langPrefix === 'en') {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const sysVoice = pickSystemVoice()
        if (sysVoice) {
          setLoading(true)
          try {
            window.speechSynthesis.cancel()
            const utter = new SpeechSynthesisUtterance(text.slice(0, 1200))
            utter.voice = sysVoice
            utter.lang = sysVoice.lang
            utter.rate = 0.95
            utter.pitch = 1.0
            utter.onend = () => setPlaying(false)
            utter.onerror = () => {
              setPlaying(false)
              toast.error('Voice playback failed. Try again.')
            }
            window.speechSynthesis.speak(utter)
            setUsingFallback(false)
            setVoiceMode('system')
            setPlaying(true)
            return
          } finally {
            setLoading(false)
          }
        }
      }
      // No en-IN voice — fall through to Google TTS
    } else {
      // Hindi or Kannada: try system voice ONLY if an exact hi-IN / kn-IN
      // voice exists. Otherwise, skip straight to Google TTS to avoid
      // the previous bug where SpeechSynthesis would silently do nothing.
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && hasExactIndianVoice()) {
        const sysVoice = pickSystemVoice()
        if (sysVoice) {
          setLoading(true)
          try {
            window.speechSynthesis.cancel()
            const utter = new SpeechSynthesisUtterance(text.slice(0, 1200))
            utter.voice = sysVoice
            utter.lang = sysVoice.lang
            utter.rate = 0.92 // slightly slower for clarity in Indian langs
            utter.pitch = 1.0
            utter.onend = () => setPlaying(false)
            utter.onerror = () => {
              setPlaying(false)
              // Fall through to Google TTS on error
              void handleGoogleTts()
            }
            window.speechSynthesis.speak(utter)
            setUsingFallback(false)
            setVoiceMode('system')
            setPlaying(true)
            return
          } finally {
            setLoading(false)
          }
        }
      }
      // No exact Indian voice — use Google TTS (free, supports hi + kn)
    }

    // SECONDARY FALLBACK: Google Translate TTS (free, no API key, supports hi + kn)
    await handleGoogleTts()
  }

  /**
   * Build a Google Translate TTS URL for the text.
   * This is the same endpoint used by Google Translate's "Listen" button
   * and supports all major Indian languages (hi, kn, en-IN, ta, te, ml, mr, bn...).
   *
   * Note: Google rate-limits this if abused. We chunk to 200 chars (Google's
   * TTS URL length cap) and play sequentially if needed.
   */
  async function handleGoogleTts() {
    setLoading(true)
    try {
      // Google TTS has a ~200 char URL limit per request. Chunk longer text.
      const chunks = chunkText(text.slice(0, 1500), 190)
      if (chunks.length === 0) {
        throw new Error('Nothing to read.')
      }

      // Build a single combined audio by fetching each chunk and concatenating.
      // For simplicity (and since most tutor answers are < 200 chars when spoken),
      // if there's only one chunk we just play it directly.
      if (chunks.length === 1) {
        const url = buildGoogleTtsUrl(chunks[0], langPrefix)
        await playUrl(url)
        setVoiceMode('google')
        return
      }

      // Multiple chunks — fetch each, concatenate as Blob, play
      const blobParts: ArrayBuffer[] = []
      for (const chunk of chunks) {
        const url = buildGoogleTtsUrl(chunk, langPrefix)
        try {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const buf = await res.arrayBuffer()
          blobParts.push(buf)
        } catch (err) {
          console.warn('[voice] google tts chunk failed', err)
          // skip failed chunk; continue
        }
      }
      if (blobParts.length === 0) throw new Error('All chunks failed')
      const blob = new Blob(blobParts, { type: 'audio/mpeg' })
      const blobUrl = URL.createObjectURL(blob)
      setAudioUrl(blobUrl)
      setUsingFallback(true)
      setVoiceMode('google')
      setTimeout(async () => {
        if (audioRef.current) {
          audioRef.current.src = blobUrl
          try {
            await audioRef.current.play()
            setPlaying(true)
          } catch {
            toast.error('Please tap play again to listen.')
          }
        }
      }, 50)
    } catch (err) {
      console.warn('[voice] google tts failed, trying server TTS', err)
      // Last resort: server-side /api/tts (ZAI TTS)
      await handleServerTts()
    } finally {
      setLoading(false)
    }
  }

  /** Play a single URL via the audio element. */
  async function playUrl(url: string) {
    setAudioUrl(url)
    setUsingFallback(true)
    setTimeout(async () => {
      if (audioRef.current) {
        audioRef.current.src = url
        try {
          await audioRef.current.play()
          setPlaying(true)
        } catch (err) {
          console.warn('[voice] audio.play() failed', err)
          // CORS or autoplay policy — show toast and let user tap play
          toast.error('Tap play again to listen.')
        }
      }
    }, 50)
  }

  async function handleServerTts() {
    setLoading(true)
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: voice.voice }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? 'Voice service unavailable')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      setUsingFallback(true)
      setVoiceMode('server')
      setTimeout(async () => {
        if (audioRef.current) {
          audioRef.current.src = url
          try {
            await audioRef.current.play()
            setPlaying(true)
          } catch {
            toast.error('Please tap play again to listen.')
          }
        }
      }, 50)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate audio.'
      toast.error(
        `${msg} Your browser may not support voice playback for this language.`
      )
    } finally {
      setLoading(false)
    }
  }

  function handleStop() {
    if (usingFallback && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setPlaying(false)
  }

  // Show the engine badge so the user knows which voice was used.
  const engineLabel =
    voiceMode === 'google'
      ? 'Google voice'
      : voiceMode === 'server'
      ? 'Server voice'
      : voiceMode === 'system'
      ? 'System voice'
      : null

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        className="hidden"
      />
      <Button
        type="button"
        size="sm"
        variant={playing ? 'secondary' : 'default'}
        onClick={handlePlay}
        disabled={disabled || loading}
        className="gap-1.5"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Generating...
          </>
        ) : playing ? (
          <>
            <Pause className="h-4 w-4" /> Pause
          </>
        ) : (
          <>
            <Play className="h-4 w-4" /> Listen ({voice.flag} {voice.nativeLabel})
          </>
        )}
      </Button>
      {playing && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleStop}
          disabled={loading}
        >
          <VolumeX className="h-4 w-4" />
        </Button>
      )}
      {playing && (
        <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
          <Volume2 className="h-3.5 w-3.5 animate-pulse" />
          {engineLabel ? `${engineLabel} · speaking...` : 'speaking...'}
        </span>
      )}
    </div>
  )
}

/** Build a Google Translate TTS URL for a single chunk of text. */
function buildGoogleTtsUrl(text: string, langPrefix: string): string {
  // Google TTS expects lang codes like 'hi', 'kn', 'en'. For Indian English
  // we use 'en-IN' style — Google accepts both but 'en' is more reliable.
  const lang = langPrefix === 'en' ? 'en-IN' : langPrefix
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
  // Split on sentence-ending punctuation first, then on spaces
  const sentences = text.split(/(?<=[.!?।؟])\s+/)
  let current = ''
  for (const s of sentences) {
    if ((current + ' ' + s).trim().length <= maxLen) {
      current = (current + ' ' + s).trim()
    } else {
      if (current) chunks.push(current)
      // If a single sentence is longer than maxLen, hard-split it
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
