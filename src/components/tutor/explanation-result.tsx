'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Markdown } from '@/components/markdown/markdown'
import { VoicePlayer } from './voice-player'
import { EXPLANATION_STYLES, type ExplanationStyleId } from '@/lib/explanation-prompts'
import { SUBJECTS } from './subject-selector'
import { Copy, Check, RefreshCw, Volume2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  answer: string
  subject: string
  style: ExplanationStyleId
  language: string
  loading?: boolean
  onRegenerate?: () => void
}

export function ExplanationResult({
  answer,
  subject,
  style,
  language,
  loading,
  onRegenerate,
}: Props) {
  const [copied, setCopied] = useState(false)
  const styleData = EXPLANATION_STYLES.find((s) => s.id === style)
  const subjectData = SUBJECTS.find((s) => s.id === subject)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(answer)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy')
    }
  }

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

  return (
    <Card className="overflow-hidden border-primary/30 ww-shadow-card">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/30 p-4">
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
              <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                <Volume2 className="mr-1 h-2.5 w-2.5" />
                {language}
              </Badge>
            </div>
          </div>
        </div>
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
        </div>
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
  )
}
