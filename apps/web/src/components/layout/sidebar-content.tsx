'use client'

import { Inbox, Bot, LayoutGrid, LogOut, Moon, Sun, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const navItems = [
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/portfolio', label: 'Portfolio', icon: LayoutGrid },
]

interface SidebarContentProps {
  onClose?: () => void
}

export function SidebarContent({ onClose }: SidebarContentProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, clearAuth } = useAuthStore()

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  async function handleLogout() {
    await fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    clearAuth()
    router.replace('/login')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Brand header */}
      <div className="flex items-center gap-2.5 px-4 h-14 shrink-0">
        <div className="w-6 h-6 rounded-md bg-[hsl(var(--primary))] flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-[hsl(var(--primary-foreground))] leading-none">H</span>
        </div>
        <span className="text-sm font-semibold tracking-tight">Horizon</span>
      </div>

      <div className="px-3 mb-3">
        <Button
          size="sm"
          className="w-full justify-start gap-2"
          asChild
          onClick={onClose}
        >
          <Link href="/ideas/new">
            <Plus className="h-3.5 w-3.5" />
            New Idea
          </Link>
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors min-h-[36px]',
                active
                  ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-[hsl(var(--primary))]' : '')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1 shrink-0">
        <Separator className="mb-2" />

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors min-h-[36px]"
          aria-label="Toggle theme"
        >
          <span className="relative h-4 w-4 shrink-0">
            <Sun className="absolute inset-0 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </span>
          <span>Toggle theme</span>
        </button>

        {/* User row */}
        <div className="flex items-center gap-3 rounded-md px-3 py-2 min-h-[44px]">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight truncate">{user?.name ?? 'User'}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate leading-tight">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.08)] transition-colors shrink-0"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
