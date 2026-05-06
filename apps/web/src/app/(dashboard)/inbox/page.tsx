'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Inbox, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IdeaCard } from '@/components/ideas/idea-card'
import { EmptyState } from '@/components/shared/empty-state'
import { useIdeas } from '@/lib/hooks/use-ideas'
import { cn } from '@/lib/utils'
import type { IdeaStatus } from '@horizon/shared'

type FilterTab = 'ALL' | IdeaStatus

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'NEW', label: 'New' },
  { key: 'EXPLORING', label: 'Exploring' },
  { key: 'VALIDATED', label: 'Validated' },
  { key: 'ARCHIVED', label: 'Archived' },
  { key: 'DISMISSED', label: 'Dismissed' },
]

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'alpha', label: 'Alphabetical' },
  { key: 'updated', label: 'Recently updated' },
]

function IdeaCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden animate-pulse">
      <div className="h-1 w-full bg-[hsl(var(--muted))]" />
      <div className="px-4 pt-3.5 pb-3 space-y-2.5 flex-1">
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 rounded-full bg-[hsl(var(--muted))]" />
          <div className="h-3 w-20 rounded bg-[hsl(var(--muted))]" />
        </div>
        <div className="h-4 w-3/4 rounded bg-[hsl(var(--muted))]" />
        <div className="h-3 w-full rounded bg-[hsl(var(--muted))]" />
        <div className="h-3 w-1/2 rounded bg-[hsl(var(--muted))]" />
      </div>
      <div className="px-4 pb-3.5">
        <div className="h-8 w-full rounded-md bg-[hsl(var(--muted))]" />
      </div>
    </div>
  )
}

export default function InboxPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterTab>('ALL')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const { data: ideas = [], isLoading, isError, refetch } = useIdeas()

  const counts = useMemo(() => {
    const c = { ALL: ideas.length, NEW: 0, EXPLORING: 0, VALIDATED: 0, ARCHIVED: 0, DISMISSED: 0 } as Record<FilterTab, number>
    ideas.forEach((i) => { c[i.status]++ })
    return c
  }, [ideas])

  const filtered = useMemo(() => {
    let list = [...ideas]
    if (filter !== 'ALL') list = list.filter((i) => i.status === filter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (i) => i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q)
      )
    }
    switch (sort) {
      case 'oldest':
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'alpha':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'updated':
        list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
      default:
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return list
  }, [ideas, filter, search, sort])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight">Idea Inbox</h1>
          {!isLoading && !isError && (
            <span className="text-xs font-semibold bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] px-2 py-0.5 rounded-full">
              {ideas.length}
            </span>
          )}
        </div>
        <Button size="sm" className="gap-2" onClick={() => router.push('/ideas/new')}>
          <Plus className="h-4 w-4" />
          New Idea
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-0.5 -mx-1 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors min-h-[36px]',
              filter === tab.key
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
            )}
          >
            {tab.label}
            {!isLoading && (
              <span
                className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                  filter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                )}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))] pointer-events-none" />
          <Input
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-10 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <IdeaCardSkeleton />
          <IdeaCardSkeleton />
          <IdeaCardSkeleton />
          <IdeaCardSkeleton />
          <IdeaCardSkeleton />
          <IdeaCardSkeleton />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Could not load ideas — is the API running?
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {/* Empty / list */}
      {!isLoading && !isError && (
        filtered.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={
              search
                ? 'No ideas found'
                : filter !== 'ALL'
                ? `No ${filter.toLowerCase()} ideas`
                : 'No ideas yet'
            }
            description={
              search
                ? `Nothing matched "${search}". Try a different search.`
                : filter !== 'ALL'
                ? 'Try a different filter or create a new idea.'
                : "Capture a hunch, a problem you've spotted, or an opportunity worth exploring."
            }
            action={
              filter === 'ALL' && !search ? (
                <Button size="sm" className="gap-2" onClick={() => router.push('/ideas/new')}>
                  <Plus className="h-4 w-4" />
                  New Idea
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )
      )}
    </div>
  )
}
