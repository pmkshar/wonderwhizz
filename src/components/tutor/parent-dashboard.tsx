'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Loader2,
  UserPlus,
  Trophy,
  Target,
  TrendingUp,
  MessageSquare,
  Flame,
  CheckCircle2,
  XCircle,
  Link2,
  GraduationCap,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChildSummary {
  id: string
  name: string | null
  email: string
  grade: number
  image: string | null
  summary: {
    totalQuestions: number
    totalPractice: number
    correctPractice: number
    accuracy: number
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
    isCorrect: boolean
    userAnswer: string
    createdAt: string
    subject: string
    topic: string | null
    question: string
    correctAnswer: string
  }>
  breakdowns: {
    bySubject: Array<{ subject: string; count: number }>
    byTopic: Array<{ topic: string; count: number }>
  }
  activity: {
    last7DaysQuestions: Array<{ day: string; count: number }>
    last7DaysPractice: Array<{ day: string; count: number; correct: number }>
  }
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSwitchToStudent: () => void
}

export function ParentDashboard({ open, onOpenChange, onSwitchToStudent }: Props) {
  const [children, setChildren] = useState<ChildSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [linkEmail, setLinkEmail] = useState('')
  const [linking, setLinking] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function loadChildren() {
    setLoading(true)
    try {
      const res = await fetch('/api/parent')
      const data = (await res.json().catch(() => ({
        error: 'Failed to load',
      }))) as { children?: ChildSummary[]; error?: string }
      if (data.error) {
        toast.error(data.error)
        setChildren([])
      } else {
        setChildren(data.children ?? [])
      }
    } catch {
      toast.error('Could not load children data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) loadChildren()
  }, [open])

  async function linkStudent() {
    if (!linkEmail.trim()) {
      toast.error('Enter your child\'s email')
      return
    }
    setLinking(true)
    try {
      const res = await fetch('/api/parent/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail: linkEmail.trim() }),
      })
      const data = (await res.json().catch(() => ({ error: 'Failed' }))) as {
        ok?: boolean
        error?: string
        alreadyLinked?: boolean
        student?: { id: string; name: string | null; email: string }
      }
      if (!res.ok) {
        toast.error(data.error ?? 'Could not link student')
        return
      }
      toast.success(
        data.alreadyLinked
          ? `${data.student?.name ?? data.student?.email} is already linked.`
          : `Linked ${data.student?.name ?? data.student?.email}! 🎉`
      )
      setLinkEmail('')
      loadChildren()
    } catch {
      toast.error('Linking failed')
    } finally {
      setLinking(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            👨‍👩‍👧 Parent Dashboard
          </DialogTitle>
          <DialogDescription>
            Monitor your child&apos;s learning progress, achievements, and activity.
          </DialogDescription>
        </DialogHeader>

        {/* Link child */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Link a child by their account email
              </label>
              <Input
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                placeholder="e.g. aarav@example.com"
                type="email"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !linking) linkStudent()
                }}
              />
            </div>
            <Button
              type="button"
              onClick={linkStudent}
              disabled={linking}
              className="gap-1.5"
            >
              {linking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Link child
            </Button>
          </CardContent>
        </Card>

        {/* Children list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : children.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
            <div className="text-4xl">👶</div>
            <div className="mt-2 font-semibold">No children linked yet</div>
            <div className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Ask your child to register on WonderWhiz first (they should pick
              &quot;student&quot; role). Then enter their email above to link them
              to your parent account.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {children.map((child) => {
              const expanded = expandedId === child.id
              return (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-card shadow-sm"
                >
                  {/* Child header */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : child.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-base font-bold text-primary-foreground shadow-sm">
                      {(child.name ?? child.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold">
                        {child.name ?? 'Kid'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {child.email} · Class {child.grade}
                      </div>
                    </div>
                    <div className="flex gap-2 text-center">
                      <MiniStat
                        icon={<MessageSquare className="h-3 w-3" />}
                        value={child.summary.totalQuestions}
                        label="Questions"
                      />
                      <MiniStat
                        icon={<Target className="h-3 w-3" />}
                        value={child.summary.totalPractice}
                        label="Practice"
                      />
                      <MiniStat
                        icon={<TrendingUp className="h-3 w-3" />}
                        value={`${child.summary.accuracy}%`}
                        label="Accuracy"
                      />
                      <MiniStat
                        icon={<Trophy className="h-3 w-3" />}
                        value={child.summary.achievementsEarned}
                        label="Trophies"
                      />
                    </div>
                  </button>

                  {/* Expanded details */}
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border-t border-border p-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Subject breakdown */}
                        <div>
                          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                            <BarChart3 className="h-4 w-4" /> By Subject
                          </div>
                          {child.breakdowns.bySubject.length === 0 ? (
                            <div className="text-xs text-muted-foreground">
                              No questions asked yet.
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {child.breakdowns.bySubject.map((b) => {
                                const max = Math.max(
                                  ...child.breakdowns.bySubject.map((x) => x.count)
                                )
                                return (
                                  <div key={b.subject} className="space-y-0.5">
                                    <div className="flex justify-between text-xs">
                                      <span className="font-medium capitalize">
                                        {subjectEmoji(b.subject)} {b.subject}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {b.count}
                                      </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                      <div
                                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                                        style={{ width: `${(b.count / max) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* Topic breakdown */}
                        <div>
                          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                            <Target className="h-4 w-4" /> Topics Explored
                          </div>
                          {child.breakdowns.byTopic.length === 0 ? (
                            <div className="text-xs text-muted-foreground">
                              No topics explored yet.
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {child.breakdowns.byTopic.map((t) => (
                                <Badge
                                  key={t.topic}
                                  variant="secondary"
                                  className="text-[11px]"
                                >
                                  {t.topic.replace('_', ' ')} · {t.count}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recent activity */}
                      <div className="mt-4">
                        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                          <Flame className="h-4 w-4" /> Recent Activity
                        </div>
                        <div className="space-y-1.5">
                          {child.recentQuestions.slice(0, 3).map((q) => (
                            <div
                              key={q.id}
                              className="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-2 text-xs"
                            >
                              <span>{subjectEmoji(q.subject)}</span>
                              <div className="flex-1">
                                <div className="line-clamp-1 font-medium">{q.question}</div>
                                <div className="text-muted-foreground">
                                  {q.topic ? `${q.topic.replace('_', ' ')} · ` : ''}
                                  {q.style} · {formatDate(q.createdAt)}
                                </div>
                              </div>
                            </div>
                          ))}
                          {child.recentAttempts.slice(0, 3).map((a) => (
                            <div
                              key={a.id}
                              className={cn(
                                'flex items-start gap-2 rounded-md border p-2 text-xs',
                                a.isCorrect
                                  ? 'border-emerald-200 bg-emerald-50'
                                  : 'border-rose-200 bg-rose-50'
                              )}
                            >
                              {a.isCorrect ? (
                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                              ) : (
                                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
                              )}
                              <div className="flex-1">
                                <div className="line-clamp-1 font-medium">{a.question}</div>
                                <div className="text-muted-foreground">
                                  {a.topic ? `${a.topic.replace('_', ' ')} · ` : ''}
                                  {formatDate(a.createdAt)}
                                </div>
                              </div>
                            </div>
                          ))}
                          {child.recentQuestions.length === 0 &&
                            child.recentAttempts.length === 0 && (
                              <div className="text-xs text-muted-foreground">
                                No recent activity.
                              </div>
                            )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onSwitchToStudent}
            className="gap-1.5"
          >
            <GraduationCap className="h-4 w-4" /> Switch to student mode
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={loadChildren}
            className="gap-1.5"
          >
            <Link2 className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number | string
  label: string
}) {
  return (
    <div className="hidden flex-col items-center rounded-lg bg-muted/50 px-2.5 py-1 sm:flex">
      <div className="flex items-center gap-1 text-sm font-bold text-foreground">
        {icon}
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  )
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
