'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Markdown } from '@/components/markdown/markdown'
import { VoicePlayer } from './voice-player'
import { EXPLANATION_STYLES, type ExplanationStyleId } from '@/lib/explanation-prompts'
import { SUBJECTS, getMathsTopic } from '@/lib/subjects'
import { Copy, Check, RefreshCw, Volume2, Maximize2, Minimize2, X } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  answer: string
  subject: string
  style: ExplanationStyleId
  language: string
  topic?: string | null
  loading?: boolean
  onRegenerate?: () => void
}

export function ExplanationResult({
  answer,
  subject,
  style,
  language,
  topic,
  loading,
  onRegenerate,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const styleData = EXPLANATION_STYLES.find((s) => s.id === style)
  const subjectData = SUBJECTS.find((s) => s.id === subject)
  const topicData = topic ? getMathsTopic(topic) : undefined

  // Only render the portal after mount (client-side) to avoid SSR mismatches.
  useEffect(() => setMounted(true), [])

  // Lock body scroll while fullscreen is open and listen for ESC to close.
  useEffect(() => {
    if (!isFullscreen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [isFullscreen])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(answer)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy')
    }
  }, [answer])

  if (loading) {
    return (
      <Card className="overflow-hidden border-primary/30">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{styleData?.emoji ?? '🤖'}</span>
            <div>
              <div className="text-sm font-bold">{styleData?.label ?? 'Explanation'}</div>
              <div className="text-xs text-muted-foreground">Thinking it through...</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Crafting your {styleData?.label.toLowerCase()}...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // The shared header content (avatar + title + badges). Rendered both in the
  // inline card and the fullscreen overlay so they look consistent.
  const headerInfo = (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${styleData?.accent} text-xl shadow-sm`}
        aria-hidden
      >
        {styleData?.emoji ?? '🤖'}
      </div>
      <div>
        <div className="text-sm font-bold">{styleData?.label ?? 'Explanation'}</div>
        <div className="flex flex-wrap items-center gap-1.5">
          {subjectData && (
            <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[10px]">
              <span>{subjectData.emoji}</span> {subjectData.label}
            </Badge>
          )}
          {topicData && (
            <Badge variant="outline" className="gap-1 px-1.5 py-0 text-[10px]">
              <span>{topicData.emoji}</span> {topicData.label}
            </Badge>
          )}
          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
            <Volume2 className="mr-1 h-2.5 w-2.5" />
            {language}
          </Badge>
        </div>
      </div>
    </div>
  )

  // Shared action buttons used in both views.
  const actionButtons = (variant: 'inline' | 'fullscreen') => (
    <div className="flex items-center gap-2">
      {onRegenerate && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onRegenerate}
          className="gap-1.5"
          title="Regenerate"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Regenerate
        </Button>
      )}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        className="gap-1.5"
        title="Copy answer"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" /> Copy
          </>
        )}
      </Button>
      {variant === 'inline' ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setIsFullscreen(true)}
          className="gap-1.5"
          title="View explanation in full screen"
        >
          <Maximize2 className="h-3.5 w-3.5" /> Full screen
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setIsFullscreen(false)}
          className="gap-1.5"
          title="Exit full screen (Esc)"
        >
          <Minimize2 className="h-3.5 w-3.5" /> Exit
        </Button>
      )}
    </div>
  )

  return (
    <>
      <Card className="overflow-hidden border-primary/30 ww-shadow-card">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/30 p-4">
          {headerInfo}
          {actionButtons('inline')}
        </CardHeader>
        <CardContent className="p-4">
          <Markdown content={answer} />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-border pt-3">
            <VoicePlayer text={answer} voiceId={language} />
            <span className="text-xs text-muted-foreground">
              🔊 Voice-over reads the first ~1200 chars
            </span>
          </div>
        </CardContent>
      </Card>

      {mounted &&
        isFullscreen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Full-screen explanation"
          >
            {/* Sticky header with title + actions */}
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/40 px-4 py-3 backdrop-blur">
              {headerInfo}
              <div className="flex items-center gap-1.5">
                {actionButtons('fullscreen')}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsFullscreen(false)}
                  className="ml-1 h-8 w-8"
                  title="Close (Esc)"
                  aria-label="Close full screen"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable content area, centered & width-capped for readability */}
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
                <Markdown content={answer} />
                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-4">
                  <VoicePlayer text={answer} voiceId={language} />
                  <span className="text-xs text-muted-foreground">
                    🔊 Voice-over reads the first ~1200 chars · Press{' '}
                    <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono">
                      Esc
                    </kbd>{' '}
                    to exit
                  </span>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
