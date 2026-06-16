import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ user: null }, { status: 200 })
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true, name: true, email: true, image: true, grade: true, provider: true },
  })
  return NextResponse.json({ user })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await req.json().catch(() => ({}))) as { grade?: number; name?: string }
  const data: { grade?: number; name?: string } = {}
  if (typeof body.grade === 'number' && body.grade >= 1 && body.grade <= 10) {
    data.grade = body.grade
  }
  if (typeof body.name === 'string' && body.name.trim().length > 0) {
    data.name = body.name.trim().slice(0, 80)
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }
  const updated = await db.user.update({
    where: { email: session.user.email.toLowerCase() },
    data,
    select: { id: true, name: true, email: true, grade: true, image: true, provider: true },
  })
  return NextResponse.json({ user: updated })
}
