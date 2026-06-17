import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/achievements — list all achievements + whether the user has earned them
export async function GET() {
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
  const all = await db.achievement.findMany({
    orderBy: { code: 'asc' },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      emoji: true,
    },
  })
  const earned = await db.userAchievement.findMany({
    where: { userId: user.id },
    select: { achievementId: true, earnedAt: true },
  })
  const earnedMap = new Map(earned.map((e) => [e.achievementId, e.earnedAt]))
  return NextResponse.json({
    achievements: all.map((a) => ({
      ...a,
      earnedAt: earnedMap.get(a.id) ?? null,
    })),
  })
}
