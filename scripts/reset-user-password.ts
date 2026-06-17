// One-off script: reset a user's password directly in the DB.
// Usage: npx tsx scripts/reset-user-password.ts <email> <newPassword>
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'

async function main() {
  const email = (process.argv[2] ?? 'pmkshar@gmail.com').toLowerCase().trim()
  const newPassword = process.argv[3] ?? 'wonderwhiz123'

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`No user found with email: ${email}`)
    process.exit(1)
  }

  const passwordHash = await hashPassword(newPassword)
  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      provider: 'credentials', // ensure credentials sign-in is allowed
    },
  })

  console.log('Password reset successfully!')
  console.log(`  Email:    ${email}`)
  console.log(`  Password: ${newPassword}`)
  console.log(`  Provider: credentials`)
  await db.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
