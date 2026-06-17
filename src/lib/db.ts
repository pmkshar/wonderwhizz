import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// On Vercel/serverless, we want a fresh client per invocation (cached on
// `globalThis` to survive HMR in dev). We also avoid noisy `log: ['query']`
// in production where it can fill up the function log buffer.
const isProd = process.env.NODE_ENV === 'production'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error', 'warn'] : ['query', 'error', 'warn'],
  })

if (!isProd) globalForPrisma.prisma = db
