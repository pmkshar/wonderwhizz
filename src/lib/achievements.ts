// Achievement definitions + helper to award them
import { db } from '@/lib/db'

export interface AchievementDef {
  code: string
  name: string
  description: string
  emoji: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    code: 'first_question',
    name: 'First Question!',
    description: 'You asked WonderWhiz your very first question.',
    emoji: '🎉',
  },
  {
    code: 'questions_10',
    name: 'Curious Mind',
    description: 'Asked 10 questions to the tutor.',
    emoji: '💡',
  },
  {
    code: 'questions_50',
    name: 'Question Conqueror',
    description: 'Asked 50 questions to the tutor.',
    emoji: '🏆',
  },
  {
    code: 'practice_10',
    name: 'Practice Rookie',
    description: 'Completed 10 practice problems.',
    emoji: '🎯',
  },
  {
    code: 'practice_50',
    name: 'Practice Pro',
    description: 'Completed 50 practice problems.',
    emoji: '🚀',
  },
  {
    code: 'streak_3',
    name: 'On a Roll',
    description: 'Got 3 practice problems correct in a row.',
    emoji: '🔥',
  },
  {
    code: 'streak_7',
    name: 'Unstoppable!',
    description: 'Got 7 practice problems correct in a row.',
    emoji: '⚡',
  },
  {
    code: 'math_explorer',
    name: 'Math Explorer',
    description: 'Tried all 8 maths topics.',
    emoji: '🧭',
  },
  {
    code: 'polyglot',
    name: 'Polyglot',
    description: 'Used voice-over in 3 different languages.',
    emoji: '🌍',
  },
  {
    code: 'all_styles',
    name: 'Style Master',
    description: 'Tried all 8 explanation styles.',
    emoji: '🎨',
  },
]

export async function ensureAchievementsSeeded(): Promise<void> {
  const count = await db.achievement.count()
  if (count > 0) return
  await db.achievement.createMany({
    data: ACHIEVEMENTS.map((a) => ({
      code: a.code,
      name: a.name,
      description: a.description,
      emoji: a.emoji,
    })),
  })
}

/**
 * Awards an achievement to a user if not already earned.
 * Returns true if newly awarded, false if already had it.
 */
export async function maybeAwardAchievement(
  userId: string,
  code: string
): Promise<boolean> {
  await ensureAchievementsSeeded()
  const achievement = await db.achievement.findUnique({ where: { code } })
  if (!achievement) return false
  const existing = await db.userAchievement.findUnique({
    where: {
      userId_achievementId: { userId, achievementId: achievement.id },
    },
  })
  if (existing) return false
  await db.userAchievement.create({
    data: { userId, achievementId: achievement.id },
  })
  return true
}

/**
 * Checks and awards count-based achievements (e.g. questions_10, practice_50).
 * Call this after a question or practice attempt is recorded.
 */
export async function checkCountBasedAchievements(userId: string): Promise<string[]> {
  const newlyAwarded: string[] = []
  const [questionCount, practiceCount] = await Promise.all([
    db.question.count({ where: { userId } }),
    db.practiceAttempt.count({ where: { userId } }),
  ])

  if (questionCount >= 10) {
    if (await maybeAwardAchievement(userId, 'questions_10')) newlyAwarded.push('questions_10')
  }
  if (questionCount >= 50) {
    if (await maybeAwardAchievement(userId, 'questions_50')) newlyAwarded.push('questions_50')
  }
  if (practiceCount >= 10) {
    if (await maybeAwardAchievement(userId, 'practice_10')) newlyAwarded.push('practice_10')
  }
  if (practiceCount >= 50) {
    if (await maybeAwardAchievement(userId, 'practice_50')) newlyAwarded.push('practice_50')
  }

  // All-styles achievement
  const stylesUsed = await db.question.findMany({
    where: { userId },
    select: { style: true },
    distinct: ['style'],
  })
  if (stylesUsed.length >= 8) {
    if (await maybeAwardAchievement(userId, 'all_styles')) newlyAwarded.push('all_styles')
  }

  // Math explorer: all 8 maths topics used
  const mathsTopics = await db.question.findMany({
    where: { userId, subject: 'maths', NOT: { topic: null } },
    select: { topic: true },
    distinct: ['topic'],
  })
  if (mathsTopics.length >= 8) {
    if (await maybeAwardAchievement(userId, 'math_explorer')) newlyAwarded.push('math_explorer')
  }

  // Polyglot: 3 different voice languages used
  const langsUsed = await db.question.findMany({
    where: { userId },
    select: { language: true },
    distinct: ['language'],
  })
  if (langsUsed.length >= 3) {
    if (await maybeAwardAchievement(userId, 'polyglot')) newlyAwarded.push('polyglot')
  }

  return newlyAwarded
}

/**
 * Checks streak-based achievements by looking at recent practice attempts.
 */
export async function checkStreakAchievements(userId: string): Promise<string[]> {
  const newlyAwarded: string[] = []
  const recent = await db.practiceAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 7,
    select: { isCorrect: true },
  })
  // Count current streak from most recent backwards
  let streak = 0
  for (const a of recent) {
    if (a.isCorrect) streak++
    else break
  }
  if (streak >= 3) {
    if (await maybeAwardAchievement(userId, 'streak_3')) newlyAwarded.push('streak_3')
  }
  if (streak >= 7) {
    if (await maybeAwardAchievement(userId, 'streak_7')) newlyAwarded.push('streak_7')
  }
  return newlyAwarded
}
