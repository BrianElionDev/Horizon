'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIdea } from '@/lib/hooks/use-ideas'

export default function ValidatePage() {
  const { id } = useParams<{ id: string }>()
  const { data: idea, isLoading, isError, refetch } = useIdea(id)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-20 rounded bg-[hsl(var(--muted))]" />
        <div className="h-6 w-48 rounded bg-[hsl(var(--muted))]" />
        <div className="h-48 rounded-xl bg-[hsl(var(--muted))]" />
      </div>
    )
  }

  if (isError || !idea) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Could not load this idea.</p>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Link
        href={`/products/${id}/overview`}
        className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-5 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Overview
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight mb-1">Validation Report</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{idea.name}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" disabled>
          <RefreshCw className="h-4 w-4" />
          Run validation
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-[hsl(var(--muted))] p-5 mb-5">
          <CheckCircle2 className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
        </div>
        <h2 className="text-lg font-semibold mb-2">No validation run yet</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm mb-2">
          Validation checks completeness, consistency, viability, and risk across all 7 context areas.
        </p>
        <p className="text-xs text-[hsl(var(--muted-foreground)/0.6)] max-w-xs">
          Fill in at least one context area first, then run validation.
        </p>
      </div>
    </div>
  )
}
