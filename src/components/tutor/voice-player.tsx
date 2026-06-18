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
 * Falls back to /api/tts (server-side ZAI TTS) only when:
 *   - The browser does not support SpeechSynthesis, OR
 *   - No matching system voice can be found for the requested language
 */
export function VoicePlayer({ text, voiceId, disabled }: VoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [, setVoicesVersion] = useState(0) // forces re-render when voices load
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
    // Some browsers populate voices immediately but don't fire the event
    setVoicesVersion((v) => v + 1)
    // Poll a few times — Chrome on Android sometimes populates voices late
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

    // Exact BCP-47 match
    if (lang === bcp47.toLowerCase()) score += 100
    // Same language prefix + Indian region
    else if (lang.startsWith(langPrefix) && lang.includes('-in')) score += 80
    // Same language prefix only (any region) — e.g. en-GB still gets some points
    else if (lang.startsWith(langPrefix)) score += 40

    // Voice name hints at Indian origin
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
    // Google / Microsoft Indian voices are usually high quality
    if (name.includes('google') && lang.includes('-in')) score += 25
    if (name.includes('microsoft') && lang.includes('-in')) score += 20

    return score
  }

  /**
   * Try to find the best Indian-accented system voice for the requested
   * language. Returns null only if NO voice with the same language prefix
   * exists at all.
   */
  function pickSystemVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null
    }
    const voices = window.speechSynthesis.getVoices()
    if (!voices || voices.length === 0) return null

    // Score every voice and pick the highest. Voices that don't match the
    // language prefix at all get a 0 score and are excluded.
    const scored = voices
      .map((v) => ({ v, score: scoreVoice(v) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)

    return scored[0]?.v ?? null
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

    // PRIMARY PATH: Browser Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const sysVoice = pickSystemVoice()
      if (sysVoice) {
        setLoading(true)
        try {
          window.speechSynthesis.cancel() // clear any pending speech
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
          setPlaying(true)
          return
        } finally {
          setLoading(false)
        }
      } else {
        // Browser supports SpeechSynthesis but has no system voices installed
        // (common on headless browsers; rare on real user devices). Try speaking
        // without an explicit voice — the browser will use its default voice.
        setLoading(true)
        try {
          window.speechSynthesis.cancel()
          const utter = new SpeechSynthesisUtterance(text.slice(0, 1200))
          utter.lang = bcp47
          utter.rate = 0.95
          utter.pitch = 1.0
          utter.onend = () => setPlaying(false)
          utter.onerror = () => {
            setPlaying(false)
            // Last resort: fall through to /api/tts
            void handleServerTts()
          }
          window.speechSynthesis.speak(utter)
          setUsingFallback(false)
          setPlaying(true)
          return
        } finally {
          setLoading(false)
        }
      }
    }

    // FALLBACK PATH: server-side /api/tts (ZAI TTS — may fail with 0 balance)
    await handleServerTts()
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
          <Volume2 className="h-3.5 w-3.5 animate-pulse" /> speaking...
        </span>
      )}
    </div>
  )
}
