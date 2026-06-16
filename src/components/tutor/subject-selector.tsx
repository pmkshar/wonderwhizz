'use client'

import { cn } from '@/lib/utils'

export interface Subject {
  id: string
  label: string
  emoji: string
  description: string
  gradient: string
  examples: string[]
}

export const SUBJECTS: Subject[] = [
  {
    id: 'maths',
    label: 'Maths',
    emoji: '➗',
    description: 'Algebra, geometry, arithmetic, trigonometry',
    gradient: 'from-emerald-400 to-teal-500',
    examples: [
      'Solve: 2x + 5 = 17',
      'Find the area of a circle with radius 7 cm',
      'What is the LCM of 12 and 18?',
    ],
  },
  {
    id: 'hindi',
    label: 'Hindi',
    emoji: '📝',
    description: 'व्याकरण, साहित्य, पद्य, गद्य',
    gradient: 'from-orange-400 to-amber-500',
    examples: [
      'संधि के भेद उदाहरण सहित समझाइए',
      '"राम पुस्तक पढ़ता है" में कारक पहचानिए',
      'रस के प्रकार बताइए',
    ],
  },
  {
    id: 'science',
    label: 'Science',
    emoji: '🔬',
    description: 'Physics, chemistry, biology',
    gradient: 'from-cyan-400 to-sky-500',
    examples: [
      'Why is the sky blue?',
      'Explain Newton\u2019s third law of motion',
      'What is photosynthesis?',
    ],
  },
  {
    id: 'kannada',
    label: 'Kannada',
    emoji: '🦁',
    description: 'ವ್ಯಾಕರಣ, ಸಾಹಿತ್ಯ, ಪದ್ಯ, ಗದ್ಯ',
    gradient: 'from-rose-400 to-pink-500',
    examples: [
      'ಸಂಧಿಯ ಭೇದಗಳನ್ನು ಉದಾಹರಣೆಯೊಂದಿಗೆ ವಿವರಿಸಿ',
      '"ನಾನು ಪುಸ್ತಕ ಓದುತ್ತೇನೆ" ಎಂಬ ವಾಕ್ಯದಲ್ಲಿ ಕಾರಕವನ್ನು ಗುರುತಿಸಿ',
      'ರಸದ ಪ್ರಕಾರಗಳನ್ನು ತಿಳಿಸಿ',
    ],
  },
]

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
            {active && (
              <span className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
            )}
          </button>
        )
      })}
    </div>
  )
}
