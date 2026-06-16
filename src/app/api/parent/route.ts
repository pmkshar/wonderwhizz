import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/parent — overview of all linked children for the signed-in parent
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const parent = await db.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true, role: true },
  })
  if (!parent) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  if (parent.role !== 'parent') {
    return NextResponse.json(
      { error: 'This account is not a parent account. Switch to parent mode to view the dashboard.' },
      { status: 403 }
    )
  }

  const links = await db.parentStudent.findMany({
    where: { parentId: parent.id },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          grade: true,
          image: true,
          createdAt: true,
        },
      },
    },
  })

  const children = await Promise.all(
    links.map(async (link) => {
      const studentId = link.student.id
      const [
        totalQuestions,
        totalPractice,
        correctPractice,
        recentQuestions,
        recentAttempts,
        achievementsCount,
        subjectBreakdown,
        topicBreakdown,
        last7DaysQuestions,
        last7DaysPractice,
      ] = await Promise.all([
        db.question.count({ where: { userId: studentId } }),
        db.practiceAttempt.count({ where: { userId: studentId } }),
        db.practiceAttempt.count({ where: { userId: studentId, isCorrect: true } }),
        db.question.findMany({
          where: { userId: studentId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            subject: true,
            topic: true,
            question: true,
            style: true,
            createdAt: true,
          },
        }),
        db.practiceAttempt.findMany({
          where: { userId: studentId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            question: {
              select: { subject: true, topic: true, question: true, correctAnswer: true },
            },
          },
        }),
        db.userAchievement.count({ where: { userId: studentId } }),
        db.question.groupBy({
          by: ['subject'],
          where: { userId: studentId },
          _count: true,
        }),
        db.question.groupBy({
          by: ['topic'],
          where: { userId: studentId, NOT: { topic: null } },
          _count: true,
        }),
        db.$queryRaw<{ day: string; count: number }[]>`
          SELECT DATE(createdAt) as day, COUNT(*) as count
          FROM Question
          WHERE userId = ${studentId}
            AND createdAt >= datetime('now', '-6 days')
          GROUP BY DATE(createdAt)
          ORDER BY day ASC
        `,
        db.$queryRaw<{ day: string; count: number; correct: number }[]>`
          SELECT DATE(createdAt) as day,
                 COUNT(*) as count,
                 SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) as correct
          FROM PracticeAttempt
          WHERE userId = ${studentId}
            AND createdAt >= datetime('now', '-6 days')
          GROUP BY DATE(createdAt)
          ORDER BY day ASC
        `,
      ])

      const accuracy = totalPractice > 0 ? Math.round((correctPractice / totalPractice) * 100) : 0

      return {
        ...link.student,
        summary: {
          totalQuestions,
          totalPractice,
          correctPractice,
          accuracy,
          achievementsEarned: achievementsCount,
        },
        recentQuestions,
        recentAttempts: recentAttempts.map((a) => ({
          id: a.id,
          isCorrect: a.isCorrect,
          userAnswer: a.userAnswer,
          createdAt: a.createdAt,
          subject: a.question.subject,
          topic: a.question.topic,
          question: a.question.question,
          correctAnswer: a.question.correctAnswer,
        })),
        breakdowns: {
          bySubject: subjectBreakdown.map((s) => ({ subject: s.subject, count: s._count })),
          byTopic: topicBreakdown.map((t) => ({ topic: t.topic, count: t._count })),
        },
        activity: {
          last7DaysQuestions: last7DaysQuestions.map((d) => ({
            day: d.day,
            count: Number(d.count),
          })),
          last7DaysPractice: last7DaysPractice.map((d) => ({
            day: d.day,
            count: Number(d.count),
            correct: Number(d.correct),
          })),
        },
      }
    })
  )

  return NextResponse.json({ children })
}
