'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Trophy,
  Flame,
  Target,
  MessageSquare,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressData {
  user: { id: string; name: string | null; email: string; grade: number }
  summary: {
    totalQuestions: number
    totalPractice: number
    correctPractice: number
    accuracy: number
    streak: number
    bestStreak: number
    achievementsEarned: number
  }
  recentQuestions: Array<{
    id: string
    subject: string
    topic: string | null
    question: string
    style: string
    createdAt: string
  }>
  recentAttempts: Array<{
    id: string
    question: string
    topic: string | null
    isCorrect: boolean
    createdAt: string
  }>
  breakdowns: {
    bySubject: Array<{ subject: string; count: number }>
    byTopic: Array<{ topic: string; count: number }>
  }
  achievements: Array<{
    code: string
    name: string
    description: string
    emoji: string
  }>
  activity: {
    last7DaysQuestions: Array<{ day: string; count: number }>
    last7DaysPractice: Array<{ day: string; count: number; correct: number }>
  }
}

export function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/progress')
      .then(async (r) => {
        if (!r.ok) {
          const txt = await r.text().catch(() => '')
          throw new Error(`Failed (${r.status}): ${txt.slice(0, 200)}`)
        }
        return r.json()
      })
      .then((d) => {
        if (!cancelled) setData(d as ProgressData)
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[progress] fetch failed', err)
          setError(err instanceof Error ? err.message : 'Could not load progress')
          setData(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-6 text-center dark:bg-amber-950/20">
        <div className="text-4xl">😕</div>
        <h2 className="mt-2 text-lg font-semibold">Couldn&rsquo;t load your progress</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error ?? 'Please try again in a moment.'}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3 gap-1.5"
          onClick={() => {
            setError(null)
            setLoading(true)
            // Trigger a re-fetch by reloading the page; simplest reliable way
            if (typeof window !== 'undefined') window.location.reload()
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">📊 My Progress</h1>
        <p className="text-sm text-muted-foreground">
          Your learning stats, streaks, and recent activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<MessageSquare className="h-5 w-5" />}
          label="Questions Asked"
          value={data.summary.totalQuestions}
          gradient="from-cyan-400 to-sky-500"
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Practice Done"
          value={data.summary.totalPractice}
          gradient="from-emerald-400 to-teal-500"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Accuracy"
          value={`${data.summary.accuracy}%`}
          gradient="from-amber-400 to-orange-500"
        />
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Current Streak"
          value={data.summary.streak}
          gradient="from-rose-400 to-pink-500"
          sub={`Best: ${data.summary.bestStreak}`}
        />
      </div>

      {/* Activity chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" /> Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-28 items-end justify-between gap-1">
            {build7DaySeries(data.activity.last7DaysQuestions).map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(d.count / Math.max(1, maxCount(data.activity.last7DaysQuestions))) * 100}%`,
                    }}
                    transition={{ delay: i * 0.05 }}
                    className="w-full rounded-t bg-gradient-to-t from-cyan-500 to-sky-400"
                    style={{ minHeight: d.count > 0 ? '4px' : '0' }}
                    title={`${d.day}: ${d.count} questions`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-1 text-center text-[11px] text-muted-foreground">
            Questions asked per day
          </div>
        </CardContent>
      </Card>

      {/* Breakdowns */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">By Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              items={data.breakdowns.bySubject.map((b) => ({ key: b.subject, count: b.count }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">By Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              items={data.breakdowns.byTopic.map((b) => ({ key: b.topic, count: b.count }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentQuestions.length === 0 ? (
              <div className="text-sm text-muted-foreground">No questions yet.</div>
            ) : (
              data.recentQuestions.slice(0, 5).map((q) => (
                <div
                  key={q.id}
                  className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-2 text-xs"
                >
                  <span className="text-base">{subjectEmoji(q.subject)}</span>
                  <div className="flex-1">
                    <div className="line-clamp-1 font-medium">{q.question}</div>
                    <div className="text-muted-foreground">
                      {q.topic ? `${q.topic.replace('_', ' ')} · ` : ''}
                      {q.style} · {formatDate(q.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Practice Attempts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentAttempts.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No practice attempts yet. Visit the Practice page to start!
              </div>
            ) : (
              data.recentAttempts.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    'flex items-start gap-2 rounded-lg border p-2 text-xs',
                    a.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
                  )}
                >
                  {a.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  )}
                  <div className="flex-1">
                    <div className="line-clamp-1 font-medium">{a.question}</div>
                    <div className="text-muted-foreground">
                      {a.topic ? `${a.topic.replace('_', ' ')} · ` : ''}
                      {formatDate(a.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  gradient,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  gradient: string
  sub?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-3"
    >
      <div
        className={cn(
          'mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
          gradient
        )}
      >
        {icon}
      </div>
      <div className="text-xl font-extrabold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </motion.div>
  )
}

function BreakdownList({ items }: { items: Array<{ key: string; count: number }> }) {
  if (items.length === 0) {
    return <div className="text-sm text-muted-foreground">No data yet.</div>
  }
  const max = Math.max(...items.map((i) => i.count))
  return (
    <div className="space-y-1.5">
      {items.map((b) => (
        <div key={b.key} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium capitalize">{b.key.replace('_', ' ')}</span>
            <span className="text-muted-foreground">{b.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(b.count / max) * 100}%` }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function build7DaySeries(items: Array<{ day: string; count: number }>) {
  const today = new Date()
  const series: Array<{ day: string; count: number; label: string }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dayStr = d.toISOString().slice(0, 10)
    const found = items.find((it) => it.day === dayStr)
    series.push({
      day: dayStr,
      count: found?.count ?? 0,
      label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2),
    })
  }
  return series
}

function maxCount(items: Array<{ day: string; count: number }>) {
  return Math.max(1, ...items.map((i) => i.count))
}

function subjectEmoji(subject: string) {
  return (
    { maths: '➗', hindi: '📝', science: '🔬', kannada: '🦁' } as Record<string, string>
  )[subject] ?? '📚'
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffH < 24) return `${diffH}h ago`
  if (diffD < 7) return `${diffD}d ago`
  return d.toLocaleDateString()
}
