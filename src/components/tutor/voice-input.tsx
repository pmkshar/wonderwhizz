'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Voice input component using the Web Speech API (SpeechRecognition).
 *
 * Renders as a microphone button. Click to start listening → transcription
 * fills the parent's question state. Click again (or auto-stop after silence)
 * to stop. The parent can also trigger auto-submit when recognition ends.
 *
 * Supports all major Indian languages via BCP-47 lang codes:
 *   en-IN, hi-IN, kn-IN, te-IN, ta-IN
 *
 * Fallback: if SpeechRecognition is not available (Firefox, some mobile
 * browsers), the button is hidden with a tooltip.
 */

interface VoiceInputProps {
  /** BCP-47 language code, e.g. 'en-IN', 'hi-IN' */
  lang: string
  /** Called with the transcribed text (accumulated) */
  onTranscript: (text: string) => void
  /** Called when recognition ends (user stopped or auto-stopped) */
  onEnd?: () => void
  /** Whether the input is currently disabled (e.g. AI is thinking) */
  disabled?: boolean
  /** Optional class name */
  className?: string
}

// Types for the Web Speech API (not in standard TS lib)
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}
interface SpeechRecognitionErrorEvent {
  error: string
  message?: string
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((ev: SpeechRecognitionEvent) => void) | null
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null
  return (
    (window as unknown as Record<string, unknown>).SpeechRecognition ??
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition
  ) as (new () => SpeechRecognitionInstance) | null
}

export function VoiceInput({
  lang,
  onTranscript,
  onEnd,
  disabled = false,
  className,
}: VoiceInputProps) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const stoppedManually = useRef(false)

  // Check support on mount
  useEffect(() => {
    const SR = getSpeechRecognition()
    setSupported(!!SR)
  }, [])

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
    }
  }, [])

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition()
    if (!SR) {
      setSupported(false)
      return
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }

    stoppedManually.current = false
    const recognition = new SR()
    recognition.lang = lang
    recognition.continuous = true // keep listening until user stops
    recognition.interimResults = true // show partial results
    recognition.maxAlternatives = 1

    let finalTranscript = ''

    recognition.onstart = () => {
      setListening(true)
    }

    recognition.onresult = (ev: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }
      // Send both final + current interim to the parent
      onTranscript((finalTranscript + interim).trim())
    }

    recognition.onerror = (ev: SpeechRecognitionErrorEvent) => {
      console.warn('[voice-input] error:', ev.error, ev.message)
      if (ev.error === 'not-allowed') {
        setSupported(false)
      }
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
      if (!stoppedManually.current && onEnd) {
        onEnd()
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (err) {
      console.warn('[voice-input] start failed:', err)
      setListening(false)
    }
  }, [lang, onTranscript, onEnd])

  const stopListening = useCallback(() => {
    stoppedManually.current = true
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setListening(false)
  }, [])

  // Update the recognition language when lang changes
  useEffect(() => {
    if (recognitionRef.current && listening) {
      // Restart with new language
      stopListening()
      setTimeout(() => startListening(), 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  if (!supported) return null

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        size="sm"
        variant={listening ? 'destructive' : 'outline'}
        onClick={listening ? stopListening : startListening}
        disabled={disabled}
        className={cn(
          'gap-1.5 text-xs transition-all',
          listening && 'animate-pulse shadow-lg shadow-red-500/20'
        )}
        title={
          listening
            ? 'Stop listening'
            : `Ask by voice (${lang.slice(0, 2).toUpperCase()})`
        }
      >
        {listening ? (
          <>
            <Square className="h-3.5 w-3.5" /> Listening...
          </>
        ) : (
          <>
            <Mic className="h-3.5 w-3.5" /> Voice
          </>
        )}
      </Button>
      {/* Animated listening indicator */}
      {listening && (
        <div className="absolute -right-1 -top-1 flex items-center gap-0.5">
          <span className="inline-block h-2 w-2 animate-ping rounded-full bg-red-500" />
          <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-red-400 delay-150" />
          <span className="inline-block h-1 w-1 animate-ping rounded-full bg-red-300 delay-300" />
        </div>
      )}
    </div>
  )
}
