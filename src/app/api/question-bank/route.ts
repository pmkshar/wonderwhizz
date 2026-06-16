import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/question-bank?grade=8&subject=maths&topic=algebra&limit=20
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const grade = Number(url.searchParams.get('grade') ?? '0')
  const subject = url.searchParams.get('subject')?.toLowerCase().trim()
  const topic = url.searchParams.get('topic')?.toLowerCase().trim()
  const difficulty = url.searchParams.get('difficulty')?.toLowerCase().trim()
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '20'), 50)

  const where: {
    grade?: number
    subject?: string
    topic?: string
    difficulty?: string
  } = {}
  if (grade >= 1 && grade <= 12) where.grade = grade
  if (subject) where.subject = subject
  if (topic) where.topic = topic
  if (difficulty) where.difficulty = difficulty

  const items = await db.questionBank.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      grade: true,
      subject: true,
      topic: true,
      difficulty: true,
      question: true,
      options: true,
      hint: true,
      // Do NOT return correctAnswer or explanation until the student submits
    },
  })

  const parsed = items.map((q) => ({
    ...q,
    options: q.options ? (JSON.parse(q.options) as string[]) : null,
  }))

  return NextResponse.json({ items: parsed })
}
