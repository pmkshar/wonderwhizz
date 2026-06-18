'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Loader2,
  BookOpen,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Trophy,
  Sparkles,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Settings2,
  X,
  Wand2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MATHS_TOPICS, SUBJECTS } from '@/lib/subjects'
import {
  getBoard,
  getChapters,
  type SyllabusChapter,
} from '@/lib/syllabus'
import { SyllabusPicker } from '../syllabus-picker'

interface QuestionBankItem {
  id: string
  grade: number
  subject: string
  topic: string
  difficulty: string
  question: string
  options: string[] | null
  hint: string | null
}

interface SubmitResponse {
  isCorrect: boolean
  correctAnswer: string
  explanation: string | null
  hint: string | null
  newlyAwarded: string[]
}

interface PracticePageProps {
  userGrade: number
  onAskTutor?: (question: string) => void
}

export function PracticePage({ userGrade, onAskTutor }: PracticePageProps) {
  const [items, setItems] = useState<QuestionBankItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    grade: String(userGrade),
    subject: 'maths',
    topic: '',
    difficulty: '',
  })
  // Syllabus context (board + chapter) — mirrors the Ask Tutor options so
  // practice can also be textbook-aligned. When a chapter is selected, we
  // prefer questions tagged with that chapter's topic strings.
  const [boardId, setBoardId] = useState<string | null>(null)
  const [chapterId, setChapterId] = useState<string | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [active, setActive] = useState<QuestionBankItem | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResponse | null>(null)
  const [showHint, setShowHint] = useState(false)
  // AI-generated fallback questions when no QuestionBank items match.
  const [aiQuestions, setAiQuestions] = useState<QuestionBankItem[]>([])
  const [generatingAi, setGeneratingAi] = useState(false)

  const subjectData = SUBJECTS.find((s) => s.id === filters.subject)
  const availableTopics =
    filters.subject === 'maths'
      ? MATHS_TOPICS.map((t) => ({ id: t.id, label: t.label }))
      : subjectData
      ? [{ id: 'general', label: 'General' }]
      : []

  // Resolve the current chapter (if any) so we can show its title in the UI
  const currentChapter: SyllabusChapter | null = useMemo(() => {
    if (!boardId || !chapterId) return null
    return getChapters(boardId, filters.subject, Number(filters.grade)).find(
      (c) => c.id === chapterId
    ) ?? null
  }, [boardId, chapterId, filters.subject, filters.grade])

  async function loadItems() {
    setLoading(true)
    setAiQuestions([]) // reset AI fallback when filters change
    try {
      const params = new URLSearchParams()
      params.set('grade', filters.grade)
      params.set('subject', filters.subject)
      if (filters.topic) params.set('topic', filters.topic)
      if (filters.difficulty) params.set('difficulty', filters.difficulty)
      params.set('limit', '30')
      const res = await fetch(`/api/question-bank?${params.toString()}`)
      const data = (await res.json().catch(() => ({ items: [] }))) as {
        items: QuestionBankItem[]
      }
      // If a chapter is selected, boost questions whose topic matches one of
      // the chapter's sub-topics to the top of the list.
      let items = data.items
      if (currentChapter && currentChapter.topics.length > 0) {
        const chapterTopics = new Set(
          currentChapter.topics.map((t) => t.toLowerCase())
        )
        items = [...items].sort((a, b) => {
          const aMatch = chapterTopics.has(a.topic.toLowerCase()) ? 0 : 1
          const bMatch = chapterTopics.has(b.topic.toLowerCase()) ? 0 : 1
          return aMatch - bMatch
        })
      }
      setItems(items)
    } catch {
      toast.error('Could not load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.grade, filters.subject, filters.topic, filters.difficulty, boardId, chapterId])

  function startPractice(item: QuestionBankItem) {
    setActive(item)
    setUserAnswer('')
    setResult(null)
    setShowHint(false)
  }

  async function submit() {
    if (!active) return
    if (!userAnswer.trim()) {
      toast.error('Pick or type an answer first.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionBankId: active.id,
          userAnswer: userAnswer.trim(),
          timeSpentSec: 0,
        }),
      })
      const data = (await res.json().catch(() => ({
        error: 'Could not submit',
      }))) as SubmitResponse & { error?: string }
      if (!res.ok) {
        toast.error(data.error ?? 'Could not submit')
        return
      }
      setResult(data)
      if (data.isCorrect) {
        toast.success('Correct! 🎉')
      } else {
        toast.error('Not quite — see the explanation below.')
      }
      if (data.newlyAwarded.length > 0) {
        toast(`🏆 New achievement unlocked!`, {
          description: data.newlyAwarded.join(', '),
        })
      }
    } catch {
      toast.error('Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  function nextQuestion() {
    if (!active) return
    const all = [...items, ...aiQuestions]
    const idx = all.findIndex((i) => i.id === active.id)
    const next = all[idx + 1]
    if (next) {
      startPractice(next)
    } else {
      setActive(null)
      setResult(null)
      toast.success("You've completed this batch! Pick another filter to try more.")
    }
  }

  /**
   * Generate 5 AI questions on the current chapter / subject + grade using
   * the tutor API. We ask the model to return strict JSON so we can parse
   * them as QuestionBankItem-shaped objects.
   */
  async function generateAiQuestions() {
    setGeneratingAi(true)
    try {
      const grade = filters.grade
      const subject = filters.subject
      const subjectLabel = subjectData?.label ?? subject
      const chapterHint = currentChapter
        ? `Chapter ${currentChapter.number}: ${currentChapter.title}. Topics: ${currentChapter.topics.join(', ')}.`
        : filters.topic
        ? `Topic: ${filters.topic.replace('_', ' ')}.`
        : `General ${subjectLabel} for class ${grade}.`

      // We use the tutor API but request a strict JSON response. The model
      // understands the question bank format from the system prompt.
      const prompt = `Generate 5 multiple-choice practice questions for a Class ${grade} ${subjectLabel} student.
Context: ${chapterHint}

Return ONLY a JSON array (no markdown, no commentary) where each item has:
- "question": string (the question text)
- "options": array of 4 strings (the 4 choices)
- "correctAnswer": string (must EXACTLY match one of the options)
- "explanation": string (1-2 sentence explanation)
- "hint": string (short hint, can be empty string)
- "difficulty": "easy" | "medium" | "hard"
- "topic": string (one of: ${availableTopics.map((t) => t.id).join(', ')})

Make questions varied in difficulty (mix easy/medium/hard). Make sure correctAnswer EXACTLY matches one of the options. Return ONLY the JSON array.`

      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          style: 'concise',
          grade: Number(grade),
          question: prompt,
          language: 'en',
          topic: filters.topic || undefined,
          boardId: boardId ?? undefined,
          chapterId: chapterId ?? undefined,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        answer?: string
        error?: string
      }
      if (!res.ok || !data.answer) {
        throw new Error(data.error ?? 'AI question generation failed.')
      }

      // Parse the JSON array out of the answer (model may wrap in markdown)
      const jsonStr = data.answer
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      const parsed = JSON.parse(jsonStr) as Array<{
        question: string
        options: string[]
        correctAnswer: string
        explanation: string
        hint: string
        difficulty: string
        topic: string
      }>

      // Wrap as QuestionBankItem (with a synthetic id — these are NOT persisted)
      const batchTs = Date.now()
      const aiItems: QuestionBankItem[] = parsed.map((q, i) => {
        const itemId = `ai-${batchTs}-${i}`
        // Stash the correctAnswer + explanation in module-scoped storage so
        // submit() can find them. (We can't call /api/practice for AI items
        // because they're not in the DB.)
        AI_ANSWER_MAP[itemId] = {
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        }
        return {
          id: itemId,
          grade: Number(grade),
          subject,
          topic: q.topic || filters.topic || 'general',
          difficulty: q.difficulty || 'medium',
          question: q.question,
          options: q.options,
          hint: q.hint || null,
        }
      })

      setAiQuestions(aiItems)
      toast.success(`Generated ${aiItems.length} AI questions! 🎉`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate questions.'
      toast.error(msg)
    } finally {
      setGeneratingAi(false)
    }
  }

  /**
   * Handle submit for AI-generated questions (since they aren't in the DB,
   * /api/practice will 404 — we check locally instead).
   */
  function submitAiQuestion(item: QuestionBankItem, answer: string) {
    const meta = AI_ANSWER_MAP[item.id]
    if (!meta) {
      toast.error('Could not verify answer — try another question.')
      return
    }
    const normalize = (s: string) =>
      s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,;]+$/g, '')
    const isCorrect = normalize(answer) === normalize(meta.correctAnswer)
    setResult({
      isCorrect,
      correctAnswer: meta.correctAnswer,
      explanation: meta.explanation,
      hint: null,
      newlyAwarded: [],
    })
    if (isCorrect) toast.success('Correct! 🎉')
    else toast.error('Not quite — see the explanation below.')
  }

  const allItems = [...items, ...aiQuestions]
  const noItems = allItems.length === 0 && !loading
  const boardData = boardId ? getBoard(boardId) : undefined

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">🎯 Practice Questions</h1>
          <p className="text-sm text-muted-foreground">
            Curated questions for every grade &amp; topic. Pick your board &amp; chapter for textbook-aligned practice.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={showOptions ? 'default' : 'outline'}
          onClick={() => setShowOptions((v) => !v)}
          className="gap-1.5 shrink-0"
        >
          <Settings2 className="h-3.5 w-3.5" />
          {showOptions ? 'Hide' : 'Options'}
        </Button>
      </div>

      {/* Syllabus context badge (visible when board/chapter selected) */}
      {(boardData || currentChapter) && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/60 p-2.5 dark:border-blue-900 dark:bg-blue-950/20">
          <BookOpen className="h-4 w-4 text-blue-700 dark:text-blue-400" />
          {boardData && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {boardData.emoji} {boardData.shortLabel} · Class {filters.grade}
            </Badge>
          )}
          {currentChapter && (
            <Badge variant="outline" className="text-xs">
              Ch {currentChapter.number}: {currentChapter.title}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            Practice is sorted to prefer this chapter&apos;s topics.
          </span>
        </div>
      )}

      {/* Slide-out Options drawer (same pattern as Ask Tutor) */}
      <AnimatePresence>
        {showOptions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowOptions(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border/60 p-4">
                <div>
                  <h3 className="text-base font-bold">Practice options</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Pick your board + chapter for textbook-aligned practice
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowOptions(false)}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4" /> Close
                </Button>
              </div>
              <div className="ww-chat-scroll flex-1 space-y-5 overflow-y-auto p-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    <BookOpen className="mr-1 inline h-3 w-3" />
                    Syllabus &amp; textbook
                  </label>
                  <SyllabusPicker
                    boardId={boardId}
                    grade={Number(filters.grade)}
                    subjectId={filters.subject}
                    chapterId={chapterId}
                    onBoardChange={setBoardId}
                    onChapterChange={setChapterId}
                  />
                </div>
                <p className="rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-[11px] leading-snug text-muted-foreground">
                  Tip: pick your board + chapter and we&apos;ll surface practice
                  questions that match the textbook&apos;s topic order. If no
                  questions match, tap &quot;Generate AI questions&quot; for
                  instant chapter-specific practice.
                </p>
              </div>
              <div className="border-t border-border/60 p-3">
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowOptions(false)}
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filters */}
      <Card>
        <CardContent className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
          <Select
            value={filters.grade}
            onValueChange={(v) => setFilters((f) => ({ ...f, grade: v }))}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                <SelectItem key={g} value={String(g)}>
                  Class {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.subject}
            onValueChange={(v) => setFilters((f) => ({ ...f, subject: v, topic: '' }))}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.emoji} {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.topic || 'all'}
            onValueChange={(v) => setFilters((f) => ({ ...f, topic: v === 'all' ? '' : v }))}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All topics</SelectItem>
              {availableTopics.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.difficulty || 'all'}
            onValueChange={(v) => setFilters((f) => ({ ...f, difficulty: v === 'all' ? '' : v }))}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any difficulty</SelectItem>
              <SelectItem value="easy">🟢 Easy</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="hard">🔴 Hard</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* List / Active question */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !active ? (
        noItems ? (
          <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
            <div className="text-4xl">🔍</div>
            <div className="mt-2 font-semibold">No questions found for these filters</div>
            <div className="text-sm text-muted-foreground">
              Try different filters — or let AI generate 5 fresh questions for you.
            </div>
            <Button
              type="button"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={generateAiQuestions}
              disabled={generatingAi}
            >
              {generatingAi ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-3.5 w-3.5" /> Generate AI questions
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{items.length}</span> curated questions
                {aiQuestions.length > 0 && (
                  <span className="ml-2 rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-400">
                    + {aiQuestions.length} AI-generated
                  </span>
                )}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={generateAiQuestions}
                disabled={generatingAi}
                className="gap-1.5"
              >
                {generatingAi ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3.5 w-3.5" /> Generate AI questions
                  </>
                )}
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {allItems.map((q, idx) => {
                const isAi = q.id.startsWith('ai-')
                return (
                  <motion.button
                    key={q.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                    onClick={() => startPractice(q)}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white shadow-sm',
                        isAi
                          ? 'bg-violet-500'
                          : q.difficulty === 'easy'
                          ? 'bg-emerald-500'
                          : q.difficulty === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      )}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="line-clamp-2 text-sm font-medium">{q.question}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                          {q.topic.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                          {q.options ? 'MCQ' : 'Free response'}
                        </Badge>
                        {isAi && (
                          <Badge
                            variant="outline"
                            className="px-1.5 py-0 text-[10px] border-violet-400 text-violet-700"
                          >
                            ✨ AI
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </motion.button>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" /> Every correct answer earns achievements &amp;
              builds your streak!
            </div>
          </>
        )
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-3"
          >
            {/* Question header */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActive(null)}
                className="mr-1 gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Back to list
              </Button>
              <Badge variant="secondary">Class {active.grade}</Badge>
              <Badge variant="outline">{active.subject}</Badge>
              <Badge variant="outline">{active.topic.replace('_', ' ')}</Badge>
              <Badge
                variant="outline"
                className={cn(
                  active.difficulty === 'easy' && 'border-emerald-400 text-emerald-700',
                  active.difficulty === 'medium' && 'border-amber-400 text-amber-700',
                  active.difficulty === 'hard' && 'border-rose-400 text-rose-700'
                )}
              >
                {active.difficulty}
              </Badge>
              {active.id.startsWith('ai-') && (
                <Badge variant="outline" className="border-violet-400 text-violet-700">
                  ✨ AI-generated
                </Badge>
              )}
            </div>

            {/* Question */}
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Question</div>
              <div className="mt-1 text-base font-semibold">{active.question}</div>
            </div>

            {/* Answer area */}
            {!result ? (
              <>
                {active.options ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Choose your answer:</div>
                    {active.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setUserAnswer(opt)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all hover:border-primary hover:bg-primary/5',
                          userAnswer === opt ? 'border-primary bg-primary/10' : 'border-border'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                            userAnswer === opt
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="flex-1 text-sm">{opt}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Type your answer:</div>
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="e.g. 42, x=6, 154 cm²"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !submitting) {
                          if (active.id.startsWith('ai-')) {
                            submitAiQuestion(active, userAnswer)
                          } else {
                            submit()
                          }
                        }
                      }}
                    />
                  </div>
                )}

                {active.hint && (
                  <div>
                    {showHint ? (
                      <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          <div className="font-semibold">Hint</div>
                          <div>{active.hint}</div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHint(true)}
                        className="gap-1.5 text-amber-700"
                      >
                        <Lightbulb className="h-3.5 w-3.5" /> Show hint
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      if (active.id.startsWith('ai-')) {
                        submitAiQuestion(active, userAnswer)
                      } else {
                        submit()
                      }
                    }}
                    disabled={submitting || !userAnswer.trim()}
                    className="gap-1.5"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Submit answer
                  </Button>
                </div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border-2 p-4',
                    result.isCorrect
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-rose-300 bg-rose-50'
                  )}
                >
                  {result.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-600" />
                  )}
                  <div>
                    <div
                      className={cn(
                        'text-base font-bold',
                        result.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                      )}
                    >
                      {result.isCorrect ? 'Correct! 🎉' : 'Not quite right'}
                    </div>
                    {!result.isCorrect && (
                      <div className="mt-1 text-sm text-rose-800">
                        Your answer: <strong>{userAnswer}</strong>
                        <br />
                        Correct answer: <strong>{result.correctAnswer}</strong>
                      </div>
                    )}
                  </div>
                </motion.div>

                {result.explanation && (
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                    <div className="mb-1 flex items-center gap-1.5 font-semibold">
                      <Sparkles className="h-4 w-4 text-primary" /> Explanation
                    </div>
                    <div className="whitespace-pre-wrap text-foreground">{result.explanation}</div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-end gap-2">
                  {onAskTutor && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        onAskTutor(active.question)
                      }}
                      className="gap-1.5"
                    >
                      <Sparkles className="h-4 w-4" /> Ask AI Tutor
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => startPractice(active)}
                    className="gap-1.5"
                  >
                    <RefreshCw className="h-4 w-4" /> Try again
                  </Button>
                  <Button type="button" onClick={nextQuestion} className="gap-1.5">
                    Next question <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

/**
 * Module-scoped map of AI-generated question IDs to their correctAnswer +
 * explanation. We use this because AI questions aren't in the DB and
 * /api/practice will 404 for them — we evaluate locally instead.
 */
const AI_ANSWER_MAP: Record<
  string,
  { correctAnswer: string; explanation: string }
> = {}
