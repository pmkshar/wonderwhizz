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
 * Calls /api/tts to get a WAV file and plays it.
 * Provides play / pause / stop with progress.
 */
export function VoicePlayer({ text, voiceId, disabled }: VoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const voice = getVoiceById(voiceId)

  // Cleanup previous blob URL when text/voice changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Reset state when text changes
  useEffect(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [text, voiceId, audioUrl])

  async function handlePlay() {
    if (!text.trim()) {
      toast.error('Nothing to read aloud yet.')
      return
    }
    // If we already have audio, just toggle play/pause
    if (audioUrl && audioRef.current) {
      if (playing) {
        audioRef.current.pause()
        setPlaying(false)
      } else {
        await audioRef.current.play()
        setPlaying(true)
      }
      return
    }

    // Generate new audio
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
      // Wait for next tick so audio element picks up new src
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
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  function handleStop() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlaying(false)
    }
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
      {audioUrl && (
        <Button type="button" size="sm" variant="ghost" onClick={handleStop} disabled={loading}>
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
