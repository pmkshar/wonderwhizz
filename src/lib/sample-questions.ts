// Generate sample questions for a given syllabus context.
//
// When a student selects a board + chapter, we want to surface 4-6 specific
// questions they can tap to instantly ask the tutor. This makes the chat feel
// like a real homework helper rather than an empty text box.
//
// The questions are generated from the chapter's `topics` field plus
// subject-specific question templates. They're curriculum-aligned by
// construction (because the topics themselves come from the syllabus catalog).

import { getChapter, type SyllabusChapter } from './syllabus'

export interface SampleQuestion {
  /** The question text shown to the student. */
  text: string
  /** A short label/tag describing the type of question. */
  tag: string
  /** Emoji shown next to the question for visual scanning. */
  emoji: string
}

// Subject-specific question templates. Each template is a function that takes
// a chapter topic string and returns a SampleQuestion. We pick templates that
// make sense for the subject — e.g. maths gets "solve / prove / find" prompts,
// science gets "explain / why / how" prompts, etc.
type Template = (topic: string) => SampleQuestion

const MATHS_TEMPLATES: Template[] = [
  (t) => ({
    text: `Explain the concept of ${t} with a worked example from this chapter.`,
    tag: 'Concept + example',
    emoji: '📘',
  }),
  (t) => ({
    text: `What is the formula for ${t}? Show how to derive it step by step.`,
    tag: 'Formula derivation',
    emoji: '🧮',
  }),
  (t) => ({
    text: `Give me 3 practice problems on ${t} with solutions.`,
    tag: 'Practice problems',
    emoji: '✏️',
  }),
  (t) => ({
    text: `What is a common mistake students make when solving ${t}?`,
    tag: 'Common mistakes',
    emoji: '⚠️',
  }),
  (t) => ({
    text: `Show a real-life example where ${t} is used.`,
    tag: 'Real-life application',
    emoji: '🌍',
  }),
]

const SCIENCE_TEMPLATES: Template[] = [
  (t) => ({
    text: `Explain ${t} in simple words with a daily-life example.`,
    tag: 'Explain with example',
    emoji: '🔬',
  }),
  (t) => ({
    text: `What is the scientific definition of ${t}? Why is it important?`,
    tag: 'Definition + importance',
    emoji: '📖',
  }),
  (t) => ({
    text: `Give me a simple experiment to understand ${t} at home.`,
    tag: 'Home experiment',
    emoji: '🧪',
  }),
  (t) => ({
    text: `Draw a labelled diagram for ${t} (use ASCII art).`,
    tag: 'Diagram',
    emoji: '🎨',
  }),
  (t) => ({
    text: `What are 3 interesting facts about ${t}?`,
    tag: 'Fun facts',
    emoji: '✨',
  }),
]

const HINDI_TEMPLATES: Template[] = [
  (t) => ({
    text: `${t} की परिभाषा उदाहरण सहित हिंदी में समझाइए।`,
    tag: 'परिभाषा + उदाहरण',
    emoji: '📝',
  }),
  (t) => ({
    text: `${t} के भेद बताइए और हर भेद का एक उदाहरण दीजिए।`,
    tag: 'भेद',
    emoji: '🔢',
  }),
  (t) => ({
    text: `${t} पर आधारित 3 अभ्यास प्रश्न हल सहित दीजिए।`,
    tag: 'अभ्यास प्रश्न',
    emoji: '✏️',
  }),
  (t) => ({
    text: `${t} से जुड़ी एक रोचक जानकारी दीजिए।`,
    tag: 'रोचक तथ्य',
    emoji: '💡',
  }),
]

const KANNADA_TEMPLATES: Template[] = [
  (t) => ({
    text: `${t} ಪದದ ವ್ಯಾಖ್ಯಾನ ಉದಾಹರಣೆಯೊಂದಿಗೆ ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸಿ.`,
    tag: 'ವ್ಯಾಖ್ಯಾನ + ಉದಾಹರಣೆ',
    emoji: '🦁',
  }),
  (t) => ({
    text: `${t} ವಿಷಯದ ಪ್ರಕಾರಗಳನ್ನು ತಿಳಿಸಿ ಮತ್ತು ಪ್ರತಿಯೊಂದಕ್ಕೂ ಉದಾಹರಣೆ ನೀಡಿ.`,
    tag: 'ಪ್ರಕಾರಗಳು',
    emoji: '🔢',
  }),
  (t) => ({
    text: `${t} ಕುರಿತು 3 ಅಭ್ಯಾಸ ಪ್ರಶ್ನೆಗಳನ್ನು ಉತ್ತರಗಳೊಂದಿಗೆ ನೀಡಿ.`,
    tag: 'ಅಭ್ಯಾಸ',
    emoji: '✏️',
  }),
  (t) => ({
    text: `${t} ಬಗ್ಗೆ ಒಂದು ಆಸಕ್ತಿದಾಯಕ ಸಂಗತಿ ತಿಳಿಸಿ.`,
    tag: 'ಆಸಕ್ತಿದಾಯಕ ಸಂಗತಿ',
    emoji: '💡',
  }),
]

const TEMPLATES_BY_SUBJECT: Record<string, Template[]> = {
  maths: MATHS_TEMPLATES,
  science: SCIENCE_TEMPLATES,
  hindi: HINDI_TEMPLATES,
  kannada: KANNADA_TEMPLATES,
}

/**
 * Generate 4-6 sample questions for a given syllabus context (board + grade
 * + subject + chapter). Returns an empty array if no chapter is selected or
 * if the chapter has no usable topics.
 */
export function getSampleQuestions(opts: {
  boardId?: string | null
  grade: number
  subjectId: string
  chapterId?: string | null
}): SampleQuestion[] {
  if (!opts.boardId || !opts.chapterId) return []
  const chapter: SyllabusChapter | undefined = getChapter(
    opts.boardId,
    opts.subjectId,
    opts.grade,
    opts.chapterId
  )
  if (!chapter || chapter.topics.length === 0) return []

  const templates = TEMPLATES_BY_SUBJECT[opts.subjectId] ?? MATHS_TEMPLATES

  // Pick templates in order, cycling through chapter topics so we get variety.
  // We want 4-6 questions, each on a different topic where possible.
  const targetCount = Math.min(6, Math.max(4, chapter.topics.length))
  const out: SampleQuestion[] = []
  for (let i = 0; i < targetCount; i++) {
    const template = templates[i % templates.length]
    const topic = chapter.topics[i % chapter.topics.length]
    out.push(template(topic))
  }

  // Always include one general "summary" question at the end
  out.push({
    text: `Give me a quick summary of Chapter ${chapter.number}: ${chapter.title}.`,
    tag: 'Chapter summary',
    emoji: '📋',
  })

  return out
}

/**
 * Default sample questions when NO chapter is selected (just a subject).
 * Pulled from the SUBJECTS metadata's `examples` field.
 */
export function getGeneralSampleQuestions(subjectId: string): SampleQuestion[] {
  // We import lazily here to avoid a circular import at module load time
  // (subjects.ts doesn't depend on this file, but it's cleaner this way).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { SUBJECTS } = require('./subjects') as typeof import('./subjects')
  const subject = SUBJECTS.find((s) => s.id === subjectId)
  if (!subject) return []
  return (subject.examples ?? []).map((text, i) => ({
    text,
    tag: i === 0 ? 'Try this' : 'Example',
    emoji: subject.emoji,
  }))
}
