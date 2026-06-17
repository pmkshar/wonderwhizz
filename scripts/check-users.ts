import { db } from '@/lib/db'

async function main() {
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      provider: true,
      role: true,
      grade: true,
      passwordHash: true,
    },
  })
  console.log('Users in DB:')
  for (const u of users) {
    console.log(
      `  - ${u.email} | name=${u.name} | provider=${u.provider} | role=${u.role} | grade=${u.grade} | hashLen=${u.passwordHash?.length ?? 0}`
    )
  }
  await db.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
