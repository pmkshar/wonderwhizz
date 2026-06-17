'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy, Award } from 'lucide-react'

interface Achievement {
  code: string
  name: string
  description: string
  emoji: string
}

interface ProgressData {
  summary: {
    achievementsEarned: number
    totalQuestions: number
    totalPractice: number
    correctPractice: number
    streak: number
    bestStreak: number
    accuracy: number
  }
  achievements: Achievement[]
}

export function AchievementsPage() {
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/progress')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d as ProgressData)
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">🏆 Achievements</h1>
        <p className="text-sm text-muted-foreground">
          Badges and rewards you&rsquo;ve earned by asking questions and practicing.
        </p>
      </div>

      {/* Highlight card */}
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-3 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-6 text-center dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30 sm:flex-row sm:text-left">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl shadow-lg">
            🏆
          </div>
          <div className="flex-1">
            <div className="text-2xl font-extrabold">{data.summary.achievementsEarned}</div>
            <div className="text-sm text-muted-foreground">badges earned so far</div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <MiniStat label="Questions" value={data.summary.totalQuestions} />
            <MiniStat label="Practice" value={data.summary.totalPractice} />
            <MiniStat label="Streak" value={data.summary.streak} />
          </div>
        </CardContent>
      </Card>

      {/* Achievements grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Award className="h-4 w-4" /> Your Badges
            <Badge variant="secondary" className="ml-1">
              {data.achievements.length} earned
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.achievements.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
              <div className="text-4xl">🌱</div>
              <div className="mt-2 font-semibold">No achievements yet</div>
              <div className="text-sm text-muted-foreground">
                Ask your first question or complete a practice problem to start earning badges!
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {data.achievements.map((a, i) => (
                <motion.div
                  key={a.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 text-center"
                >
                  <div className="text-4xl">{a.emoji}</div>
                  <div className="text-sm font-bold leading-tight">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground">{a.description}</div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-lg font-extrabold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  )
}
