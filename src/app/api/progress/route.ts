import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// Build a "last 7 days" series starting 6 days ago at 00:00 UTC.
// Returns Date objects in chronological order (oldest -> today).
function last7DayStarts(): Date[] {
  const out: Date[] = []
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    out.push(d)
  }
  return out
}

// GET /api/progress — student's progress summary
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true, name: true, grade: true, email: true },
  })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const [
    totalQuestions,
    totalPractice,
    correctPractice,
    recentQuestions,
    recentAttempts,
    achievements,
    subjectBreakdown,
    topicBreakdown,
    styleBreakdown,
    langBreakdown,
    last7DaysQuestionsRaw,
    last7DaysPracticeRaw,
  ] = await Promise.all([
    db.question.count({ where: { userId: user.id } }),
    db.practiceAttempt.count({ where: { userId: user.id } }),
    db.practiceAttempt.count({ where: { userId: user.id, isCorrect: true } }),
    db.question.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        subject: true,
        topic: true,
        question: true,
        style: true,
        language: true,
        createdAt: true,
      },
    }),
    db.practiceAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        question: {
          select: {
            subject: true,
            topic: true,
            grade: true,
            question: true,
            correctAnswer: true,
          },
        },
      },
    }),
    db.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { earnedAt: 'desc' },
    }),
    db.question.groupBy({
      by: ['subject'],
      where: { userId: user.id },
      _count: true,
    }),
    db.question.groupBy({
      by: ['topic'],
      where: { userId: user.id, NOT: { topic: null } },
      _count: true,
    }),
    db.question.groupBy({
      by: ['style'],
      where: { userId: user.id },
      _count: true,
    }),
    db.question.groupBy({
      by: ['language'],
      where: { userId: user.id },
      _count: true,
    }),
    // Last 7 days questions (Prisma findMany — cross-DB safe)
    db.question.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: last7DayStarts()[0] },
      },
      select: { createdAt: true },
    }),
    // Last 7 days practice attempts (with correctness for accuracy calc)
    db.practiceAttempt.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: last7DayStarts()[0] },
      },
      select: { createdAt: true, isCorrect: true },
    }),
  ])

  // Aggregate the 7-day series in JS — works on both SQLite (local dev) and
  // PostgreSQL (Vercel/Neon). The previous raw SQL used SQLite-specific
  // syntax (`datetime('now', '-6 days')`, `DATE(...)`, `SUM(CASE WHEN ...)`)
  // which crashed on PostgreSQL and caused Progress + Achievements to hang
  // forever with a 500 in the network tab.
  const dayStarts = last7DayStarts()
  const dayKey = (d: Date) => d.toISOString().slice(0, 10)
  const dayLabels = dayStarts.map((d) => ({
    key: dayKey(d),
    date: d,
  }))

  const last7DaysQuestions = dayLabels.map(({ key }) => ({
    day: key,
    count: last7DaysQuestionsRaw.filter((q) => dayKey(q.createdAt) === key).length,
  }))

  const last7DaysPractice = dayLabels.map(({ key }) => {
    const matches = last7DaysPracticeRaw.filter(
      (p) => dayKey(p.createdAt) === key
    )
    return {
      day: key,
      count: matches.length,
      correct: matches.filter((m) => m.isCorrect).length,
    }
  })

  // Compute current streak (consecutive correct from most recent)
  let streak = 0
  for (const a of recentAttempts) {
    if (a.isCorrect) streak++
    else break
  }

  // Compute best streak (longest run of correct in history)
  const allAttemptsInOrder = await db.practiceAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    select: { isCorrect: true },
  })
  let bestStreak = 0
  let current = 0
  for (const a of allAttemptsInOrder) {
    if (a.isCorrect) {
      current++
      if (current > bestStreak) bestStreak = current
    } else {
      current = 0
    }
  }

  const accuracy = totalPractice > 0 ? Math.round((correctPractice / totalPractice) * 100) : 0

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, grade: user.grade },
    summary: {
      totalQuestions,
      totalPractice,
      correctPractice,
      accuracy,
      streak,
      bestStreak,
      achievementsEarned: achievements.length,
    },
    recentQuestions,
    recentAttempts: recentAttempts.map((a) => ({
      id: a.id,
      isCorrect: a.isCorrect,
      userAnswer: a.userAnswer,
      timeSpentSec: a.timeSpentSec,
      createdAt: a.createdAt,
      subject: a.question.subject,
      topic: a.question.topic,
      question: a.question.question,
      correctAnswer: a.question.correctAnswer,
    })),
    achievements: achievements.map((ua) => ({
      code: ua.achievement.code,
      name: ua.achievement.name,
      description: ua.achievement.description,
      emoji: ua.achievement.emoji,
      earnedAt: ua.earnedAt,
    })),
    breakdowns: {
      bySubject: subjectBreakdown.map((s) => ({ subject: s.subject, count: s._count })),
      byTopic: topicBreakdown.map((t) => ({ topic: t.topic, count: t._count })),
      byStyle: styleBreakdown.map((s) => ({ style: s.style, count: s._count })),
      byLanguage: langBreakdown.map((l) => ({ language: l.language, count: l._count })),
    },
    activity: {
      last7DaysQuestions,
      last7DaysPractice,
    },
  })
}
