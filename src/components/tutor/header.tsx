'use client'

import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { LogOut, Smartphone, GraduationCap, ChevronDown } from 'lucide-react'

interface Props {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    grade?: number | null
    provider?: string | null
  }
  onGradeChange?: (grade: number) => void
  onOpenMobileApp?: () => void
}

export function Header({ user, onGradeChange, onOpenMobileApp }: Props) {
  const [grade, setGrade] = useState<number>(user.grade ?? 8)

  async function handleGradeChange(value: string) {
    const g = Number(value)
    setGrade(g)
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: g }),
      })
      if (res.ok) {
        toast.success(`Class ${g} selected`)
        onGradeChange?.(g)
      }
    } catch {
      // ignore
    }
  }

  const initials = (user.name ?? user.email ?? '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-violet-500 text-lg shadow-sm">
            🦉
          </div>
          <div className="leading-tight">
            <div className="text-base font-extrabold tracking-tight">WonderWhiz</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              AI Tutor for Kids
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Grade selector */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <Select value={String(grade)} onValueChange={handleGradeChange}>
              <SelectTrigger className="h-9 w-[120px] gap-1" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    Class {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {onOpenMobileApp && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenMobileApp}
              className="hidden gap-1.5 sm:flex"
            >
              <Smartphone className="h-4 w-4" /> Mobile App
            </Button>
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-7 w-7">
                  {user.image ? <AvatarImage src={user.image} alt="" /> : null}
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
                  {user.name ?? user.email?.split('@')[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">
                {user.name ?? 'Kid'}
                <div className="truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 sm:hidden">
                <Select value={String(grade)} onValueChange={handleGradeChange}>
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((g) => (
                      <SelectItem key={g} value={String(g)}>
                        Class {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {onOpenMobileApp && (
                <DropdownMenuItem
                  onClick={onOpenMobileApp}
                  className="cursor-pointer sm:hidden"
                >
                  <Smartphone className="mr-2 h-4 w-4" /> Get Mobile App
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="sm:hidden" />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/' })}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
