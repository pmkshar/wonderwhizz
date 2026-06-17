import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
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
  const { email, password } = parsed.data
  const normalizedEmail = email.toLowerCase().trim()
  const user = await db.user.findUnique({ where: { email: normalizedEmail } })
  if (!user) {
    // For privacy, we still return ok to avoid leaking which emails are registered.
    return NextResponse.json({ ok: true })
  }
  if (user.provider === 'google' && !user.passwordHash) {
    return NextResponse.json(
      { error: 'This account uses Google sign-in. Please use "Continue with Google".' },
      { status: 400 }
    )
  }
  const passwordHash = await hashPassword(password)
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  })
  return NextResponse.json({ ok: true })
}
