import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate, areaKeyToUrl } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { MockAgentTask } from '@/lib/mock-data'

const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    label: 'Pending',
    color: 'text-[hsl(var(--muted-foreground))]',
    spin: false,
    badge: 'secondary' as const,
  },
  RUNNING: {
    icon: Loader2,
    label: 'Running',
    color: 'text-[hsl(var(--status-exploring))]',
    spin: true,
    badge: 'status-exploring' as const,
  },
  COMPLETED: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-[hsl(var(--status-validated))]',
    spin: false,
    badge: 'status-validated' as const,
  },
  FAILED: {
    icon: XCircle,
    label: 'Failed',
    color: 'text-[hsl(var(--destructive))]',
    spin: false,
    badge: 'destructive' as const,
  },
}

interface AgentTaskCardProps {
  task: MockAgentTask
}

export function AgentTaskCard({ task }: AgentTaskCardProps) {
  const config = STATUS_CONFIG[task.status]
  const Icon = config.icon

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <Icon
        className={cn('h-5 w-5 mt-0.5 shrink-0', config.color, config.spin && 'animate-spin')}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
            {task.agentType}
          </span>
          <Badge variant={config.badge}>{config.label}</Badge>
        </div>

        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5">
          {task.productName} → {task.contextAreaName}
        </p>

        {task.error && (
          <p className="text-xs text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] rounded-md px-2.5 py-1.5 mb-1.5">
            {task.error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[hsl(var(--muted-foreground)/0.6)]">
            Started {formatRelativeDate(task.startedAt)}
          </span>
          {task.completedAt && (
            <span className="text-[11px] text-[hsl(var(--muted-foreground)/0.6)]">
              · Finished {formatRelativeDate(task.completedAt)}
            </span>
          )}
        </div>
      </div>

      {task.status === 'COMPLETED' && (
        <Link
          href={`/products/${task.productId}/context/${areaKeyToUrl(task.contextAreaKey)}`}
          className="text-xs font-medium text-[hsl(var(--primary))] hover:underline shrink-0 mt-0.5"
        >
          View result
        </Link>
      )}
      {task.status === 'FAILED' && (
        <button className="text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] shrink-0 mt-0.5 transition-colors">
          Retry
        </button>
      )}
    </div>
  )
}
