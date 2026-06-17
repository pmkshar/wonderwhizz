'use client'

import { useState, useEffect, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sparkles,
  Home,
  MessageCircle,
  BarChart3,
  BookOpen,
  Trophy,
  Users,
  Smartphone,
  Menu,
  LogOut,
  GraduationCap,
  Settings,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AskPage } from './pages/ask-page'
import { ProgressPage } from './pages/progress-page'
import { PracticePage } from './pages/practice-page'
import { AchievementsPage } from './pages/achievements-page'
import { ParentPage } from './pages/parent-page'
import { MobileAppDialog } from './mobile-app-dialog'

export type NavPage =
  | 'home'
  | 'ask'
  | 'practice'
  | 'progress'
  | 'achievements'
  | 'parent'
  | 'settings'

interface AppUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  grade?: number | null
  provider?: string | null
  role?: string | null
}

interface AppShellProps {
  user: AppUser
}

const STUDENT_NAV: Array<{
  id: NavPage
  label: string
  icon: React.ComponentType<{ className?: string }>
  emoji: string
  description: string
}> = [
  { id: 'home', label: 'Home', icon: Home, emoji: '🏠', description: 'Your learning snapshot' },
  { id: 'ask', label: 'Ask Tutor', icon: MessageCircle, emoji: '🦉', description: 'Ask any question' },
  { id: 'practice', label: 'Practice', icon: BookOpen, emoji: '📚', description: 'Question banks & quizzes' },
  { id: 'progress', label: 'Progress', icon: BarChart3, emoji: '📊', description: 'Stats & streaks' },
  { id: 'achievements', label: 'Achievements', icon: Trophy, emoji: '🏆', description: 'Badges & rewards' },
]

const PARENT_NAV: Array<{
  id: NavPage
  label: string
  icon: React.ComponentType<{ className?: string }>
  emoji: string
  description: string
}> = [
  { id: 'home', label: 'Home', icon: Home, emoji: '🏠', description: 'Family overview' },
  { id: 'parent', label: 'Children', icon: Users, emoji: '👨‍👩‍👧', description: 'Linked kids' },
  { id: 'ask', label: 'Try Tutor', icon: MessageCircle, emoji: '🦉', description: 'See what kids see' },
]

export function AppShell({ user }: AppShellProps) {
  const isParent = user.role === 'parent'
  const nav = isParent ? PARENT_NAV : STUDENT_NAV
  const [page, setPage] = useState<NavPage>(isParent ? 'home' : 'home')
  const [grade, setGrade] = useState<number>(user.grade ?? 8)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [mobileAppOpen, setMobileAppOpen] = useState(false)

  // Default landing page for parents is the children dashboard
  useEffect(() => {
    if (isParent) setPage('parent')
  }, [isParent])

  const handleGradeChange = useCallback(async (value: string) => {
    const g = Number(value)
    setGrade(g)
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: g }),
      })
      if (res.ok) toast.success(`Class ${g} selected`)
    } catch {
      /* ignore */
    }
  }, [])

  const initials =
    (user.name ?? user.email ?? '?')
      .split(' ')
      .map((s) => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? '?'

  function goTo(p: NavPage) {
    setPage(p)
    setMobileNavOpen(false)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar lg:flex">
        <SidebarContent
          user={user}
          nav={nav}
          page={page}
          onNavigate={goTo}
          onOpenMobileApp={() => setMobileAppOpen(true)}
        />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent
            user={user}
            nav={nav}
            page={page}
            onNavigate={goTo}
            onOpenMobileApp={() => {
              setMobileAppOpen(true)
              setMobileNavOpen(false)
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/65">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 via-pink-500 to-violet-500 text-sm shadow-sm">
              🦉
            </div>
            <span className="text-sm font-extrabold tracking-tight">WonderWhiz</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {!isParent && (
              <div className="hidden items-center gap-1.5 sm:flex">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <Select value={String(grade)} onValueChange={handleGradeChange}>
                  <SelectTrigger className="h-9 w-[110px] gap-1" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                      <SelectItem key={g} value={String(g)}>
                        Class {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMobileAppOpen(true)}
              className="hidden gap-1.5 sm:flex"
            >
              <Smartphone className="h-4 w-4" /> App
            </Button>

            <button
              type="button"
              onClick={() => goTo('settings')}
              className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Settings"
            >
              <Avatar className="h-7 w-7">
                {user.image ? <AvatarImage src={user.image} alt="" /> : null}
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[100px] truncate text-sm font-medium sm:inline">
                {user.name ?? user.email?.split('@')[0]}
              </span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6"
            >
              {page === 'home' && (
                <HomePage user={user} grade={grade} onNavigate={goTo} />
              )}
              {page === 'ask' && (
                <AskPage
                  user={user}
                  grade={grade}
                  onGradeChange={setGrade}
                />
              )}
              {page === 'practice' && !isParent && (
                <PracticePage
                  userGrade={grade}
                  onAskTutor={(q) => {
                    goTo('ask')
                    // Stash the question for the Ask page to pick up
                    sessionStorage.setItem('ww-prefill-question', q)
                  }}
                />
              )}
              {page === 'progress' && !isParent && <ProgressPage />}
              {page === 'achievements' && !isParent && <AchievementsPage />}
              {page === 'parent' && isParent && (
                <ParentPage
                  onSwitchToStudent={async () => {
                    await fetch('/api/user', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ role: 'student' }),
                    })
                    toast.success('Switched to student mode')
                    setTimeout(() => window.location.reload(), 500)
                  }}
                />
              )}
              {page === 'parent' && !isParent && (
                <ParentRedirectNotice />
              )}
              {page === 'settings' && (
                <SettingsPage
                  user={user}
                  onSignOut={() => signOut({ callbackUrl: '/' })}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-border/60 bg-muted/20 px-4 py-3 text-center text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">WonderWhiz</span> · AI Tutor for Kids ·
          Made with 💛 for curious minds
        </footer>
      </div>

      <MobileAppDialog open={mobileAppOpen} onOpenChange={setMobileAppOpen} />
    </div>
  )
}

/* --------------------------- Sidebar --------------------------- */

function SidebarContent({
  user,
  nav,
  page,
  onNavigate,
  onOpenMobileApp,
}: {
  user: AppUser
  nav: Array<{ id: NavPage; label: string; icon: React.ComponentType<{ className?: string }>; emoji: string; description: string }>
  page: NavPage
  onNavigate: (p: NavPage) => void
  onOpenMobileApp: () => void
}) {
  const isParent = user.role === 'parent'
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-violet-500 text-lg shadow-sm">
          🦉
        </div>
        <div className="leading-tight">
          <div className="text-base font-extrabold tracking-tight">WonderWhiz</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {isParent ? 'Parent Portal' : 'AI Tutor for Kids'}
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const Icon = item.icon
          const active = page === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-sm',
                  active ? 'bg-primary-foreground/15' : 'bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                <span
                  className={cn(
                    'block text-[11px] leading-tight',
                    active ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}
                >
                  {item.description}
                </span>
              </span>
            </button>
          )
        })}
      </nav>

      {/* Quick links */}
      <div className="space-y-1 border-t border-sidebar-border px-3 py-3">
        <button
          type="button"
          onClick={onOpenMobileApp}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <Smartphone className="h-4 w-4" /> Get Mobile App
        </button>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/5"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      {/* User card */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
          <Avatar className="h-8 w-8">
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {(user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-xs font-semibold">
              {user.name ?? user.email?.split('@')[0]}
            </div>
            <div className="truncate text-[10px] text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------- Home Page --------------------------- */

function HomePage({
  user,
  grade,
  onNavigate,
}: {
  user: AppUser
  grade: number
  onNavigate: (p: NavPage) => void
}) {
  const isParent = user.role === 'parent'
  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-orange-50 via-pink-50 to-violet-50 p-6 dark:from-orange-950/30 dark:via-pink-950/30 dark:to-violet-950/30 sm:p-8"
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/40 blur-2xl dark:bg-white/5" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-violet-200/40 blur-2xl dark:bg-violet-800/20" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-primary dark:bg-zinc-900/60">
            <Sparkles className="h-3 w-3" />
            {isParent ? 'Parent Portal' : `Class ${grade}`}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {isParent ? (
              <>
                Welcome back, <span className="ww-gradient-text">{user.name ?? 'Parent'}</span>!
              </>
            ) : (
              <>
                Hi <span className="ww-gradient-text">{user.name ?? 'learner'}</span>! Ready to learn?
              </>
            )}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {isParent
              ? 'Track your children\u2019s progress, see what they\u2019re learning, and celebrate their achievements — all in one place.'
              : 'Ask anything in Maths, Hindi, Science, or Kannada. Pick how you want the answer explained, and listen along with voice-over.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => onNavigate(isParent ? 'parent' : 'ask')} className="gap-2">
              <Sparkles className="h-4 w-4" />
              {isParent ? 'Open Children Dashboard' : 'Ask a Question'}
            </Button>
            {!isParent && (
              <Button variant="outline" onClick={() => onNavigate('practice')} className="gap-2">
                <BookOpen className="h-4 w-4" /> Practice Questions
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick tiles */}
      {!isParent && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <QuickTile
            emoji="🦉"
            title="Ask WonderWhiz"
            desc="Get answers in 8 styles"
            color="from-orange-400 to-pink-500"
            onClick={() => onNavigate('ask')}
          />
          <QuickTile
            emoji="📚"
            title="Practice"
            desc="Question banks by grade"
            color="from-sky-400 to-indigo-500"
            onClick={() => onNavigate('practice')}
          />
          <QuickTile
            emoji="📊"
            title="My Progress"
            desc="Streaks, accuracy & more"
            color="from-emerald-400 to-teal-500"
            onClick={() => onNavigate('progress')}
          />
          <QuickTile
            emoji="🏆"
            title="Achievements"
            desc="Badges you\u2019ve earned"
            color="from-amber-400 to-yellow-500"
            onClick={() => onNavigate('achievements')}
          />
        </div>
      )}

      {isParent && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickTile
            emoji="👨‍👩‍👧"
            title="Children"
            desc="View linked kids\u2019 progress"
            color="from-violet-400 to-purple-500"
            onClick={() => onNavigate('parent')}
          />
          <QuickTile
            emoji="🦉"
            title="Try the Tutor"
            desc="See what your kids see"
            color="from-orange-400 to-pink-500"
            onClick={() => onNavigate('ask')}
          />
        </div>
      )}
    </div>
  )
}

function QuickTile({
  emoji,
  title,
  desc,
  color,
  onClick,
}: {
  emoji: string
  title: string
  desc: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={cn(
          'mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-xl shadow-sm',
          color
        )}
      >
        {emoji}
      </div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </button>
  )
}

/* --------------------------- Settings Page --------------------------- */

function SettingsPage({ user, onSignOut }: { user: AppUser; onSignOut: () => void }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account.</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14">
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
              {(user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-base font-semibold">{user.name ?? '—'}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
            <div className="mt-1 flex gap-2 text-xs">
              <span className="rounded-full bg-muted px-2 py-0.5">
                {user.role === 'parent' ? 'Parent' : 'Student'}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5">Class {user.grade}</span>
              {user.provider && (
                <span className="rounded-full bg-muted px-2 py-0.5 capitalize">{user.provider}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Account</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          To change your email or password, please sign out and use the &quot;Forgot password&quot;
          link on the login page.
        </p>
        <Button variant="destructive" className="mt-4 gap-2" onClick={onSignOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  )
}

function ParentRedirectNotice() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
      <div className="text-4xl">🔒</div>
      <h2 className="mt-2 text-lg font-semibold">Parent area</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This section is only available for parent accounts.
      </p>
    </div>
  )
}
