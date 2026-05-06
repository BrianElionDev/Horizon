'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeDate } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { Idea } from '@horizon/shared'

const STATUS_VARIANT: Record<string, string> = {
  NEW: 'status-new',
  EXPLORING: 'status-exploring',
  VALIDATED: 'status-validated',
  ARCHIVED: 'status-archived',
  DISMISSED: 'status-dismissed',
}

const STATUS_BAR: Record<string, string> = {
  NEW: 'bg-[hsl(var(--status-new))]',
  EXPLORING: 'bg-[hsl(var(--status-exploring))]',
  VALIDATED: 'bg-[hsl(var(--status-validated))]',
  ARCHIVED: 'bg-[hsl(var(--status-archived))]',
  DISMISSED: 'bg-[hsl(var(--status-dismissed))]',
}

const STATUS_LABEL: Record<string, string> = {
  NEW: 'New',
  EXPLORING: 'Exploring',
  VALIDATED: 'Validated',
  ARCHIVED: 'Archived',
  DISMISSED: 'Dismissed',
}

interface IdeaCardProps {
  idea: Idea
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <div className="group flex flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm transition-all duration-150 overflow-hidden">
      {/* Status colour bar */}
      <div className={cn('h-1 w-full shrink-0', STATUS_BAR[idea.status])} />

      {/* Main clickable body */}
      <Link
        href={`/products/${idea.id}/overview`}
        className="flex flex-col flex-1 px-4 pt-3.5 pb-3 min-w-0"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge
            variant={STATUS_VARIANT[idea.status] as 'status-new'}
            className="text-[10px] shrink-0"
          >
            {STATUS_LABEL[idea.status] ?? idea.status}
          </Badge>
          {idea.origin && (
            <span className="text-[10px] text-[hsl(var(--muted-foreground)/0.6)] truncate text-right">
              {idea.origin}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] line-clamp-2 leading-snug mb-1.5">
          {idea.name}
        </h3>

        {idea.description && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed mb-1.5">
            {idea.description}
          </p>
        )}

        <p className="text-[11px] text-[hsl(var(--muted-foreground)/0.5)] mt-auto pt-1">
          {formatRelativeDate(idea.updatedAt)}
        </p>
      </Link>

      {/* Footer action */}
      <div className="px-4 pb-3.5 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs h-8"
          asChild
        >
          <Link href={`/ideas/${idea.id}/setup`}>
            <BookOpen className="h-3.5 w-3.5" />
            Add context
          </Link>
        </Button>
      </div>
    </div>
  )
}
