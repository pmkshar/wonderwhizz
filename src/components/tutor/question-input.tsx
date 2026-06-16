'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send, Sparkles, Eraser, Wand2 } from 'lucide-react'
import { SUBJECTS } from './subject-selector'

interface Props {
  subject: string
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  loading: boolean
  disabled?: boolean
}

export function QuestionInput({ subject, value, onChange, onSubmit, loading, disabled }: Props) {
  const subjectData = SUBJECTS.find((s) => s.id === subject)
  const [showExamples, setShowExamples] = useState(false)

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!loading && value.trim()) onSubmit()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="question" className="text-sm font-semibold text-foreground">
          ✍️ Type your question
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowExamples((s) => !s)}
            disabled={disabled}
            className="text-xs"
          >
            <Wand2 className="mr-1.5 h-3.5 w-3.5" />
            {showExamples ? 'Hide examples' : 'Show examples'}
          </Button>
          {value && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onChange('')}
              disabled={disabled || loading}
              className="text-xs"
            >
              <Eraser className="mr-1.5 h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      <Textarea
        id="question"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={4}
        placeholder={
          subjectData
            ? `Ask your ${subjectData.label} question here...`
            : 'Pick a subject first...'
        }
        disabled={disabled}
        className="resize-y text-base"
        maxLength={4000}
      />

      {showExamples && subjectData && (
        <div className="flex flex-wrap gap-2">
          {subjectData.examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onChange(ex)}
              disabled={disabled || loading}
              className="rounded-full border border-dashed border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50"
            >
              <Sparkles className="mr-1 inline h-3 w-3" />
              {ex}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Press <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">Ctrl/⌘ + Enter</kbd> to ask
        </p>
        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          disabled={disabled || loading || value.trim().length < 2}
          className="gap-2 font-semibold"
        >
          <Send className="h-4 w-4" />
          {loading ? 'Thinking...' : 'Ask WonderWhiz'}
        </Button>
      </div>
    </div>
  )
}
