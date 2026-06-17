/**
 * Tiny module loaded as early as possible (via `import` in `layout.tsx` and
 * `src/lib/auth.ts`). Its only job: ensure certain env vars are NEVER empty
 * strings, because downstream libraries (notably next-auth v4) crash on
 * `new URL("")` when an env var is set-but-blank.
 *
 * Vercel marks env vars as "sensitive" and they can sometimes arrive as
 * empty strings during the first build or when a user saves an env var
 * without a value. This guard promotes empty strings to `undefined` so
 * downstream code can fall back to sensible defaults (like VERCEL_URL).
 */
if (typeof process !== 'undefined' && process.env) {
  const GUARDED_KEYS = [
    'NEXTAUTH_URL',
    'NEXTAUTH_URL_INTERNAL',
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ]
  for (const key of GUARDED_KEYS) {
    const v = process.env[key]
    if (v !== undefined && v.trim() === '') {
      delete process.env[key]
    }
  }

  // Promote VERCEL_URL to NEXTAUTH_URL if the user hasn't set one. Vercel
  // auto-injects VERCEL_URL on every deploy (e.g. "wonderwhiz-abc123-pmkshars-projects.vercel.app").
  if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
  }
  // Also expose an internal URL for server-side fetches (avoids the
  // VERCEL_URL promotion racing on different workers).
  if (!process.env.NEXTAUTH_URL_INTERNAL && process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL_INTERNAL = `https://${process.env.VERCEL_URL}`
  }
}

export {}
