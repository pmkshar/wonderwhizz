import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import ZAI from 'z-ai-web-dev-sdk'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ensureZaiConfig } from '@/lib/zai-config'
import {
  buildTutorPrompt,
  EXPLANATION_STYLES,
  type ExplanationStyleId,
} from '@/lib/explanation-prompts'

const VALID_SUBJECTS = new Set(['maths', 'hindi', 'science', 'kannada'])

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Please sign in to use the tutor.' }, { status: 401 })
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true, grade: true },
  })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    subject?: string
    style?: ExplanationStyleId
    grade?: number
    question?: string
    language?: string
    topic?: string
  }

  const subject = (body.subject ?? '').toLowerCase().trim()
  const style = (body.style ?? 'detailed') as ExplanationStyleId
  const question = (body.question ?? '').trim()
  const grade = typeof body.grade === 'number' ? body.grade : user.grade
  const language = (body.language ?? 'en').toLowerCase().trim()
  const topic = (body.topic ?? '').trim() || null

  if (!VALID_SUBJECTS.has(subject)) {
    return NextResponse.json({ error: 'Please pick a subject.' }, { status: 400 })
  }
  if (!EXPLANATION_STYLES.some((s) => s.id === style)) {
    return NextResponse.json({ error: 'Invalid explanation style.' }, { status: 400 })
  }
  if (question.length < 2) {
    return NextResponse.json({ error: 'Please type a question first.' }, { status: 400 })
  }
  if (question.length > 4000) {
    return NextResponse.json({ error: 'Question too long (max 4000 chars).' }, { status: 400 })
  }

  const systemMessage = buildTutorPrompt({ subject, style, grade, question, topic: topic ?? undefined })
  const languageInstruction = {
    role: 'system' as const,
    content: `The student wants the answer explained in this language: ${language}.
If the chosen language is Hindi or Kannada, write the explanation primarily in that language (you may keep mathematical notation, code, and proper nouns in English).
If English, write in clear simple English.`,
  }

  let answer: string
  try {
    await ensureZaiConfig()
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        systemMessage,
        languageInstruction,
        { role: 'user', content: question },
      ],
      thinking: { type: 'disabled' },
      temperature: 0.5,
      max_tokens: 1400,
    })
    answer = completion.choices[0]?.message?.content ?? ''
  } catch (err) {
    console.error('[tutor] LLM error', err)
    return NextResponse.json(
      { error: 'The tutor is taking a quick nap. Please try again in a moment.' },
      { status: 502 }
    )
  }

  if (!answer.trim()) {
    return NextResponse.json(
      { error: 'The tutor did not return an answer. Please try again.' },
      { status: 502 }
    )
  }

  // Persist question for the student's history (best-effort)
  try {
    await db.question.create({
      data: {
        userId: user.id,
        subject,
        topic,
        question,
        style,
        language,
        answer,
      },
    })
    // Award "first question" achievement if eligible
    await maybeAwardAchievement(user.id, 'first_question')
  } catch (err) {
    console.error('[tutor] failed to save question history', err)
  }

  return NextResponse.json({
    answer,
    subject,
    style,
    language,
    grade,
    topic,
  })
}
