'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Sparkles,
  Send,
  Settings2,
  X,
  Keyboard,
  Eraser,
  Volume2,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react'
import { SubjectSelector } from '../subject-selector'
import {
  ExplanationStyleSelector,
} from '../explanation-styles'
import { VoiceLanguagePicker } from '../voice-language-picker'
import { MathKeyboard } from '../math-keyboard'
import { MathsTopicSelector } from '../maths-topic-selector'
import { Markdown } from '@/components/markdown/markdown'
import { VoicePlayer } from '../voice-player'
import {
  EXPLANATION_STYLES,
  type ExplanationStyleId,
} from '@/lib/explanation-prompts'
import { SUBJECTS, getMathsTopic } from '@/lib/subjects'

interface AskPageProps {
  user: {
    name?: string | null
    email?: string | null
    grade?: number | null
    role?: string | null
  }
  grade: number
  onGradeChange: (g: number) => void
}

interface ChatTurn {
  id: string
  question: string
  answer: string
  subject: string
  style: ExplanationStyleId
  language: string
  grade: number
  topic?: string | null
  provider?: string
  loading?: boolean
  error?: string
}

export function AskPage({ user, grade: gradeProp }: AskPageProps) {
  const [subject, setSubject] = useState<string>('maths')
  const [topic, setTopic] = useState<string | null>(null)
  const [style, setStyle] = useState<ExplanationStyleId>('detailed')
  const [language, setLanguage] = useState<string>('en')
  const [grade] = useState<number>(gradeProp || user.grade || 8)
  const [question, setQuestion] = useState('')
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [useMathKeyboard, setUseMathKeyboard] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Pick up prefilled question from sessionStorage (e.g. sent from Practice page)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const prefill = sessionStorage.getItem('ww-prefill-question')
    if (prefill) {
      setQuestion(prefill)
      sessionStorage.removeItem('ww-prefill-question')
      toast.success('Question loaded — hit Ask WonderWhiz!')
    }
  }, [])

  useEffect(() => {
    setTopic(null)
    if (subject === 'hindi' && language === 'en') setLanguage('hi')
    if (subject === 'kannada' && language === 'en') setLanguage('kn')
  }, [subject, language])

  // Auto-scroll to bottom when a new turn is added or its answer streams in
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [turns])

  async function handleAsk() {
    if (question.trim().length < 2) {
      toast.error('Type a question first.')
      return
    }

    const turnId = `turn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const newTurn: ChatTurn = {
      id: turnId,
      question: question.trim(),
      answer: '',
      subject,
      style,
      language,
      grade,
      topic: subject === 'maths' ? topic : null,
      loading: true,
    }

    // Build conversation history from prior completed turns
    const history = turns
      .filter((t) => t.answer && !t.error)
      .slice(-6)
      .flatMap((t) => [
        { role: 'user' as const, content: t.question },
        { role: 'assistant' as const, content: t.answer },
      ])

    setTurns((prev) => [...prev, newTurn])
    setQuestion('') // Clear input after sending

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          style,
          grade,
          question: newTurn.question,
          language,
          topic: subject === 'maths' ? topic : undefined,
          history,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        answer?: string
        error?: string
        provider?: string
      }
      if (!res.ok || !data.answer) {
        throw new Error(data.error ?? 'The tutor could not answer right now.')
      }
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turnId
            ? {
                ...t,
                answer: data.answer!,
                provider: data.provider,
                loading: false,
              }
            : t
        )
      )
      toast.success(
        data.provider === 'pollinations'
          ? 'Answer ready! 🎉 (free AI)'
          : 'Answer ready! 🎉'
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turnId ? { ...t, loading: false, error: msg } : t
        )
      )
      toast.error(msg)
    }
  }

  async function handleRegenerate(turnId: string) {
    const turn = turns.find((t) => t.id === turnId)
    if (!turn) return
    setTurns((prev) =>
      prev.map((t) =>
        t.id === turnId ? { ...t, loading: true, error: undefined, answer: '' } : t
      )
    )
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: turn.subject,
          style: turn.style,
          grade: turn.grade,
          question: turn.question,
          language: turn.language,
          topic: turn.topic ?? undefined,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        answer?: string
        error?: string
        provider?: string
      }
      if (!res.ok || !data.answer) {
        throw new Error(data.error ?? 'The tutor could not answer right now.')
      }
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turnId
            ? {
                ...t,
                answer: data.answer!,
                provider: data.provider,
                loading: false,
              }
            : t
        )
      )
      toast.success('Regenerated! 🎉')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turnId ? { ...t, loading: false, error: msg } : t
        )
      )
      toast.error(msg)
    }
  }

  function handleClearChat() {
    if (turns.length === 0) return
    if (confirm('Clear the conversation?')) {
      setTurns([])
      toast.success('Chat cleared')
    }
  }

  const subjectData = SUBJECTS.find((s) => s.id === subject)
  const styleData = EXPLANATION_STYLES.find((s) => s.id === style)

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col gap-3 sm:h-[calc(100vh-7rem)]">
      {/* Top: header bar with quick subject pills + settings toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/60 p-2 backdrop-blur">
        <div className="flex flex-wrap items-center gap-1.5">
          {SUBJECTS.map((s) => {
            const active = s.id === subject
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSubject(s.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-foreground hover:bg-muted'
                }`}
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="hidden sm:inline-flex gap-1 px-2 py-0.5 text-[10px]">
            <span>{styleData?.emoji}</span>
            {styleData?.short}
          </Badge>
          {topic && (
            <Badge variant="outline" className="hidden sm:inline-flex gap-1 px-2 py-0.5 text-[10px]">
              {getMathsTopic(topic)?.emoji} {getMathsTopic(topic)?.label}
            </Badge>
          )}
          <Button
            type="button"
            size="sm"
            variant={showSettings ? 'default' : 'outline'}
            onClick={() => setShowSettings((v) => !v)}
            className="gap-1.5"
          >
            <Settings2 className="h-3.5 w-3.5" />
            {showSettings ? 'Hide options' : 'Options'}
          </Button>
        </div>
      </div>

      {/* Expandable settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-border/60">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Tutor options</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSettings(false)}
                    className="h-7 px-2"
                  >
                    <X className="h-4 w-4" /> Close
                  </Button>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Subject
                  </label>
                  <SubjectSelector value={subject} onChange={setSubject} />
                </div>

                <AnimatePresence>
                  {subject === 'maths' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                          Maths topic (optional)
                        </label>
                        <MathsTopicSelector value={topic} onChange={setTopic} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Explanation style
                  </label>
                  <ExplanationStyleSelector value={style} onChange={setStyle} />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Voice-over language
                  </label>
                  <VoiceLanguagePicker value={language} onChange={setLanguage} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat scroll area — takes the bulk of vertical space */}
      <div
        ref={scrollRef}
        className="ww-chat-scroll flex-1 overflow-y-auto rounded-xl border border-border/60 bg-card/40 p-3 sm:p-4"
      >
        {turns.length === 0 ? (
          <EmptyState subject={subject} />
        ) : (
          <div className="space-y-5">
            {turns.map((turn) => (
              <ChatTurnBubble
                key={turn.id}
                turn={turn}
                onRegenerate={() => handleRegenerate(turn.id)}
              />
            ))}
            {turns.length > 1 && (
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleClearChat}
                  className="gap-1.5 text-xs text-muted-foreground"
                >
                  <Eraser className="h-3.5 w-3.5" /> Clear conversation
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer (input + send) at the bottom */}
      <div className="rounded-xl border border-border/60 bg-card p-2.5 shadow-sm sm:p-3">
        {useMathKeyboard && subject === 'maths' ? (
          <MathKeyboard
            value={question}
            onChange={setQuestion}
            onSubmit={handleAsk}
            placeholder="Use the math keyboard to type equations, integrals, trig..."
            rows={3}
            disabled={false}
          />
        ) : (
          <Textarea
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                if (question.trim().length >= 2) handleAsk()
              }
            }}
            rows={2}
            placeholder={
              subjectData
                ? `Ask your ${subjectData.label} question...  (Ctrl/⌘ + Enter to send)`
                : 'Pick a subject first...'
            }
            className="resize-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
            maxLength={4000}
          />
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {subject === 'maths' && (
              <Button
                type="button"
                size="sm"
                variant={useMathKeyboard ? 'default' : 'ghost'}
                onClick={() => setUseMathKeyboard((v) => !v)}
                className="gap-1.5 text-xs"
              >
                <Keyboard className="h-3.5 w-3.5" />
                {useMathKeyboard ? 'Math KB on' : 'Math KB'}
              </Button>
            )}
            {question && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setQuestion('')}
                className="gap-1.5 text-xs text-muted-foreground"
              >
                <Eraser className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAsk}
            disabled={question.trim().length < 2 || turns.some((t) => t.loading)}
            className="gap-2 font-semibold"
          >
            {turns.some((t) => t.loading) ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Ask
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ subject }: { subject: string }) {
  const subjectData = SUBJECTS.find((s) => s.id === subject)
  const suggestions =
    subjectData?.examples?.slice(0, 3) ?? [
      'What is photosynthesis?',
      'Explain Pythagoras theorem',
      'How do I solve a quadratic equation?',
    ]

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-6xl"
      >
        🦉
      </motion.div>
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">Ask WonderWhiz anything</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Your AI tutor is ready. Type a question below — answers appear here in a chat
          you can scroll back through. Switch subjects and styles any time.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <Sparkles className="h-3 w-3" /> Free AI · No signup · Always on
        </span>
      </div>
      <div className="mt-2 w-full max-w-lg space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Try one of these
        </div>
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-left text-sm text-foreground"
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatTurnBubble({
  turn,
  onRegenerate,
}: {
  turn: ChatTurn
  onRegenerate: () => void
}) {
  const subjectData = SUBJECTS.find((s) => s.id === turn.subject)
  const styleData = EXPLANATION_STYLES.find((s) => s.id === turn.style)
  const topicData = turn.topic ? getMathsTopic(turn.topic) : undefined
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(turn.answer)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-2">
      {/* User question bubble (right-aligned) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-sm sm:max-w-[75%]">
          <div className="whitespace-pre-wrap break-words">{turn.question}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] opacity-80">
            <span>{subjectData?.emoji} {subjectData?.label}</span>
            {topicData && <span>· {topicData.emoji} {topicData.label}</span>}
            <span>· {styleData?.emoji} {styleData?.short}</span>
          </div>
        </div>
      </motion.div>

      {/* AI answer bubble (left-aligned) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start"
      >
        <div className="w-full max-w-[95%] rounded-2xl rounded-bl-md border border-border/60 bg-card p-3 shadow-sm sm:max-w-[90%]">
          {/* Header */}
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${styleData?.accent ?? 'from-slate-400 to-slate-600'} text-base shadow-sm`}
                aria-hidden
              >
                {styleData?.emoji ?? '🤖'}
              </div>
              <div>
                <div className="text-sm font-bold leading-tight">
                  {styleData?.label ?? 'Explanation'}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Volume2 className="h-2.5 w-2.5" />
                  {turn.language}
                  {turn.provider && (
                    <span className="ml-1 rounded bg-muted px-1 py-0 font-mono">
                      {turn.provider === 'pollinations' ? 'free AI' : turn.provider}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!turn.loading && !turn.error && turn.answer && (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={onRegenerate}
                  className="h-7 gap-1 px-2 text-xs"
                  title="Regenerate"
                >
                  <RefreshCw className="h-3 w-3" /> Again
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="h-7 gap-1 px-2 text-xs"
                  title="Copy"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Body */}
          {turn.loading ? (
            <div className="space-y-2">
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
              <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Crafting your {styleData?.label.toLowerCase()}... (free AI can take 15-25s)
              </div>
            </div>
          ) : turn.error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <div className="font-semibold">⚠️ {turn.error}</div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onRegenerate}
                className="mt-2 gap-1.5 text-xs"
              >
                <RefreshCw className="h-3 w-3" /> Try again
              </Button>
            </div>
          ) : (
            <>
              <div className="ww-prose ww-prose-compact">
                <Markdown content={turn.answer} />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-border pt-2">
                <VoicePlayer text={turn.answer} voiceId={turn.language} />
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
