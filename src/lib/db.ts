import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isProd = process.env.NODE_ENV === 'production'

/**
 * Lazy Prisma client.
 *
 * We can't construct `new PrismaClient()` at module-load time because Next.js
 * evaluates modules during `next build` to prerender static pages — and at
 * build time `DATABASE_URL` is often missing or invalid (e.g. on Vercel where
 * the live DB URL is only injected at runtime). Constructing eagerly made
 * `next build` throw `TypeError: Invalid URL` from the Prisma engine.
 *
 * Instead, we expose a Proxy that defers construction until the first time
 * any property is accessed. Static prerender never touches the DB, so the
 * client is never built during the build phase.
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: isProd ? ['error', 'warn'] : ['query', 'error', 'warn'],
  })
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

// Proxy that defers client creation until first property access.
// TypeScript sees it as a PrismaClient, but the underlying constructor
// is only invoked when something is actually called.
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
}) as PrismaClient
