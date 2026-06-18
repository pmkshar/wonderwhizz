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
 *   - Supports many languages including Hindi (hi-IN), Kannada (kn-IN), English (en-US)
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

  // Map our voiceId to BCP-47 language codes the browser understands
  const bcp47 =
    voiceId === 'hi' ? 'hi-IN' : voiceId === 'kn' ? 'kn-IN' : 'en-US'

  // In real browsers, getVoices() returns [] initially and populates
  // asynchronously via the `voiceschanged` event. Listen for it.
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const handler = () => setVoicesVersion((v) => v + 1)
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    // Some browsers populate voices immediately but don't fire the event
    setVoicesVersion((v) => v + 1)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler)
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
   * Try to find a system voice that matches the requested BCP-47 language.
   * Returns null if no match (in which case we fall back to /api/tts).
   */
  function pickSystemVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null
    }
    const voices = window.speechSynthesis.getVoices()
    if (!voices || voices.length === 0) return null

    // Try exact match first
    let v = voices.find((v) => v.lang === bcp47)
    if (v) return v
    // Then language-prefix match (e.g. "hi" matches "hi-IN" or "hi-IN-*")
    v = voices.find((v) => v.lang.toLowerCase().startsWith(voiceId.toLowerCase()))
    if (v) return v
    // Then any voice whose lang starts with the same prefix
    v = voices.find((v) => v.lang.toLowerCase().startsWith(bcp47.slice(0, 2)))
    if (v) return v
    return null
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
          utter.rate = 1.0
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
          utter.rate = 1.0
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
