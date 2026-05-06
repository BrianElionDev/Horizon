'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MOCK_AGENT_TASKS, formatRelativeDate, areaKeyToUrl } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function AgentResultPage() {
  const { id } = useParams<{ id: string }>()
  const task = MOCK_AGENT_TASKS.find((t) => t.id === id)

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-[hsl(var(--muted-foreground))] mb-4">Agent task not found.</p>
        <Button variant="ghost" asChild>
          <Link href="/agents">Back to agents</Link>
        </Button>
      </div>
    )
  }

  const StatusIcon =
    task.status === 'COMPLETED'
      ? CheckCircle2
      : task.status === 'FAILED'
      ? XCircle
      : Loader2

  const statusColor =
    task.status === 'COMPLETED'
      ? 'text-[hsl(var(--status-validated))]'
      : task.status === 'FAILED'
      ? 'text-[hsl(var(--destructive))]'
      : 'text-[hsl(var(--status-exploring))]'

  return (
    <div>
      <Link
        href="/agents"
        className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-5 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Agent Dashboard
      </Link>

      <div className="flex items-start gap-4 mb-6">
        <StatusIcon
          className={cn('h-6 w-6 mt-1 shrink-0', statusColor, task.status === 'RUNNING' && 'animate-spin')}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-xl font-semibold tracking-tight">{task.agentType}</h1>
            <Badge
              variant={
                task.status === 'COMPLETED'
                  ? 'status-validated'
                  : task.status === 'FAILED'
                  ? 'destructive'
                  : task.status === 'RUNNING'
                  ? 'status-exploring'
                  : 'secondary'
              }
            >
              {task.status.charAt(0) + task.status.slice(1).toLowerCase()}
            </Badge>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {task.productName} → {task.contextAreaName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Started', value: formatRelativeDate(task.startedAt) },
          { label: 'Completed', value: task.completedAt ? formatRelativeDate(task.completedAt) : '—' },
          { label: 'Status', value: task.status.charAt(0) + task.status.slice(1).toLowerCase() },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-[hsl(var(--muted))]">
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-0.5">{s.label}</div>
            <div className="text-sm font-medium">{s.value}</div>
          </div>
        ))}
      </div>

      {task.error && (
        <div className="p-4 rounded-lg border border-[hsl(var(--destructive)/0.2)] bg-[hsl(var(--destructive)/0.06)] mb-6">
          <p className="text-sm font-medium text-[hsl(var(--destructive))] mb-1">Error</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{task.error}</p>
          <Button size="sm" variant="outline" className="mt-3">
            Retry
          </Button>
        </div>
      )}

      {task.status === 'COMPLETED' && (
        <div className="p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <p className="text-sm font-semibold mb-3">Output</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
            The agent has completed its research and drafted content for{' '}
            <span className="font-medium text-[hsl(var(--foreground))]">{task.contextAreaName}</span>.
            Review the output in the context area and accept, edit, or reject each section.
          </p>
          <Button asChild>
            <Link href={`/products/${task.productId}/context/${areaKeyToUrl(task.contextAreaKey)}`}>
              Review in context area
            </Link>
          </Button>
        </div>
      )}

      {task.status === 'RUNNING' && (
        <div className="p-5 rounded-xl border border-[hsl(var(--status-exploring)/0.2)] bg-[hsl(var(--status-exploring)/0.04)]">
          <p className="text-sm font-medium mb-1">In progress</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            The agent is currently running. This usually takes 2–5 minutes. You'll be notified when it completes.
          </p>
        </div>
      )}
    </div>
  )
}
