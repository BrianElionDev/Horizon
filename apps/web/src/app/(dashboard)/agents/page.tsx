'use client'

import { Bot } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'

export default function AgentsPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight mb-0.5">Agent Dashboard</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Research agents running across all your products.
        </p>
      </div>

      <EmptyState
        icon={Bot}
        title="No agent tasks yet"
        description="Agent tasks will appear here when you run research agents from a context area."
      />
    </div>
  )
}
