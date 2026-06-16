import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(128),
  grade: z.number().int().min(1).max(10).optional(),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }
  const { name, email, password, grade } = parsed.data
  const normalizedEmail = email.toLowerCase().trim()
  const existing = await db.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    return NextResponse.json(
      { error: 'An account with this email already exists. Please log in.' },
      { status: 409 }
    )
  }
  const passwordHash = await hashPassword(password)
  const user = await db.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      provider: 'credentials',
      grade: grade ?? 8,
    },
  })
  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email },
  })
}
