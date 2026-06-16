import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  checkCountBasedAchievements,
  checkStreakAchievements,
} from '@/lib/achievements'

// POST /api/practice — submit a practice attempt
// Body: { questionBankId, userAnswer, timeSpentSec }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true },
  })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    questionBankId?: string
    userAnswer?: string
    timeSpentSec?: number
  }

  const questionBankId = (body.questionBankId ?? '').trim()
  const userAnswer = (body.userAnswer ?? '').trim()
  const timeSpentSec =
    typeof body.timeSpentSec === 'number' && body.timeSpentSec >= 0
      ? Math.min(body.timeSpentSec, 3600)
      : 0

  if (!questionBankId || userAnswer.length === 0) {
    return NextResponse.json(
      { error: 'Missing questionBankId or userAnswer.' },
      { status: 400 }
    )
  }

  const question = await db.questionBank.findUnique({
    where: { id: questionBankId },
    select: {
      id: true,
      correctAnswer: true,
      explanation: true,
      hint: true,
      options: true,
      subject: true,
      topic: true,
      grade: true,
      question: true,
    },
  })
  if (!question) {
    return NextResponse.json({ error: 'Question not found.' }, { status: 404 })
  }

  // Normalize comparison: trim + lowercase + collapse whitespace
  const normalize = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,;]+$/g, '')
  const isCorrect = normalize(userAnswer) === normalize(question.correctAnswer)

  const attempt = await db.practiceAttempt.create({
    data: {
      userId: user.id,
      questionBankId: question.id,
      userAnswer,
      isCorrect,
      timeSpentSec,
    },
  })

  // Award achievements (best-effort, non-blocking for response)
  const newlyAwarded: string[] = []
  try {
    const countAch = await checkCountBasedAchievements(user.id)
    const streakAch = await checkStreakAchievements(user.id)
    newlyAwarded.push(...countAch, ...streakAch)
  } catch (err) {
    console.error('[practice] achievement check failed', err)
  }

  return NextResponse.json({
    attemptId: attempt.id,
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation ?? null,
    hint: question.hint ?? null,
    newlyAwarded,
  })
}

// GET /api/practice — recent attempts for the signed-in student
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true },
  })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  const url = new URL(req.url)
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '20'), 100)
  const attempts = await db.practiceAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      question: {
        select: {
          id: true,
          subject: true,
          topic: true,
          grade: true,
          question: true,
          correctAnswer: true,
        },
      },
    },
  })
  return NextResponse.json({ attempts })
}
