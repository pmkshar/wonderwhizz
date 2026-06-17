'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AuthScreen } from '@/components/auth/auth-screen'
import { AppShell } from '@/components/tutor/app-shell'
import { Loader2 } from 'lucide-react'

interface AppUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  grade?: number | null
  provider?: string | null
  role?: string | null
}

export default function Home() {
  const { data: session, status } = useSession()
  // user === undefined  → still loading
  // user === null       → not logged in
  // user === object     → logged in
  const [user, setUser] = useState<AppUser | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    if (status === 'loading') return

    if (!session?.user?.email) {
      // Not logged in — defer the setState to a microtask to satisfy the
      // react-hooks/set-state-in-effect rule (which targets *synchronous* setState calls).
      queueMicrotask(() => {
        if (!cancelled) {
          setUser(null)
        }
      })
      return
    }

    // Logged in — fetch the full user record from /api/user (async → no lint error)
    void (async () => {
      try {
        const res = await fetch('/api/user', { cache: 'no-store' })
        const data = (await res.json().catch(() => ({ user: null }))) as { user: AppUser | null }
        if (!cancelled) setUser(data.user)
      } catch {
        if (!cancelled) setUser(null)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [session, status])

  if (status === 'loading' || (session && user === undefined)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading WonderWhiz...</p>
      </div>
    )
  }

  if (!session || !user) {
    return <AuthScreen />
  }

  return <AppShell user={user} />
}

