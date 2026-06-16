import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

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
    last7DaysQuestions,
    last7DaysPractice,
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
    // Last 7 days questions (grouped by day)
    db.$queryRaw<{ day: string; count: number }[]>`
      SELECT DATE(createdAt) as day, COUNT(*) as count
      FROM Question
      WHERE userId = ${user.id}
        AND createdAt >= datetime('now', '-6 days')
      GROUP BY DATE(createdAt)
      ORDER BY day ASC
    `,
    db.$queryRaw<{ day: string; count: number; correct: number }[]>`
      SELECT DATE(createdAt) as day,
             COUNT(*) as count,
             SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) as correct
      FROM PracticeAttempt
      WHERE userId = ${user.id}
        AND createdAt >= datetime('now', '-6 days')
      GROUP BY DATE(createdAt)
      ORDER BY day ASC
    `,
  ])

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
      last7DaysQuestions: last7DaysQuestions.map((d) => ({ day: d.day, count: Number(d.count) })),
      last7DaysPractice: last7DaysPractice.map((d) => ({
        day: d.day,
        count: Number(d.count),
        correct: Number(d.correct),
      })),
    },
  })
}
