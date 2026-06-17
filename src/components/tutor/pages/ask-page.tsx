'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, Keyboard } from 'lucide-react'
import { SubjectSelector } from '../subject-selector'
import {
  ExplanationStyleSelector,
  ExplanationStyleLegend,
} from '../explanation-styles'
import { QuestionInput } from '../question-input'
import { ExplanationResult } from '../explanation-result'
import { VoiceLanguagePicker } from '../voice-language-picker'
import { MathKeyboard } from '../math-keyboard'
import { MathsTopicSelector } from '../maths-topic-selector'
import type { ExplanationStyleId } from '@/lib/explanation-prompts'
import { SUBJECTS } from '@/lib/subjects'

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

interface TutorResponse {
  answer: string
  subject: string
  style: ExplanationStyleId
  language: string
  grade: number
  topic?: string | null
}

export function AskPage({ user, grade: gradeProp }: AskPageProps) {
  const [subject, setSubject] = useState<string>('maths')
  const [topic, setTopic] = useState<string | null>(null)
  const [style, setStyle] = useState<ExplanationStyleId>('detailed')
  const [language, setLanguage] = useState<string>('en')
  const [grade] = useState<number>(gradeProp || user.grade || 8)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TutorResponse | null>(null)
  const [useMathKeyboard, setUseMathKeyboard] = useState(false)

  // Pick up prefilled question from sessionStorage (e.g. sent from Practice page)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const prefill = sessionStorage.getItem('ww-prefill-question')
    if (prefill) {
      setQuestion(prefill)
      sessionStorage.removeItem('ww-prefill-question')
      toast.success('Question loaded — pick a style and ask!')
    }
  }, [])

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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ask WonderWhiz 🦉</h1>
          <p className="text-sm text-muted-foreground">
            Pick a subject, type your question, choose a style — and learn!
          </p>
        </div>
      </div>

      {/* Step 1: Subject */}
      <Section step={1} title="Pick a subject">
        <SubjectSelector value={subject} onChange={setSubject} />
      </Section>

      {/* Step 1.5: Maths topic */}
      <AnimatePresence>
        {subject === 'maths' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Section
              step="2"
              title="Pick a maths topic (optional)"
              subtitle="Pre-Algebra · Algebra · Geometry · Trig · Calculus · Statistics · Linear Algebra · Word Problems"
            >
              <MathsTopicSelector value={topic} onChange={setTopic} />
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 2/3: Question */}
      <Section step={subject === 'maths' ? 3 : 2} title="Ask your question">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">✍️ Type your question</label>
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

      {/* Step: Style */}
      <Section step={subject === 'maths' ? 4 : 3} title="Choose how to explain" subtitle="Try multiple styles for the same question!">
        <ExplanationStyleSelector value={style} onChange={setStyle} />
        <ExplanationStyleLegend />
      </Section>

      {/* Step: Voice */}
      <Section step={subject === 'maths' ? 5 : 4} title="Voice-over language">
        <VoiceLanguagePicker value={language} onChange={setLanguage} />
      </Section>

      {/* Sticky mobile CTA */}
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
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">{children}</CardContent>
    </Card>
  )
}
