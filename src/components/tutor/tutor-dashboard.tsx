'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Smartphone,
  Sparkles,
  Keyboard,
} from 'lucide-react'
import { Header } from './header'
import { SubjectSelector } from './subject-selector'
import {
  ExplanationStyleSelector,
  ExplanationStyleLegend,
} from './explanation-styles'
import { QuestionInput } from './question-input'
import { ExplanationResult } from './explanation-result'
import { VoiceLanguagePicker } from './voice-language-picker'
import { MobileAppDialog } from './mobile-app-dialog'
import { MathKeyboard } from './math-keyboard'
import { MathsTopicSelector } from './maths-topic-selector'
import { QuestionBankBrowser } from './question-bank-browser'
import { ProgressDashboard } from './progress-dashboard'
import { ParentDashboard } from './parent-dashboard'
import type { ExplanationStyleId } from '@/lib/explanation-prompts'
import { SUBJECTS } from '@/lib/subjects'

interface TutorDashboardProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    grade?: number | null
    provider?: string | null
    role?: string | null
  }
}

interface TutorResponse {
  answer: string
  subject: string
  style: ExplanationStyleId
  language: string
  grade: number
  topic?: string | null
}

export function TutorDashboard({ user }: TutorDashboardProps) {
  const isParent = user.role === 'parent'
  const [subject, setSubject] = useState<string>('maths')
  const [topic, setTopic] = useState<string | null>(null)
  const [style, setStyle] = useState<ExplanationStyleId>('detailed')
  const [language, setLanguage] = useState<string>('en')
  const [grade, setGrade] = useState<number>(user.grade ?? 8)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TutorResponse | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [progressOpen, setProgressOpen] = useState(false)
  const [parentOpen, setParentOpen] = useState(false)
  const [useMathKeyboard, setUseMathKeyboard] = useState(false)

  const subjectData = SUBJECTS.find((s) => s.id === subject)

  // When subject changes, reset topic and suggest a matching voice language
  useEffect(() => {
    setTopic(null)
    if (subject === 'hindi' && language === 'en') setLanguage('hi')
    if (subject === 'kannada' && language === 'en') setLanguage('kn')
  }, [subject, language])

  async function handleAsk() {
    if (question.trim().length < 2) {
      toast.error('Type a question first.')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          style,
          grade,
          question,
          language,
          topic: subject === 'maths' ? topic : undefined,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        answer?: string
        error?: string
      }
      if (!res.ok || !data.answer) {
        throw new Error(data.error ?? 'The tutor could not answer right now.')
      }
      setResult({
        answer: data.answer,
        subject,
        style,
        language,
        grade,
        topic: subject === 'maths' ? topic : null,
      })
      toast.success('Answer ready! 🎉')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // If parent, just show parent dashboard shortcut
  if (isParent) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header
          user={user}
          onGradeChange={setGrade}
          onOpenMobileApp={() => setMobileOpen(true)}
          onOpenParent={() => setParentOpen(true)}
        />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
          <Card className="ww-shadow-card">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="text-6xl">👨‍👩‍👧</div>
              <h1 className="text-2xl font-bold">Welcome, Parent!</h1>
              <p className="max-w-md text-sm text-muted-foreground">
                You&apos;re signed in as a parent. Open the Parent Dashboard to
                link your child&apos;s account and monitor their progress,
                achievements, and learning activity.
              </p>
              <Button
                size="lg"
                onClick={() => setParentOpen(true)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" /> Open Parent Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <footer className="mt-auto border-t border-border/60 bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground">
            WonderWhiz · AI Tutor for Kids · Made with 💛
          </div>
        </footer>
        <ParentDashboard
          open={parentOpen}
          onOpenChange={setParentOpen}
          onSwitchToStudent={async () => {
            // Switch back to student mode (parent can still switch back later)
            await fetch('/api/user', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: 'student' }),
            })
            toast.success('Switched to student mode')
            setTimeout(() => window.location.reload(), 500)
          }}
        />
        <MobileAppDialog open={mobileOpen} onOpenChange={setMobileOpen} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        user={user}
        onGradeChange={setGrade}
        onOpenMobileApp={() => setMobileOpen(true)}
        onOpenProgress={() => setProgressOpen(true)}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6">
        {/* Welcome strip with progress shortcut */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-orange-50 via-pink-50 to-violet-50 p-4 dark:from-orange-950/30 dark:via-pink-950/30 dark:to-violet-950/30"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 text-2xl shadow-sm dark:bg-zinc-900/80"
            >
              👋
            </motion.div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Hi {user.name ?? user.email?.split('@')[0]}!
              </div>
              <div className="text-xs text-muted-foreground">
                Pick a subject, type your question, and choose how you want it explained.
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setProgressOpen(true)}
              className="gap-1.5"
            >
              📊 My Progress
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setMobileOpen(true)}
              className="gap-1.5"
            >
              <Smartphone className="h-4 w-4" /> Mobile App
            </Button>
          </div>
        </motion.div>

        {/* Question bank shortcut */}
        <QuestionBankBrowser
          userGrade={grade}
          onAskTutor={(q) => {
            setQuestion(q)
            toast.success('Question loaded into the input box — pick a style and ask!')
          }}
        />

        {/* Step 1: Subject */}
        <Section step={1} title="Pick a subject">
          <SubjectSelector value={subject} onChange={setSubject} />
        </Section>

        {/* Step 1.5: Maths topic (only for maths) */}
        <AnimatePresence>
          {subject === 'maths' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Section
                step={'1½' as never}
                title="Pick a maths topic (optional)"
                subtitle="Pre-Algebra · Algebra · Geometry · Trig · Calculus · Statistics · Linear Algebra · Word Problems"
              >
                <MathsTopicSelector value={topic} onChange={setTopic} />
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Question with optional math keyboard */}
        <Section step={2} title="Ask your question">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">
                ✍️ Type your question
              </label>
              <div className="flex items-center gap-2">
                {subject === 'maths' && (
                  <Button
                    type="button"
                    size="sm"
                    variant={useMathKeyboard ? 'default' : 'outline'}
                    onClick={() => setUseMathKeyboard((v) => !v)}
                    className="gap-1.5"
                  >
                    <Keyboard className="h-3.5 w-3.5" />
                    {useMathKeyboard ? 'Math keyboard on' : 'Math keyboard'}
                  </Button>
                )}
              </div>
            </div>

            {useMathKeyboard && subject === 'maths' ? (
              <MathKeyboard
                value={question}
                onChange={setQuestion}
                onSubmit={handleAsk}
                placeholder="Use the math keyboard to type equations, integrals, trig..."
                rows={4}
                disabled={loading}
              />
            ) : (
              <QuestionInput
                subject={subject}
                value={question}
                onChange={setQuestion}
                onSubmit={handleAsk}
                loading={loading}
              />
            )}

            {topic && (
              <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary">
                Focused on: <strong>{topic.replace('_', ' ')}</strong>
              </div>
            )}
          </div>
        </Section>

        {/* Step 3: Explanation style */}
        <Section
          step={3}
          title="Choose how to explain"
          subtitle="Try multiple styles for the same question!"
        >
          <ExplanationStyleSelector value={style} onChange={setStyle} />
          <ExplanationStyleLegend />
        </Section>

        {/* Step 4: Voice-over language */}
        <Section step={4} title="Voice-over language">
          <VoiceLanguagePicker value={language} onChange={setLanguage} />
        </Section>

        {/* Submit (mobile-friendly sticky CTA) */}
        <div className="sticky bottom-3 z-30">
          <Button
            type="button"
            size="lg"
            onClick={handleAsk}
            disabled={loading || question.trim().length < 2}
            className="w-full gap-2 text-base font-bold shadow-lg sm:hidden"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Thinking...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" /> Ask WonderWhiz
              </>
            )}
          </Button>
        </div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {loading && !result && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ExplanationResult
                answer=""
                subject={subject}
                style={style}
                language={language}
                topic={topic}
                loading
              />
            </motion.div>
          )}
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ExplanationResult
                answer={result.answer}
                subject={result.subject}
                style={result.style}
                language={result.language}
                topic={result.topic ?? null}
                loading={false}
                onRegenerate={handleAsk}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !loading && (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <div className="text-5xl">🦉</div>
              <div className="text-base font-semibold">Your answer will appear here</div>
              <div className="max-w-md text-sm text-muted-foreground">
                Pick a subject, type a question, choose an explanation style, then hit{' '}
                <strong>Ask WonderWhiz</strong>. You can switch styles any time to see the same
                problem from a different angle.
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {SUBJECTS.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs"
                  >
                    {s.emoji} {s.label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="mt-auto border-t border-border/60 bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">WonderWhiz</span> · AI Tutor for Kids
          </div>
          <div className="flex items-center gap-3">
            <span>Made with 💛 for curious minds</span>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
            >
              <Smartphone className="h-3.5 w-3.5" /> Mobile App
            </button>
          </div>
        </div>
      </footer>

      <MobileAppDialog open={mobileOpen} onOpenChange={setMobileOpen} />
      <ProgressDashboard open={progressOpen} onOpenChange={setProgressOpen} />
    </div>
  )
}

function Section({
  step,
  title,
  subtitle,
  children,
}: {
  step: number | string
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <Card className="ww-shadow-card">
      <CardHeader className="flex flex-row items-start gap-3 border-b border-border/60 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {step}
        </div>
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">{children}</CardContent>
    </Card>
  )
}
