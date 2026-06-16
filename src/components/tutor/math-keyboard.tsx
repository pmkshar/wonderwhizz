'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Keyboard, X, Delete, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MathKeyboardProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  onSubmit?: () => void
  disabled?: boolean
}

type KeyDef = {
  id: string
  label: string
  symbol: string
}

type KeyPad = {
  id: string
  title: string
  gradient: string
  keys: KeyDef[]
}

const PADS: Record<string, KeyPad> = {
  basic: {
    title: 'Basic',
    gradient: 'from-emerald-400 to-teal-500',
    keys: [
      { id: 'plus', label: '+', symbol: '+' },
      { id: 'minus', label: '−', symbol: '-' },
      { id: 'multiply', label: '×', symbol: '×' },
      { id: 'divide', label: '÷', symbol: '÷' },
      { id: 'equals', label: '=', symbol: '=' },
      { id: 'neq', label: '≠', symbol: '≠' },
      { id: 'lt', label: '<', symbol: '<' },
      { id: 'gt', label: '>', symbol: '>' },
      { id: 'leq', label: '≤', symbol: '≤' },
      { id: 'geq', label: '≥', symbol: '≥' },
      { id: 'approx', label: '≈', symbol: '≈' },
      { id: 'paren', label: '( )', symbol: '()' },
    ],
  },
  power: {
    title: 'Powers',
    gradient: 'from-amber-400 to-orange-500',
    keys: [
      { id: 'sq', label: 'x²', symbol: '²' },
      { id: 'cube', label: 'x³', symbol: '³' },
      { id: 'pow', label: 'x^n', symbol: '^' },
      { id: 'sqrt', label: '√', symbol: '√' },
      { id: 'cbrt', label: '∛', symbol: '∛' },
      { id: 'nthrt', label: 'ⁿ√', symbol: 'ⁿ√' },
      { id: 'sub', label: 'x_n', symbol: '_' },
      { id: 'reciprocal', label: '1/x', symbol: '1/' },
      { id: 'frac', label: 'a/b', symbol: '/' },
      { id: 'infinity', label: '∞', symbol: '∞' },
      { id: 'abs', label: '|x|', symbol: '||' },
      { id: 'dot', label: '·', symbol: '·' },
    ],
  },
  constants: {
    title: 'Constants',
    gradient: 'from-cyan-400 to-sky-500',
    keys: [
      { id: 'pi', label: 'π', symbol: 'π' },
      { id: 'e', label: 'e', symbol: 'e' },
      { id: 'i', label: 'i', symbol: 'i' },
      { id: 'phi', label: 'φ', symbol: 'φ' },
      { id: 'theta', label: 'θ', symbol: 'θ' },
      { id: 'alpha', label: 'α', symbol: 'α' },
      { id: 'beta', label: 'β', symbol: 'β' },
      { id: 'gamma', label: 'γ', symbol: 'γ' },
      { id: 'lambda', label: 'λ', symbol: 'λ' },
      { id: 'mu', label: 'μ', symbol: 'μ' },
      { id: 'sigma', label: 'σ', symbol: 'σ' },
      { id: 'delta', label: 'Δ', symbol: 'Δ' },
    ],
  },
  functions: {
    title: 'Functions',
    gradient: 'from-rose-400 to-pink-500',
    keys: [
      { id: 'sin', label: 'sin', symbol: 'sin(' },
      { id: 'cos', label: 'cos', symbol: 'cos(' },
      { id: 'tan', label: 'tan', symbol: 'tan(' },
      { id: 'csc', label: 'csc', symbol: 'csc(' },
      { id: 'sec', label: 'sec', symbol: 'sec(' },
      { id: 'cot', label: 'cot', symbol: 'cot(' },
      { id: 'log', label: 'log', symbol: 'log(' },
      { id: 'ln', label: 'ln', symbol: 'ln(' },
      { id: 'exp', label: 'e^', symbol: 'e^' },
      { id: 'abs_fn', label: 'abs', symbol: 'abs(' },
      { id: 'lim', label: 'lim', symbol: 'lim_' },
      { id: 'sum', label: 'Σ', symbol: 'Σ' },
    ],
  },
  calculus: {
    title: 'Calculus',
    gradient: 'from-violet-400 to-purple-500',
    keys: [
      { id: 'int', label: '∫', symbol: '∫' },
      { id: 'int_def', label: '∫_a^b', symbol: '∫_a^b ' },
      { id: 'd_dx', label: 'd/dx', symbol: 'd/dx ' },
      { id: 'partial', label: '∂', symbol: '∂' },
      { id: 'partial2', label: '∂²', symbol: '∂²' },
      { id: 'lim2', label: 'lim→0', symbol: 'lim_(x→0) ' },
      { id: 'rightarrow', label: '→', symbol: '→' },
      { id: 'Rightarrow', label: '⇒', symbol: '⇒' },
      { id: 'therefore', label: '∴', symbol: '∴' },
      { id: 'because', label: '∵', symbol: '∵' },
      { id: 'forall', label: '∀', symbol: '∀' },
      { id: 'exists', label: '∃', symbol: '∃' },
    ],
  },
  geometry: {
    title: 'Geometry',
    gradient: 'from-lime-400 to-green-500',
    keys: [
      { id: 'triangle', label: '△', symbol: '△' },
      { id: 'angle', label: '∠', symbol: '∠' },
      { id: 'perp', label: '⊥', symbol: '⊥' },
      { id: 'parallel', label: '∥', symbol: '∥' },
      { id: 'degree', label: '°', symbol: '°' },
      { id: 'circle', label: '○', symbol: '○' },
      { id: 'square_sym', label: '□', symbol: '□' },
      { id: 'cong', label: '≅', symbol: '≅' },
      { id: 'sim', label: '∼', symbol: '∼' },
      { id: 'arc', label: '⌒', symbol: '⌒' },
      { id: 'vector', label: '⃗', symbol: '⃗' },
      { id: 'in', label: '∈', symbol: '∈' },
    ],
  },
}

const PAD_IDS = Object.keys(PADS)

export function MathKeyboard({
  value,
  onChange,
  placeholder,
  rows = 4,
  onSubmit,
  disabled,
}: MathKeyboardProps) {
  const [open, setOpen] = useState(false)
  const [activePad, setActivePad] = useState<string>('basic')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [selStart, setSelStart] = useState(0)
  const [selEnd, setSelEnd] = useState(0)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    const onSelect = () => {
      setSelStart(el.selectionStart ?? 0)
      setSelEnd(el.selectionEnd ?? 0)
    }
    el.addEventListener('keyup', onSelect)
    el.addEventListener('click', onSelect)
    el.addEventListener('select', onSelect)
    return () => {
      el.removeEventListener('keyup', onSelect)
      el.removeEventListener('click', onSelect)
      el.removeEventListener('select', onSelect)
    }
  }, [open])

  function insertSymbol(symbol: string) {
    const el = textareaRef.current
    const start = el?.selectionStart ?? selStart
    const end = el?.selectionEnd ?? selEnd
    const newValue = value.slice(0, start) + symbol + value.slice(end)
    onChange(newValue)
    const newCursor = start + symbol.length
    setTimeout(() => {
      if (el) {
        el.focus()
        el.setSelectionRange(newCursor, newCursor)
        setSelStart(newCursor)
        setSelEnd(newCursor)
      }
    }, 0)
  }

  function handleBackspace() {
    const el = textareaRef.current
    const start = el?.selectionStart ?? selStart
    const end = el?.selectionEnd ?? selEnd
    if (start === end && start === 0) return
    const realStart = start === end ? start - 1 : start
    const realEnd = end
    const newValue = value.slice(0, realStart) + value.slice(realEnd)
    onChange(newValue)
    setTimeout(() => {
      if (el) {
        el.focus()
        el.setSelectionRange(realStart, realStart)
        setSelStart(realStart)
        setSelEnd(realStart)
      }
    }, 0)
  }

  function handleClear() {
    onChange('')
    setTimeout(() => {
      const el = textareaRef.current
      if (el) {
        el.focus()
        el.setSelectionRange(0, 0)
        setSelStart(0)
        setSelEnd(0)
      }
    }, 0)
  }

  const pad = PADS[activePad]

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && onSubmit) {
              e.preventDefault()
              onSubmit()
            }
          }}
          rows={rows}
          placeholder={placeholder ?? 'Type or use the math keyboard...'}
          disabled={disabled}
          className="resize-y pr-12 text-base"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-pressed={open}
          className={cn(
            'absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
            open
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background hover:bg-muted'
          )}
          title="Toggle math keyboard"
        >
          <Keyboard className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="mb-2 flex flex-wrap gap-1">
            {PAD_IDS.map((id) => {
              const p = PADS[id]
              const active = id === activePad
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActivePad(id)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold transition-all',
                    active
                      ? `bg-gradient-to-r ${p.gradient} text-white shadow-sm`
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  )}
                >
                  {p.title}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
            {pad.keys.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => insertSymbol(k.symbol)}
                disabled={disabled}
                title={k.label}
                className="flex h-11 items-center justify-center rounded-md border border-border bg-background text-base font-medium transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary/5 hover:shadow-sm active:translate-y-0 disabled:opacity-50"
              >
                <span className="font-mono">{k.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-border pt-2">
            <div className="flex gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleBackspace}
                disabled={disabled || value.length === 0}
                className="gap-1.5"
              >
                <Delete className="h-3.5 w-3.5" /> Backspace
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleClear}
                disabled={disabled || value.length === 0}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="gap-1.5"
            >
              <Check className="h-3.5 w-3.5 text-emerald-600" /> Done
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
