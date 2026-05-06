'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Download, Zap, RefreshCw, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CompletenessRing } from '@/components/shared/completeness-ring'
import { ContextAreaCard } from '@/components/context/context-area-card'
import { useIdea, useContextAreaSummaries } from '@/lib/hooks/use-ideas'
import { buildContextAreas, computeOverallScore } from '@/lib/product-types'
import { formatRelativeDate } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const STATUS_VARIANT: Record<string, 'status-new' | 'status-exploring' | 'status-validated' | 'status-archived' | 'status-dismissed'> = {
  NEW: 'status-new',
  EXPLORING: 'status-exploring',
  VALIDATED: 'status-validated',
  ARCHIVED: 'status-archived',
  DISMISSED: 'status-dismissed',
}

const STATUS_LABEL: Record<string, string> = {
  NEW: 'New',
  EXPLORING: 'Exploring',
  VALIDATED: 'Validated',
  ARCHIVED: 'Archived',
  DISMISSED: 'Dismissed',
}

function OverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 w-20 rounded bg-[hsl(var(--muted))]" />
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-full bg-[hsl(var(--muted))] shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-5 w-56 rounded bg-[hsl(var(--muted))]" />
          <div className="h-3.5 w-full max-w-md rounded bg-[hsl(var(--muted))]" />
          <div className="h-3 w-32 rounded bg-[hsl(var(--muted))]" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1,2,3,4].map(n => <div key={n} className="h-16 rounded-lg bg-[hsl(var(--muted))]" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {[1,2,3,4,5,6,7].map(n => <div key={n} className="h-28 rounded-xl bg-[hsl(var(--muted))]" />)}
      </div>
    </div>
  )
}

export default function ProductOverviewPage() {
  const { id } = useParams<{ id: string }>()
  const { data: idea, isLoading, isError, refetch } = useIdea(id)
  const { data: summaries = [] } = useContextAreaSummaries(id)

  const contextAreas = buildContextAreas(summaries)
  const overallScore = computeOverallScore(contextAreas)

  const completedAreas = contextAreas.filter((a) => a.completenessScore >= 80).length
  const inProgress = contextAreas.filter((a) => a.completenessScore > 0 && a.completenessScore < 80).length
  const empty = contextAreas.filter((a) => a.completenessScore === 0).length
  const nextArea = [...contextAreas].sort((a, b) => a.order - b.order).find((a) => a.completenessScore < 80)

  if (isLoading) return <OverviewSkeleton />

  if (isError || !idea) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Could not load this idea.</p>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/inbox">Back to inbox</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Back */}
      <Link
        href="/inbox"
        className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-5 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Inbox
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <CompletenessRing value={overallScore} size={56} strokeWidth={4} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-semibold tracking-tight">{idea.name}</h1>
                <Badge variant={STATUS_VARIANT[idea.status]}>
                  {STATUS_LABEL[idea.status]}
                </Badge>
              </div>
              {idea.description && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                  {idea.description}
                </p>
              )}
              {idea.origin && (
                <p className="text-xs text-[hsl(var(--muted-foreground)/0.6)] mt-1">
                  via {idea.origin} · updated {formatRelativeDate(idea.updatedAt)}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {idea.status === 'VALIDATED' && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/products/${idea.id}/export`}>
                    <Download className="h-4 w-4" />
                    Export
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/ideas/${idea.id}/setup`}>
                  <BookOpen className="h-4 w-4" />
                  Add context
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/products/${idea.id}/validate`}>
                  <CheckCircle2 className="h-4 w-4" />
                  Validate
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Complete',
            value: `${completedAreas}/7`,
            sub: 'context areas',
            color: 'text-[hsl(var(--status-validated))]',
            bg: 'bg-[hsl(var(--status-validated)/0.06)]',
          },
          {
            label: 'In Progress',
            value: inProgress,
            sub: inProgress === 1 ? 'area' : 'areas',
            color: 'text-[hsl(var(--status-exploring))]',
            bg: 'bg-[hsl(var(--status-exploring)/0.06)]',
          },
          {
            label: 'Not Started',
            value: empty,
            sub: empty === 1 ? 'area' : 'areas',
            color: 'text-[hsl(var(--muted-foreground))]',
            bg: 'bg-[hsl(var(--muted))]',
          },
          {
            label: 'Overall Score',
            value: `${overallScore}%`,
            sub: overallScore >= 80 ? 'ready to validate' : overallScore > 0 ? 'keep going' : 'get started',
            color: overallScore >= 80 ? 'text-[hsl(var(--status-validated))]' : 'text-[hsl(var(--foreground))]',
            bg: 'bg-[hsl(var(--muted))]',
          },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-xl ${s.bg} flex flex-col`}>
            <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
            <div className="text-xs font-medium text-[hsl(var(--foreground)/0.8)] mt-0.5">{s.label}</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground)/0.6)] mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Recommended next / Required first step */}
      {nextArea && (() => {
        const isRequiredStart = idea.status === 'NEW' && nextArea.key === 'problem_definition' && nextArea.completenessScore === 0
        return (
          <div className={cn(
            'flex items-center gap-3 px-4 py-3.5 rounded-xl border mb-6',
            isRequiredStart
              ? 'border-indigo-500/30 bg-indigo-500/05'
              : 'border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.04)]'
          )}>
            <div className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              isRequiredStart ? 'bg-indigo-500/15' : 'bg-[hsl(var(--primary)/0.1)]'
            )}>
              <Zap className={cn('h-4 w-4', isRequiredStart ? 'text-indigo-400' : 'text-[hsl(var(--primary))]')} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-xs font-semibold mb-0.5',
                isRequiredStart ? 'text-indigo-400' : 'text-[hsl(var(--primary))]'
              )}>
                {isRequiredStart ? 'Start here — required first step' : 'Recommended next'}
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {isRequiredStart
                  ? <>Define the problem before anything else. Everything depends on this.</>
                  : <>{nextArea.completenessScore === 0 ? 'Start' : 'Continue'}{' '}<span className="font-semibold text-[hsl(var(--foreground))]">{nextArea.name}</span></>
                }
              </p>
            </div>
            <Button size="sm" className="shrink-0" asChild>
              <Link href={`/products/${idea.id}/context/${nextArea.key.replace(/_/g, '-')}`}>
                {isRequiredStart ? 'Begin' : nextArea.completenessScore === 0 ? 'Start' : 'Continue'}
              </Link>
            </Button>
          </div>
        )
      })()}

      {/* Context areas */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
          Context Areas
        </h2>
        <span className="text-xs text-[hsl(var(--muted-foreground)/0.6)]">{contextAreas.length} areas</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {contextAreas.map((area) => (
          <ContextAreaCard
            key={area.key}
            area={area}
            productId={idea.id}
            isRequired={idea.status === 'NEW' && area.key === 'problem_definition' && area.completenessScore === 0}
          />
        ))}
      </div>
    </div>
  )
}
