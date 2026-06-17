import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isProd = process.env.NODE_ENV === 'production'

/**
 * Lazy Prisma client with libSQL adapter support.
 *
 * We can't construct `new PrismaClient()` at module-load time because Next.js
 * evaluates modules during `next build` to prerender static pages — and at
 * build time `DATABASE_URL` is often missing or invalid. Constructing eagerly
 * made `next build` throw `TypeError: Invalid URL` from the Prisma engine.
 *
 * When DATABASE_URL starts with `libsql:` (Turso / libSQL), we use the
 * `@prisma/adapter-libsql` driver adapter — this is what makes the existing
 * `provider = "sqlite"` Prisma schema work against a remote libSQL server.
 * For `file:` URLs (local dev), Prisma's built-in SQLite engine is used
 * directly (no adapter needed).
 */
function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL ?? ''
  const log = isProd ? ['error', 'warn'] : ['query', 'error', 'warn']

  if (dbUrl.startsWith('libsql:') || dbUrl.startsWith('http:') || dbUrl.startsWith('https:')) {
    // Turso / libSQL — use the driver adapter
    const libsql = createClient({
      url: dbUrl,
      // authToken can also be embedded in the URL as ?authToken=...,
      // which is how we set it on Vercel. Passing it explicitly here is
      // a safety net for users who set TURSO_AUTH_TOKEN separately.
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ log, adapter })
  }

  // Local SQLite file — use Prisma's built-in engine
  return new PrismaClient({ log })
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
