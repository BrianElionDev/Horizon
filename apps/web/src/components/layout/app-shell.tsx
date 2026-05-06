'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { SidebarContent } from './sidebar-content'
import { Sheet, SheetContent } from '@/components/ui/sheet'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[hsl(var(--background))] overflow-hidden">
      {/* Desktop sidebar — full height, fixed */}
      <aside className="hidden md:flex flex-col w-(--sidebar-width) shrink-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar — sheet drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SidebarContent onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Right side — topbar (mobile only) + scrollable content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 h-12 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.95)] backdrop-blur-sm shrink-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[hsl(var(--primary))] flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-[hsl(var(--primary-foreground))] leading-none">H</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">Horizon</span>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
