'use client'

import { cn } from '@/lib/utils'
import { SUBJECTS } from '@/lib/subjects'

interface Props {
  value: string
  onChange: (id: string) => void
}

export function SubjectSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {SUBJECTS.map((s) => {
        const active = s.id === value
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            aria-pressed={active}
            className={cn(
              'group relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl border-2 p-4 transition-all',
              'hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'border-primary shadow-md'
                : 'border-border bg-card hover:border-primary/40'
            )}
          >
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow-sm transition-transform group-hover:scale-110',
                s.gradient
              )}
              aria-hidden
            >
              {s.emoji}
            </div>
            <div className="text-base font-bold text-foreground">{s.label}</div>
            <div className="text-center text-[11px] leading-tight text-muted-foreground">
              {s.description}
            </div>
            {s.hasTopics && (
              <span className="mt-0.5 rounded-full bg-primary/10 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wide text-primary">
                8 topics
              </span>
            )}
            {active && (
              <span className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
            )}
          </button>
        )
      })}
    </div>
  )
}
