import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { chatWithFallback, type ChatMessage } from '@/lib/ai'
import { maybeAwardAchievement } from '@/lib/achievements'
import {
  buildTutorPrompt,
  EXPLANATION_STYLES,
  type ExplanationStyleId,
} from '@/lib/explanation-prompts'
import { getBoard, getChapter } from '@/lib/syllabus'

// Pollinations (free fallback) is a reasoning model that can take 15-30s on
// cold starts. Vercel Hobby plan allows up to 60s for serverless functions.
export const maxDuration = 60
export const runtime = 'nodejs'

const VALID_SUBJECTS = new Set(['maths', 'hindi', 'science', 'kannada'])
const VALID_BOARD_IDS = new Set(['cbse', 'icse', 'kseab', 'msbshe'])

interface HistoryTurn {
  role: 'user' | 'assistant'
  content: string
}

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
    boardId?: string
    chapterId?: string
    history?: HistoryTurn[]
  }

  const subject = (body.subject ?? '').toLowerCase().trim()
  const style = (body.style ?? 'detailed') as ExplanationStyleId
  const question = (body.question ?? '').trim()
  const grade = typeof body.grade === 'number' ? body.grade : user.grade
  const language = (body.language ?? 'en').toLowerCase().trim()
  const topic = (body.topic ?? '').trim() || null
  const history = Array.isArray(body.history) ? body.history.slice(-8) : []
  const boardId = (body.boardId ?? '').trim().toLowerCase() || null
  const chapterId = (body.chapterId ?? '').trim() || null

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
  if (boardId && !VALID_BOARD_IDS.has(boardId)) {
    return NextResponse.json({ error: 'Unknown school board.' }, { status: 400 })
  }

  // Resolve syllabus context (board + optional chapter) for the prompt
  let boardLabel: string | null = null
  let chapterTitle: string | null = null
  let chapterNumber: number | null = null
  let chapterTopics: string[] | null = null
  if (boardId) {
    const board = getBoard(boardId)
    if (board) {
      boardLabel = board.label
      if (chapterId) {
        const chapter = getChapter(boardId, subject, grade, chapterId)
        if (chapter) {
          chapterTitle = chapter.title
          chapterNumber = chapter.number
          chapterTopics = chapter.topics
        }
      }
    }
  }

  const systemMessage = buildTutorPrompt({
    subject,
    style,
    grade,
    question,
    topic: topic ?? undefined,
    boardId,
    boardLabel,
    chapterTitle,
    chapterNumber,
    chapterTopics,
  })
  const languageInstruction: ChatMessage = {
    role: 'system',
    content: `The student wants the answer explained in this language: ${language}.
If the chosen language is Hindi or Kannada, write the explanation primarily in that language (you may keep mathematical notation, code, and proper nouns in English).
If English, write in clear simple English.`,
  }

  // Build the conversation: system messages -> prior turns -> new question
  const messages: ChatMessage[] = [
    systemMessage,
    languageInstruction,
    ...history.map((t) => ({ role: t.role, content: t.content }) as ChatMessage),
    { role: 'user', content: question },
  ]

  let answer: string
  let provider: string
  try {
    const result = await chatWithFallback({
      messages,
      temperature: 0.5,
      maxTokens: 1400,
    })
    answer = result.content
    provider = result.provider
  } catch (err) {
    console.error('[tutor] LLM error (all providers failed)', err)
    return NextResponse.json(
      {
        error:
          'The tutor is taking a quick nap. Please try again in a moment — our free AI provider may be busy.',
      },
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
    boardId,
    chapterId,
    chapterTitle,
    provider,
  })
}
