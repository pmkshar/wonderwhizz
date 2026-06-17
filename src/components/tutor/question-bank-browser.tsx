'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MATHS_TOPICS, SUBJECTS } from '@/lib/subjects'

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

interface Props {
  userGrade: number
  onAskTutor?: (question: string) => void
}

export function QuestionBankBrowser({ userGrade, onAskTutor }: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<QuestionBankItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    grade: String(userGrade),
    subject: 'maths',
    topic: '',
    difficulty: '',
  })
  // Active practice question
  const [active, setActive] = useState<QuestionBankItem | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResponse | null>(null)
  const [showHint, setShowHint] = useState(false)

  // Available topics depend on subject
  const subjectData = SUBJECTS.find((s) => s.id === filters.subject)
  const availableTopics =
    filters.subject === 'maths'
      ? MATHS_TOPICS.map((t) => ({ id: t.id, label: t.label }))
      : subjectData
      ? [{ id: 'general', label: 'General' }]
      : []

  async function loadItems() {
    setLoading(true)
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
      setItems(data.items)
    } catch {
      toast.error('Could not load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadItems()
    }
  }, [open, filters.grade, filters.subject, filters.topic, filters.difficulty])

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
    const idx = items.findIndex((i) => i.id === active.id)
    const next = items[idx + 1]
    if (next) {
      startPractice(next)
    } else {
      setActive(null)
      setResult(null)
      toast.success("You've completed this batch! Pick another filter to try more.")
    }
  }

  return (
    <>
      <Card className="ww-shadow-card border-dashed">
        <CardContent className="flex flex-col items-center gap-3 p-5 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl shadow-sm">
            🎯
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold">Practice with Pre-Built Questions</div>
            <p className="text-xs text-muted-foreground">
              Curated questions for every grade &amp; topic. Get instant feedback, hints,
              and explanations. Earn achievements as you practice!
            </p>
          </div>
          <Button type="button" onClick={() => setOpen(true)} className="gap-1.5">
            <BookOpen className="h-4 w-4" /> Open Question Bank
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              🎯 Question Bank
              <Badge variant="secondary" className="ml-1">
                {items.length} questions
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, topic: v === 'all' ? '' : v }))
              }
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
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, difficulty: v === 'all' ? '' : v }))
              }
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
          </div>

          {/* List / Active question */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !active ? (
            items.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
                <div className="text-4xl">🔍</div>
                <div className="mt-2 font-semibold">No questions found</div>
                <div className="text-sm text-muted-foreground">
                  Try different filters or a different grade.
                </div>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((q, idx) => (
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
                        q.difficulty === 'easy'
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
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </motion.button>
                ))}
              </div>
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
                </div>

                {/* Question */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Question
                  </div>
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
                              userAnswer === opt
                                ? 'border-primary bg-primary/10'
                                : 'border-border'
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
                            if (e.key === 'Enter' && !submitting) submit()
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
                        variant="ghost"
                        onClick={() => setActive(null)}
                      >
                        Back to list
                      </Button>
                      <Button
                        type="button"
                        onClick={submit}
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
                    {/* Result */}
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
                            Correct answer:{' '}
                            <strong>{result.correctAnswer}</strong>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {result.explanation && (
                      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                        <div className="mb-1 flex items-center gap-1.5 font-semibold">
                          <Sparkles className="h-4 w-4 text-primary" /> Explanation
                        </div>
                        <div className="whitespace-pre-wrap text-foreground">
                          {result.explanation}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {onAskTutor && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            onAskTutor(active.question)
                            setOpen(false)
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

          {items.length > 0 && !active && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" /> Every correct answer earns achievements &amp;
              builds your streak!
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
