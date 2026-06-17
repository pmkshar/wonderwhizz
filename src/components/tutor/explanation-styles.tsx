'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  EXPLANATION_STYLES,
  type ExplanationStyleId,
} from '@/lib/explanation-prompts'
import { cn } from '@/lib/utils'

interface Props {
  value: ExplanationStyleId
  onChange: (id: ExplanationStyleId) => void
}

export function ExplanationStyleSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {EXPLANATION_STYLES.map((s) => {
        const active = s.id === value
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            aria-pressed={active}
            className={cn(
              'group relative flex flex-col items-start gap-1 overflow-hidden rounded-xl border-2 p-3 text-left transition-all',
              'hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-primary/40'
            )}
          >
            <div
              className={cn(
                'mb-1 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-lg shadow-sm',
                s.accent
              )}
              aria-hidden
            >
              {s.emoji}
            </div>
            <div className="text-sm font-semibold leading-tight text-foreground">
              {s.label}
            </div>
            <div className="text-xs leading-snug text-muted-foreground">
              {s.description}
            </div>
            {active && (
              <span className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export function ExplanationStyleLegend() {
  return (
    <Card className="border-dashed bg-muted/30">
      <CardContent className="p-3 text-xs text-muted-foreground">
        Tip: Try different styles for the same question to see the answer from multiple angles.
        Use <strong>Tips &amp; Tricks</strong> for exams, <strong>Code-Based</strong> for programming practice,
        and <strong>Humorous</strong> when you want a giggle while learning. 😄
      </CardContent>
    </Card>
  )
}
