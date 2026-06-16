'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Mail, Lock, User, Sparkles, GraduationCap } from 'lucide-react'

const SUBJECTS = [
  { emoji: '➗', label: 'Maths' },
  { emoji: '📝', label: 'Hindi' },
  { emoji: '🔬', label: 'Science' },
  { emoji: '🦁', label: 'Kannada' },
]

export function AuthScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState<'local' | 'google' | null>(null)

  // login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regGrade, setRegGrade] = useState<number>(8)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter email and password.')
      return
    }
    setLoading('local')
    const res = await signIn('credentials', {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    })
    setLoading(null)
    if (res?.error) {
      toast.error('Wrong email or password. Try again.')
      return
    }
    toast.success('Welcome back! 🎉')
    router.refresh()
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!regName || !regEmail || regPassword.length < 6) {
      toast.error('Please fill all fields. Password must be 6+ characters.')
      return
    }
    setLoading('local')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          grade: regGrade,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        toast.error(data.error ?? 'Registration failed.')
        return
      }
      const sign = await signIn('credentials', {
        email: regEmail,
        password: regPassword,
        redirect: false,
      })
      if (sign?.error) {
        toast.success('Account created! Please sign in.')
        setMode('login')
        setLoginEmail(regEmail)
        setLoginPassword('')
        return
      }
      toast.success('Welcome to WonderWhiz! 🌟')
      router.refresh()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleGoogle() {
    setLoading('google')
    await signIn('google', { callbackUrl: '/' })
    // page will redirect
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full ww-blob opacity-70 blur-2xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full ww-blob opacity-60 blur-2xl" />
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full ww-blob opacity-50 blur-2xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-8 px-4 py-10 lg:flex-row lg:gap-12">
        {/* Left: Hero */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" /> AI Tutor for Class 1 — 10
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Meet <span className="ww-gradient-text">WonderWhiz</span> — your friendly AI tutor.
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
            Ask questions in <strong>Maths, Hindi, Science, or Kannada</strong> and pick how you want
            the answer explained — step-by-step, quick, intuitive, with tips, visually, with logic,
            as code, or even with jokes! Plus voice-over in 3 languages. 🎧
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {SUBJECTS.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-sm"
              >
                <span className="text-lg">{s.emoji}</span> {s.label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground lg:justify-start">
            <span>8 explanation styles</span>
            <span aria-hidden>•</span>
            <span>3 voice-over languages</span>
            <span aria-hidden>•</span>
            <span>Works on web + mobile app</span>
          </div>
        </div>

        {/* Right: Auth card */}
        <div className="w-full max-w-md">
          <Card className="ww-shadow-card overflow-hidden border-border/60">
            <CardContent className="p-0">
              <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'register')}>
                <div className="border-b border-border/60 bg-muted/30 px-4 pt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Log In</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                </div>

                {/* LOGIN */}
                <TabsContent value="login" className="p-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          className="pl-9"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="pl-9"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full text-base font-semibold"
                      disabled={loading !== null}
                    >
                      {loading === 'local' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                        </>
                      ) : (
                        <>Log In & Start Learning 🚀</>
                      )}
                    </Button>
                  </form>

                  <Divider />
                  <GoogleButton onClick={handleGoogle} loading={loading === 'google'} />
                </TabsContent>

                {/* REGISTER */}
                <TabsContent value="register" className="p-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Kid&apos;s Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="reg-name"
                          type="text"
                          placeholder="e.g. Aarav"
                          className="pl-9"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Parent Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="reg-email"
                          type="email"
                          autoComplete="email"
                          placeholder="parent@example.com"
                          className="pl-9"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password (min 6 characters)</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="reg-password"
                          type="password"
                          autoComplete="new-password"
                          placeholder="••••••••"
                          className="pl-9"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-grade">Class / Grade</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                          id="reg-grade"
                          value={regGrade}
                          onChange={(e) => setRegGrade(Number(e.target.value))}
                          className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((g) => (
                            <option key={g} value={g}>
                              Class {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full text-base font-semibold"
                      disabled={loading !== null}
                    >
                      {loading === 'local' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                        </>
                      ) : (
                        <>Create Account & Start 🌟</>
                      )}
                    </Button>
                  </form>

                  <Divider />
                  <GoogleButton onClick={handleGoogle} loading={loading === 'google'} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            By continuing you agree to use WonderWhiz responsibly. Parents, please supervise kids under 13.
          </p>
        </div>
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      <span>OR</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full font-medium"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon className="mr-2 h-4 w-4" />
      )}
      Continue with Google
    </Button>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}
