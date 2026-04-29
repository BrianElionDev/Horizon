'use client'

import { useState } from 'react'
import { Navbar } from './navbar'
import { SidebarContent } from './sidebar-content'
import { Sheet, SheetContent } from '@/components/ui/sheet'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar onMenuClick={() => setMobileOpen(true)} />

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-[var(--navbar-height)] hidden h-[calc(100vh-var(--navbar-height))] w-[var(--sidebar-width)] flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="pt-0 pb-0">
          <div className="flex h-full flex-col pt-[var(--navbar-height)]">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="pt-[var(--navbar-height)] md:pl-[var(--sidebar-width)]">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
