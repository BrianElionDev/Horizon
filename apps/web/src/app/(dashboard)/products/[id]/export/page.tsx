'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Map, BookOpen, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIdea } from '@/lib/hooks/use-ideas'
import { cn } from '@/lib/utils'

const EXPORT_TARGETS = [
  {
    key: 'forge',
    icon: Package,
    name: 'Forge Package',
    description:
      'Structured JSON spec for the build system — requirements, architecture decisions, feature breakdown, and acceptance criteria.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
    border: 'border-indigo-400/20',
  },
  {
    key: 'atlas',
    icon: Map,
    name: 'Atlas Context',
    description:
      'Condensed context package for AI coding assistants — everything they need to understand the product without reading the full spec.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
  },
  {
    key: 'ledger',
    icon: BookOpen,
    name: 'Ledger Baseline',
    description:
      'Financial model seed — market size, unit economics, CAC/LTV estimates, and milestone-based revenue projections.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
]

export default function ExportPage() {
  const { id } = useParams<{ id: string }>()
  const { data: idea, isLoading, isError, refetch } = useIdea(id)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-20 rounded bg-[hsl(var(--muted))]" />
        <div className="h-6 w-48 rounded bg-[hsl(var(--muted))]" />
        <div className="space-y-4">
          {[1,2,3].map(n => <div key={n} className="h-28 rounded-xl bg-[hsl(var(--muted))]" />)}
        </div>
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

  const canExport = idea.status === 'VALIDATED'

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
          <h1 className="text-xl font-semibold tracking-tight mb-1">Export</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{idea.name}</p>
        </div>
      </div>

      {!canExport && (
        <div className="p-4 rounded-lg border border-[hsl(var(--status-archived)/0.3)] bg-[hsl(var(--status-archived)/0.05)] mb-6">
          <p className="text-sm font-medium mb-0.5">Not ready for export</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Complete all context areas and pass validation before exporting.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {EXPORT_TARGETS.map((target) => {
          const Icon = target.icon
          return (
            <div
              key={target.key}
              className={cn('rounded-xl border overflow-hidden', target.bg, target.border)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg', target.bg, target.border, 'border')}>
                      <Icon className={cn('h-5 w-5', target.color)} />
                    </div>
                    <div>
                      <h3 className={cn('text-sm font-semibold mb-1', target.color)}>{target.name}</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-lg">
                        {target.description}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" disabled className="shrink-0 gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    Generate
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
