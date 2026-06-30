'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
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
  BookOpen,
  Mic,
} from 'lucide-react'
import {
  ExplanationStyleSelector,
} from '../explanation-styles'
import { VoiceLanguagePicker } from '../voice-language-picker'
import { MathKeyboard } from '../math-keyboard'
import { MathsTopicSelector } from '../maths-topic-selector'
import { SyllabusPicker } from '../syllabus-picker'
import { Markdown } from '@/components/markdown/markdown'
import { VoicePlayer } from '../voice-player'
import { VoiceInput } from '../voice-input'
import {
  EXPLANATION_STYLES,
  type ExplanationStyleId,
} from '@/lib/explanation-prompts'
import { SUBJECTS, getMathsTopic } from '@/lib/subjects'
import { describeSyllabusContext, getBoard, getChapter } from '@/lib/syllabus'
import { getVoiceById } from '@/lib/languages'
import {
  getSampleQuestions,
  getGeneralSampleQuestions,
  type SampleQuestion,
} from '@/lib/sample-questions'

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
  boardId?: string | null
  chapterId?: string | null
  chapterTitle?: string | null
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
  const [voiceModeActive, setVoiceModeActive] = useState(false)
  // When true, the last question was asked by voice and the answer should auto-play
  const [showSettings, setShowSettings] = useState(false)
  // Syllabus + chapter context (kept across turns so the tutor remembers)
  const [boardId, setBoardId] = useState<string | null>(null)
  const [chapterId, setChapterId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const questionRef = useRef(question)
  // Keep questionRef in sync so the VoiceInput onEnd callback sees the latest value
  questionRef.current = question

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

  // When the subject changes, re-validate the chapter against the new subject's
  // chapter list. If the new subject doesn't have the selected chapter, clear it.
  useEffect(() => {
    if (!boardId || !chapterId) return
    const ch = getChapter(boardId, subject, grade, chapterId)
    if (!ch) setChapterId(null)
  }, [subject, grade, boardId, chapterId])

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
    // Resolve chapter title up-front for display in the turn bubble header
    let chapterTitle: string | null = null
    if (boardId && chapterId) {
      const ch = getChapter(boardId, subject, grade, chapterId)
      if (ch) chapterTitle = ch.title
    }

    const newTurn: ChatTurn = {
      id: turnId,
      question: question.trim(),
      answer: '',
      subject,
      style,
      language,
      grade,
      topic: subject === 'maths' ? topic : null,
      boardId,
      chapterId,
      chapterTitle,
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
          boardId: boardId ?? undefined,
          chapterId: chapterId ?? undefined,
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
          : data.provider === 'groq'
          ? 'Answer ready! 🎉 (Groq Llama 3.3)'
          : data.provider === 'gemini'
          ? 'Answer ready! 🎉 (Gemini Flash)'
          : data.provider === 'zai'
          ? 'Answer ready! 🎉'
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
          boardId: turn.boardId ?? undefined,
          chapterId: turn.chapterId ?? undefined,
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
  const voice = getVoiceById(language)
  const boardData = boardId ? getBoard(boardId) : undefined
  const chapterData =
    boardId && chapterId ? getChapter(boardId, subject, grade, chapterId) : undefined

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
          {boardData && (
            <Badge variant="outline" className="hidden sm:inline-flex gap-1 px-2 py-0.5 text-[10px]">
              <BookOpen className="h-2.5 w-2.5" />
              {boardData.shortLabel}·{grade}
            </Badge>
          )}
          {chapterData && (
            <Badge variant="outline" className="hidden md:inline-flex gap-1 px-2 py-0.5 text-[10px] max-w-[180px]">
              <span className="truncate">Ch{chapterData.number}: {chapterData.title}</span>
            </Badge>
          )}
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

      {/* Expandable settings panel — slide-out drawer so it never pushes the chat */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowSettings(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border/60 p-4">
                <div>
                  <h3 className="text-base font-bold">Tutor options</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Tailor the tutor to your school syllabus &amp; voice
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSettings(false)}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4" /> Close
                </Button>
              </div>

              <div className="ww-chat-scroll flex-1 space-y-5 overflow-y-auto p-4">
                {/* Subject — REMOVED from here (already in top bar); show current selection only */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Current subject
                  </label>
                  <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm font-semibold">
                    {subjectData?.emoji} {subjectData?.label}
                    <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                      (change via the pills above the chat)
                    </span>
                  </div>
                </div>

                {/* NEW: Syllabus / textbook context picker */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    <BookOpen className="mr-1 inline h-3 w-3" />
                    Syllabus &amp; textbook
                  </label>
                  <SyllabusPicker
                    boardId={boardId}
                    grade={grade}
                    subjectId={subject}
                    chapterId={chapterId}
                    onBoardChange={setBoardId}
                    onChapterChange={setChapterId}
                  />
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
                    Voice-over language (Indian voices)
                  </label>
                  <VoiceLanguagePicker value={language} onChange={setLanguage} />
                  <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
                    🇮🇳 All voices use your browser&apos;s built-in
                    Indian-accent speech engine — Hindi, Kannada, or Indian
                    English. Works offline, no API key needed.
                  </p>
                </div>
              </div>

              <div className="border-t border-border/60 p-3">
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowSettings(false)}
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat scroll area — takes the bulk of vertical space */}
      <div
        ref={scrollRef}
        className="ww-chat-scroll flex-1 overflow-y-auto rounded-xl border border-border/60 bg-card/40 p-3 sm:p-4"
      >
        {turns.length === 0 ? (
          <EmptyState
            subject={subject}
            boardId={boardId}
            chapterId={chapterId}
            grade={grade}
            onPickQuestion={(q) => {
              setQuestion(q)
              // Auto-focus the textarea so the student can hit Enter to send
              setTimeout(() => inputRef.current?.focus(), 0)
            }}
          />
        ) : (
          <div className="space-y-5">
            {turns.map((turn, i) => (
              <ChatTurnBubble
                key={turn.id}
                turn={turn}
                onRegenerate={() => handleRegenerate(turn.id)}
                autoPlayVoice={voiceModeActive && i === turns.length - 1 && !turn.loading}
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

      {/* Quick-question chips above the composer — only show when a chapter
          is selected so the student gets chapter-specific prompts they can
          tap to ask instantly. */}
      {boardId && chapterId && turns.length > 0 && (
        <QuickQuestionsBar
          subject={subject}
          boardId={boardId}
          chapterId={chapterId}
          grade={grade}
          onPick={(q) => {
            setQuestion(q)
            setTimeout(() => inputRef.current?.focus(), 0)
          }}
        />
      )}

      {/* Composer (input + send + voice) at the bottom */}
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
                ? `Ask your ${subjectData.label} question...  (Ctrl/⌘ + Enter to send, or tap 🎙️ Voice)`
                : 'Pick a subject first...'
            }
            className="resize-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
            maxLength={4000}
          />
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Voice input — speak your question */}
            <VoiceInput
              lang={voice?.bcp47 ?? 'en-IN'}
              onTranscript={setQuestion}
              onEnd={() => {
                // Mark that this was a voice-initiated question
                setVoiceModeActive(true)
                // Auto-submit after voice recognition ends (with a short delay
                // so the student can see the transcribed text first)
                setTimeout(() => {
                  if (questionRef.current.trim().length >= 2) {
                    handleAsk()
                  }
                }, 600)
              }}
              disabled={turns.some((t) => t.loading)}
            />
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
            {boardData && (
              <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-[10px]">
                <BookOpen className="h-2.5 w-2.5" />
                {describeSyllabusContext({
                  boardId,
                  grade,
                  subjectId: subject,
                  chapterId,
                })}
              </Badge>
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

      {/* Quick-subject switcher — bottom of composer so the student can
          instantly switch to another subject without scrolling back up.
          Shows all subjects as compact pills with the current one highlighted. */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-border/60 bg-card/40 p-1.5">
        <span className="shrink-0 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Next subject:
        </span>
        {SUBJECTS.map((s) => {
          const active = s.id === subject
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSubject(s.id)}
              aria-pressed={active}
              className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-foreground hover:bg-muted'
              }`}
            >
              <span>{s.emoji}</span>
              {s.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EmptyState({
  subject,
  boardId,
  chapterId,
  grade,
  onPickQuestion,
}: {
  subject: string
  boardId: string | null
  chapterId: string | null
  grade: number
  onPickQuestion: (q: string) => void
}) {
  const subjectData = SUBJECTS.find((s) => s.id === subject)
  // Chapter-specific sample questions if a chapter is selected; otherwise
  // fall back to the subject's general examples.
  const samples: SampleQuestion[] =
    boardId && chapterId
      ? getSampleQuestions({ boardId, grade, subjectId: subject, chapterId })
      : getGeneralSampleQuestions(subject)

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
          {boardId && chapterId ? (
            <>
              Your tutor is set to <strong>{subjectData?.label}</strong> ·{' '}
              {describeSyllabusContext({ boardId, grade, subjectId: subject, chapterId })}.
              Tap any question below or type your own.
            </>
          ) : (
            <>
              Your AI tutor is ready. Tip: open <strong>Options</strong> and pick
              your board (CBSE / ICSE / Karnataka / Maharashtra) so answers match
              your textbook.
            </>
          )}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <Sparkles className="h-3 w-3" /> Free AI · No signup · Always on
        </span>
        {boardId && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
            <BookOpen className="h-3 w-3" /> Class {grade} syllabus active
          </span>
        )}
      </div>
      {samples.length > 0 && (
        <div className="mt-2 w-full max-w-lg space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {boardId && chapterId
              ? 'Chapter practice — tap to ask'
              : 'Try one of these'}
          </div>
          {samples.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPickQuestion(s.text)}
              className="group flex w-full items-start gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-left text-sm text-foreground transition-all hover:border-primary hover:bg-primary/5"
            >
              <span className="text-base leading-none">{s.emoji}</span>
              <span className="flex-1">{s.text}</span>
              <span className="shrink-0 self-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                {s.tag}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Compact quick-question bar that appears above the composer when a
 * chapter is selected AND the student has already started chatting.
 * Surfaces 3-4 chapter-specific prompts the student can tap to instantly
 * continue the conversation without losing context. */
function QuickQuestionsBar({
  subject,
  boardId,
  chapterId,
  grade,
  onPick,
}: {
  subject: string
  boardId: string
  chapterId: string
  grade: number
  onPick: (q: string) => void
}) {
  const samples = getSampleQuestions({ boardId, grade, subjectId: subject, chapterId })
  if (samples.length === 0) return null
  // Only show the first 4 to keep the bar compact
  const display = samples.slice(0, 4)
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-border/60 bg-muted/20 p-1.5">
      <span className="shrink-0 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Quick ask:
      </span>
      {display.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(s.text)}
          className="shrink-0 inline-flex items-center gap-1 rounded-full border border-border/60 bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
          title={s.text}
        >
          <span>{s.emoji}</span>
          <span className="max-w-[200px] truncate">{s.text}</span>
        </button>
      ))}
    </div>
  )
}

function ChatTurnBubble({
  turn,
  onRegenerate,
  autoPlayVoice = false,
}: {
  turn: ChatTurn
  onRegenerate: () => void
  autoPlayVoice?: boolean
}) {
  const subjectData = SUBJECTS.find((s) => s.id === turn.subject)
  const styleData = EXPLANATION_STYLES.find((s) => s.id === turn.style)
  const topicData = turn.topic ? getMathsTopic(turn.topic) : undefined
  const boardData = turn.boardId ? getBoard(turn.boardId) : undefined
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
            {boardData && <span>· {boardData.shortLabel}·{turn.grade}</span>}
            {turn.chapterTitle && <span>· {turn.chapterTitle}</span>}
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
                      {turn.provider === 'pollinations'
                        ? 'free AI'
                        : turn.provider === 'groq'
                        ? 'Llama 3.3'
                        : turn.provider === 'gemini'
                        ? 'Gemini'
                        : turn.provider === 'zai'
                        ? 'ZAI'
                        : turn.provider}
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
                <VoicePlayer text={turn.answer} voiceId={turn.language} autoPlay={autoPlayVoice} />
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
