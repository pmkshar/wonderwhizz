import '@/lib/env-guard' // must run before next-auth imports (cleans empty env strings)
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/password'

// Defensive env access: Vercel marks env vars as "sensitive" and they can
// occasionally arrive as empty strings (especially NEXTAUTH_URL during the
// very first build). Treat empty strings as "unset" so downstream code can
// fall back to defaults instead of crashing.
const env = (key: string): string | undefined => {
  const v = process.env[key]
  return v && v.length > 0 ? v : undefined
}

// Resolve the canonical site URL once. Order of preference:
//   1. NEXTAUTH_URL (explicit)
//   2. NEXT_PUBLIC_SITE_URL (alternative some hosts set)
//   3. VERCEL_URL (auto-set by Vercel on every deploy, no scheme)
//   4. http://localhost:3000 (local dev)
function resolveSiteUrl(): string {
  if (env('NEXTAUTH_URL')) return env('NEXTAUTH_URL')!
  if (env('NEXT_PUBLIC_SITE_URL')) return env('NEXT_PUBLIC_SITE_URL')!
  if (env('VERCEL_URL')) return `https://${env('VERCEL_URL')}`
  return 'http://localhost:3000'
}

// Only register Google provider when env vars are actually set.
// This prevents the "client_id is required" crash when users click
// "Continue with Google" on a deployment that hasn't configured OAuth.
function buildProviders() {
  const providers = [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = credentials.email.toLowerCase().trim()
        const user = await db.user.findUnique({ where: { email } })
        if (!user || !user.passwordHash) return null
        const ok = await verifyPassword(credentials.password, user.passwordHash)
        if (!ok) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        }
      },
    }),
  ]

  if (env('GOOGLE_CLIENT_ID') && env('GOOGLE_CLIENT_SECRET')) {
    // Lazy import so the openid-client lib is only loaded when needed.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const GoogleProvider = require('next-auth/providers/google').default
    providers.push(
      GoogleProvider({
        clientId: env('GOOGLE_CLIENT_ID')!,
        clientSecret: env('GOOGLE_CLIENT_SECRET')!,
        allowDangerousEmailAccountLinking: true,
      })
    )
  }

  return providers
}

export const authOptions: NextAuthOptions = {
  providers: buildProviders(),
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/' },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user?.email) {
        const email = user.email.toLowerCase().trim()
        const existing = await db.user.findUnique({ where: { email } })
        if (!existing) {
          await db.user.create({
            data: {
              email,
              name: user.name ?? null,
              image: user.image ?? null,
              provider: 'google',
            },
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        ;(session.user as { id?: string }).id = token.id as string
      }
      return session
    },
  },
  secret: env('NEXTAUTH_SECRET') ?? 'dev-secret-change-me-in-production',
}

// On Vercel, VERCEL_URL is auto-injected on every deployment. If the user
// hasn't explicitly set NEXTAUTH_URL, we promote VERCEL_URL to NEXTAUTH_URL
// at module-load time. This prevents next-auth's parseUrl() from receiving
// an empty string during `next build` static prerender (which would throw
// `TypeError: Invalid URL { input: '' }`).
//
// We do this AFTER authOptions is defined so we don't affect the
// `secret` resolution above.
if (!env('NEXTAUTH_URL') && env('VERCEL_URL')) {
  process.env.NEXTAUTH_URL = `https://${env('VERCEL_URL')}`
}


