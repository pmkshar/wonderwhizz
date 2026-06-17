import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Lightweight health check used by the auth screen to know which providers
 * are actually wired up. Safe to expose publicly — no secrets are returned.
 */
export async function GET() {
  const googleConfigured =
    !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET

  const nextauthUrl =
    process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? null

  // Probe the DB so we surface connection issues early.
  let dbOk = false
  let dbError: string | null = null
  try {
    await db.$queryRaw`SELECT 1`
    dbOk = true
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json({
    ok: dbOk,
    time: new Date().toISOString(),
    auth: {
      googleConfigured,
      nextauthUrl,
      // mask the secret so we can confirm it's set without leaking it
      nextauthSecretSet: !!process.env.NEXTAUTH_SECRET,
    },
    db: {
      ok: dbOk,
      provider: 'sqlite',
      urlScheme: (process.env.DATABASE_URL ?? '').split(':')[0] || null,
      error: dbError,
    },
  })
}
