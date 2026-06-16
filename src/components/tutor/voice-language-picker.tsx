'use client'

import { VOICES } from '@/lib/languages'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (id: string) => void
}

export function VoiceLanguagePicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {VOICES.map((v) => {
        const active = v.id === value
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onChange(v.id)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card hover:border-primary/40'
            )}
          >
            <span className="text-base">{v.flag}</span>
            <span>{v.nativeLabel}</span>
            <span className="text-xs text-muted-foreground">({v.label})</span>
          </button>
        )
      })}
    </div>
  )
}
