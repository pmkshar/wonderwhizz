// Seed the question bank + achievements into the database.
// Run with: bun run /home/z/my-project/scripts/seed.ts
import { db } from '../src/lib/db'
import { SEED_QUESTIONS } from '../src/lib/question-bank-seed'
import { ensureAchievementsSeeded, ACHIEVEMENTS } from '../src/lib/achievements'

async function main() {
  console.log('🌱 Seeding achievements...')
  await ensureAchievementsSeeded()
  const achievementCount = await db.achievement.count()
  console.log(`  ✓ ${achievementCount} achievements present (${ACHIEVEMENTS.length} expected)`)

  console.log('🌱 Seeding question bank...')
  const existingCount = await db.questionBank.count()
  if (existingCount >= SEED_QUESTIONS.length) {
    console.log(`  ✓ Question bank already has ${existingCount} items, skipping.`)
  } else {
    // Insert any missing questions (idempotent by question text + grade)
    const existing = await db.questionBank.findMany({
      select: { question: true, grade: true },
    })
    const existingKeys = new Set(existing.map((e) => `${e.grade}::${e.question}`))
    const toInsert = SEED_QUESTIONS.filter(
      (q) => !existingKeys.has(`${q.grade}::${q.question}`)
    )
    if (toInsert.length === 0) {
      console.log(`  ✓ All ${SEED_QUESTIONS.length} questions already seeded.`)
    } else {
      await db.questionBank.createMany({
        data: toInsert.map((q) => ({
          grade: q.grade,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          question: q.question,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: q.correctAnswer,
          hint: q.hint ?? null,
          explanation: q.explanation ?? null,
        })),
      })
      console.log(`  ✓ Inserted ${toInsert.length} new questions.`)
    }
  }

  const total = await db.questionBank.count()
  console.log(`\n✅ Seed complete. Question bank has ${total} total items.`)

  // Print breakdown by subject
  const bySubject = await db.questionBank.groupBy({
    by: ['subject'],
    _count: true,
  })
  for (const s of bySubject) {
    console.log(`   ${s.subject}: ${s._count}`)
  }
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
