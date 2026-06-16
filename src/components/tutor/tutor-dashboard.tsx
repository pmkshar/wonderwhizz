'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Smartphone, Sparkles } from 'lucide-react'
import { Header } from './header'
import { SubjectSelector, SUBJECTS } from './subject-selector'
import { ExplanationStyleSelector, ExplanationStyleLegend } from './explanation-styles'
import { QuestionInput } from './question-input'
import { ExplanationResult } from './explanation-result'
import { VoiceLanguagePicker } from './voice-language-picker'
import { MobileAppDialog } from './mobile-app-dialog'
import type { ExplanationStyleId } from '@/lib/explanation-prompts'

interface TutorDashboardProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    grade?: number | null
    provider?: string | null
  }
}

interface TutorResponse {
  answer: string
  subject: string
  style: ExplanationStyleId
  language: string
  grade: number
}

export function TutorDashboard({ user }: TutorDashboardProps) {
  const [subject, setSubject] = useState<string>('maths')
  const [style, setStyle] = useState<ExplanationStyleId>('detailed')
  const [language, setLanguage] = useState<string>('en')
  const [grade, setGrade] = useState<number>(user.grade ?? 8)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TutorResponse | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  // When subject changes, suggest a matching voice language
  useEffect(() => {
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
        body: JSON.stringify({ subject, style, grade, question, language }),
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
      })
      toast.success('Answer ready! 🎉')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        user={user}
        onGradeChange={setGrade}
        onOpenMobileApp={() => setMobileOpen(true)}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6">
        {/* Welcome strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-orange-50 via-pink-50 to-violet-50 p-4 dark:from-orange-950/30 dark:via-pink-950/30 dark:to-violet-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 text-2xl shadow-sm dark:bg-zinc-900/80">
              👋
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Hi {user.name ?? user.email?.split('@')[0]}!
              </div>
              <div className="text-xs text-muted-foreground">
                Pick a subject, type your question, and choose how you want it explained.
              </div>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setMobileOpen(true)}
            className="gap-1.5"
          >
            <Smartphone className="h-4 w-4" /> Get Mobile App
          </Button>
        </div>

        {/* Step 1: Subject */}
        <Section step={1} title="Pick a subject">
          <SubjectSelector value={subject} onChange={setSubject} />
        </Section>

        {/* Step 2: Question */}
        <Section step={2} title="Ask your question">
          <QuestionInput
            subject={subject}
            value={question}
            onChange={setQuestion}
            onSubmit={handleAsk}
            loading={loading}
          />
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
        {loading && !result && (
          <ExplanationResult
            answer=""
            subject={subject}
            style={style}
            language={language}
            loading
          />
        )}
        {result && (
          <ExplanationResult
            answer={result.answer}
            subject={result.subject}
            style={result.style}
            language={result.language}
            loading={false}
            onRegenerate={handleAsk}
          />
        )}

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
    </div>
  )
}

function Section({
  step,
  title,
  subtitle,
  children,
}: {
  step: number
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
