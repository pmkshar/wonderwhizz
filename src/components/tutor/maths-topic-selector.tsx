'use client'

import { cn } from '@/lib/utils'
import { MATHS_TOPICS } from '@/lib/subjects'

interface Props {
  value: string | null
  onChange: (id: string | null) => void
}

export function MathsTopicSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Pick a maths topic for more focused answers, or skip to ask a general maths question.
        </p>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Clear topic
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {MATHS_TOPICS.map((t) => {
          const active = t.id === value
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(active ? null : t.id)}
              aria-pressed={active}
              className={cn(
                'group relative flex flex-col items-start gap-1 overflow-hidden rounded-xl border-2 p-3 text-left transition-all',
                'hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-base font-bold text-white shadow-sm',
                    t.gradient
                  )}
                  aria-hidden
                >
                  {t.emoji}
                </div>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {t.grades}
                </span>
              </div>
              <div className="text-sm font-semibold leading-tight text-foreground">
                {t.label}
              </div>
              <div className="text-[11px] leading-snug text-muted-foreground">
                {t.description}
              </div>
              {active && (
                <span className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
