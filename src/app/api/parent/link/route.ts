import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// POST /api/parent/link — link a student to the signed-in parent by student email
// Body: { studentEmail }
export async function POST(req: Request) {
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
      { error: 'Only parent accounts can link students.' },
      { status: 403 }
    )
  }

  const body = (await req.json().catch(() => ({}))) as { studentEmail?: string }
  const studentEmail = (body.studentEmail ?? '').toLowerCase().trim()
  if (!studentEmail) {
    return NextResponse.json({ error: 'Please provide student email.' }, { status: 400 })
  }

  const student = await db.user.findUnique({
    where: { email: studentEmail },
    select: { id: true, role: true, name: true, email: true },
  })
  if (!student) {
    return NextResponse.json(
      { error: `No account found with email ${studentEmail}. Ask your child to register first.` },
      { status: 404 }
    )
  }
  if (student.id === parent.id) {
    return NextResponse.json({ error: 'You cannot link yourself.' }, { status: 400 })
  }
  if (student.role === 'parent') {
    return NextResponse.json({ error: 'That account is also a parent.' }, { status: 400 })
  }

  // Upsert link
  const existing = await db.parentStudent.findUnique({
    where: {
      parentId_studentId: { parentId: parent.id, studentId: student.id },
    },
  })
  if (existing) {
    return NextResponse.json({
      ok: true,
      alreadyLinked: true,
      student: { id: student.id, name: student.name, email: student.email },
    })
  }

  await db.parentStudent.create({
    data: { parentId: parent.id, studentId: student.id },
  })

  return NextResponse.json({
    ok: true,
    student: { id: student.id, name: student.name, email: student.email },
  })
}
