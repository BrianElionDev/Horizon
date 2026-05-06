'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Check, Loader2, Sparkles, X, RotateCcw, RefreshCw, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AREA_COLORS } from '@/components/context/context-area-card'
import {
  useIdea, useContextArea, useContextAreaSummaries,
  useSaveContextArea, useStructureArea, useReviewSection,
} from '@/lib/hooks/use-ideas'
import { areaKeyToUrl, urlToAreaKey } from '@/lib/product-types'
import { formatRelativeDate } from '@/lib/mock-data'
import { CONTEXT_AREAS } from '@horizon/shared'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved'

const STATUS_COLOR: Record<string, string> = {
  NEW: 'text-[hsl(var(--status-new))]',
  EXPLORING: 'text-[hsl(var(--status-exploring))]',
  VALIDATED: 'text-[hsl(var(--status-validated))]',
  ARCHIVED: 'text-[hsl(var(--muted-foreground))]',
  DISMISSED: 'text-[hsl(var(--muted-foreground))]',
}

export default function ContextAreaPage() {
  const { id, areaKey } = useParams<{ id: string; areaKey: string }>()
  const router = useRouter()
  const normalizedKey = urlToAreaKey(areaKey)

  const { data: idea, isLoading: ideaLoading, isError: ideaError, refetch } = useIdea(id)
  const { data: areaContent, isLoading: contentLoading } = useContextArea(id, normalizedKey)
  const { data: summaries = [] } = useContextAreaSummaries(id)
  const saveArea = useSaveContextArea(id)
  const structureArea = useStructureArea(id)
  const reviewSection = useReviewSection(id)

  const areaMeta = CONTEXT_AREAS.find((a) => a.key === normalizedKey)

  const [rawContent, setRawContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const initializedRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLoading = ideaLoading || contentLoading
  const isError = ideaError

  useEffect(() => {
    if (areaContent && !initializedRef.current) {
      initializedRef.current = true
      setRawContent(areaContent.rawContent)
    }
  }, [areaContent])

  useEffect(() => {
    if (!initializedRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaveStatus('pending')
    debounceRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        await saveArea.mutateAsync({ areaKey: normalizedKey, rawContent })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
      }
    }, 800)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawContent])

  const colors = AREA_COLORS[normalizedKey] ?? AREA_COLORS.problem_definition
  const lastUpdated = areaContent?.updatedAt ?? null

  if (isLoading) {
    return (
      <div className="flex gap-6">
        <div className="hidden lg:block w-52 shrink-0">
          <div className="space-y-1 animate-pulse">
            {[1,2,3,4,5,6,7].map(n => (
              <div key={n} className="h-9 rounded-lg bg-[hsl(var(--muted))]" />
            ))}
          </div>
        </div>
        <div className="flex-1 animate-pulse space-y-5">
          <div className="h-4 w-20 rounded bg-[hsl(var(--muted))]" />
          <div className="h-6 w-56 rounded bg-[hsl(var(--muted))]" />
          <div className="h-72 rounded-lg bg-[hsl(var(--muted))]" />
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

  if (!areaMeta) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-[hsl(var(--muted-foreground))]">Context area not found.</p>
        <Button variant="ghost" asChild className="mt-4">
          <Link href={`/products/${id}/overview`}>Back to overview</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-6 min-h-0">

      {/* ── Desktop area rail ────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 gap-0.5">

        {/* Idea identity */}
        <div className="px-2 pb-3 mb-1 border-b border-[hsl(var(--border))]">
          <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate leading-snug">
            {idea.name}
          </p>
          {idea.description && (
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate mt-0.5 leading-snug">
              {idea.description}
            </p>
          )}
          <p className={cn('text-[10px] font-semibold uppercase tracking-wider mt-1.5', STATUS_COLOR[idea.status] ?? 'text-[hsl(var(--muted-foreground))]')}>
            {idea.status.charAt(0) + idea.status.slice(1).toLowerCase()}
          </p>
        </div>

        <Link
          href={`/products/${idea.id}/overview`}
          className="flex items-center gap-1.5 px-2 py-1.5 mb-1 rounded-md text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Overview
        </Link>

        <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground)/0.5)]">
          Context Areas
        </p>

        {CONTEXT_AREAS.map((a) => {
          const c = AREA_COLORS[a.key] ?? AREA_COLORS.problem_definition
          const isActive = a.key === normalizedKey
          const summary = summaries.find((s) => s.areaKey === a.key)
          const pct = summary?.completeness ?? 0

          return (
            <Link
              key={a.key}
              href={`/products/${idea.id}/context/${areaKeyToUrl(a.key)}`}
              className={cn(
                'group flex items-start gap-2 px-2 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
              )}
            >
              <div className={cn(
                'w-1.5 h-1.5 rounded-full mt-[5px] shrink-0 transition-colors',
                isActive ? c.bar : 'bg-[hsl(var(--muted-foreground)/0.3)] group-hover:bg-[hsl(var(--muted-foreground)/0.5)]'
              )} />
              <div className="flex-1 min-w-0">
                <div className={cn('font-medium leading-snug', isActive && 'text-[hsl(var(--foreground))]')}>
                  {a.name}
                </div>
                {pct > 0 && (
                  <div className="mt-1.5 h-0.5 w-full rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                    <div className={cn('h-full rounded-full', c.bar)} style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Mobile top nav */}
        <div className="lg:hidden mb-4">
          {/* Idea name row */}
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/products/${idea.id}/overview`}
              className="flex items-center justify-center h-8 w-8 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">{idea.name}</span>
          </div>
          {/* Area picker */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="flex-1 flex items-center justify-between gap-2 h-9 px-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn('w-2 h-2 rounded-full shrink-0', colors.bar)} />
                <span className="truncate">{areaMeta.name}</span>
              </div>
              <ChevronDown className={cn('h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform', mobileNavOpen && 'rotate-180')} />
            </button>
          </div>

          {/* Mobile area dropdown */}
          {mobileNavOpen && (
            <div className="mt-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg overflow-hidden">
              {CONTEXT_AREAS.map((a) => {
                const c = AREA_COLORS[a.key] ?? AREA_COLORS.problem_definition
                const isActive = a.key === normalizedKey
                const summary = summaries.find((s) => s.areaKey === a.key)
                const pct = summary?.completeness ?? 0
                return (
                  <button
                    key={a.key}
                    onClick={() => {
                      setMobileNavOpen(false)
                      router.push(`/products/${idea.id}/context/${areaKeyToUrl(a.key)}`)
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors border-b border-[hsl(var(--border))] last:border-0',
                      isActive
                        ? 'bg-[hsl(var(--primary)/0.06)] text-[hsl(var(--foreground))]'
                        : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
                    )}
                  >
                    <div className={cn('w-2 h-2 rounded-full shrink-0', isActive ? c.bar : 'bg-[hsl(var(--muted-foreground)/0.3)]')} />
                    <span className="flex-1 font-medium">{a.name}</span>
                    {pct > 0 && (
                      <span className={cn('text-[11px] font-semibold tabular-nums', c.text)}>{pct}%</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Area header */}
        <div className="mb-6 pb-5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2.5 mb-2">
            <div className={cn('w-3.5 h-3.5 rounded-full shrink-0', colors.bar)} />
            <h1 className={cn('text-xl font-semibold tracking-tight', colors.text)}>
              {areaMeta.name}
            </h1>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-prose">
            {areaMeta.description}
          </p>
          {lastUpdated && (
            <p className="text-[11px] text-[hsl(var(--muted-foreground)/0.4)] mt-2">
              Last saved {formatRelativeDate(lastUpdated)}
            </p>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="input">
          <TabsList className="mb-4 w-full sm:w-auto">
            <TabsTrigger value="input" className="flex-1 sm:flex-none">Input</TabsTrigger>
            <TabsTrigger value="structured" className="flex-1 sm:flex-none">
              Structured
              {(areaContent?.sections?.length ?? 0) > 0 && (
                <span className="ml-1.5 text-[10px] bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] rounded-full px-1.5 py-0.5 font-semibold tabular-nums">
                  {areaContent!.sections.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="gaps" className="flex-1 sm:flex-none">Gaps</TabsTrigger>
            <TabsTrigger value="history" className="flex-1 sm:flex-none">History</TabsTrigger>
          </TabsList>

          {/* ── Input tab ── */}
          <TabsContent value="input">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Raw notes, transcripts, links — anything relevant. Forge structures it.
                </p>
                <SaveIndicator status={saveStatus} />
              </div>
              <Textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                placeholder="Start typing, paste notes, or dump anything related to this area..."
                className="min-h-[480px] text-sm leading-relaxed resize-y"
              />
              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={!rawContent.trim() || saveStatus !== 'idle' || structureArea.isPending}
                  onClick={() => structureArea.mutate(normalizedKey)}
                >
                  {structureArea.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Sparkles className="h-4 w-4" />
                  }
                  {structureArea.isPending ? 'Structuring…' : 'Structure with AI'}
                </Button>
                {structureArea.isError && (
                  <p className="text-xs text-[hsl(var(--destructive))]">Failed — try again</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Structured tab ── */}
          <TabsContent value="structured">
            {!areaContent?.sections?.length ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-4', colors.bg)}>
                  <Sparkles className={cn('h-6 w-6', colors.text)} />
                </div>
                <p className="text-sm font-semibold mb-1">No structured content yet</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs mb-5">
                  Add notes in the Input tab, then let Forge structure them into sections.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={!rawContent.trim() || saveStatus !== 'idle' || structureArea.isPending}
                  onClick={() => structureArea.mutate(normalizedKey)}
                >
                  {structureArea.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {structureArea.isPending ? 'Structuring…' : 'Structure with AI'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {areaContent.sections.filter(s => s.status === 'accepted').length} of {areaContent.sections.length} accepted
                    </span>
                    {areaContent.sections.some(s => s.status === 'pending') && (
                      <Badge variant="outline" className="text-[10px] py-0">
                        {areaContent.sections.filter(s => s.status === 'pending').length} pending
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-7"
                    disabled={!rawContent.trim() || saveStatus !== 'idle' || structureArea.isPending}
                    onClick={() => structureArea.mutate(normalizedKey)}
                  >
                    {structureArea.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                    Re-structure
                  </Button>
                </div>

                {areaContent.sections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    onAccept={() => reviewSection.mutate({ areaKey: normalizedKey, sectionId: section.id, status: 'accepted' })}
                    onReject={() => reviewSection.mutate({ areaKey: normalizedKey, sectionId: section.id, status: 'rejected' })}
                    onRestore={() => reviewSection.mutate({ areaKey: normalizedKey, sectionId: section.id, status: 'pending' })}
                    isPending={reviewSection.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Gaps tab ── */}
          <TabsContent value="gaps">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
              </div>
              <p className="text-sm font-semibold mb-1">No gaps identified yet</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs">
                Gap identification arrives in a future phase once AI structuring is complete.
              </p>
            </div>
          </TabsContent>

          {/* ── History tab ── */}
          <TabsContent value="history">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Revision history will appear here once content is saved.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SaveIndicator({ status }: { status: SaveStatus }) {
  return (
    <span className={cn(
      'text-[10px] flex items-center gap-1 transition-colors',
      status === 'saved' ? 'text-[hsl(var(--status-validated))]' :
      status === 'saving' ? 'text-[hsl(var(--primary))]' :
      'text-[hsl(var(--muted-foreground)/0.5)]'
    )}>
      {status === 'saving' && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
      {status === 'saved' && <Check className="h-2.5 w-2.5" />}
      {status === 'saving' ? 'Saving…' :
       status === 'saved' ? 'Saved' :
       status === 'pending' ? 'Unsaved' : 'Auto-saves'}
    </span>
  )
}

type SectionStatus = 'pending' | 'accepted' | 'rejected'

interface SectionCardProps {
  section: { id: string; title: string; content: string; status: SectionStatus; aiGenerated: boolean }
  onAccept: () => void
  onReject: () => void
  onRestore: () => void
  isPending: boolean
}

function SectionCard({ section, onAccept, onReject, onRestore, isPending }: SectionCardProps) {
  return (
    <div className={cn(
      'rounded-xl border transition-all',
      section.status === 'accepted' && 'border-[hsl(var(--status-validated)/0.3)] bg-[hsl(var(--status-validated)/0.03)]',
      section.status === 'rejected' && 'border-[hsl(var(--border))] opacity-40',
      section.status === 'pending' && 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
    )}>
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <h3 className="text-sm font-semibold leading-snug">{section.title}</h3>
        <div className="flex items-center gap-1 shrink-0">
          {section.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 rounded-lg text-[hsl(var(--status-validated))] hover:bg-[hsl(var(--status-validated)/0.1)] hover:text-[hsl(var(--status-validated))]"
                onClick={onAccept}
                disabled={isPending}
                title="Accept"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive)/0.08)] hover:text-[hsl(var(--destructive))]"
                onClick={onReject}
                disabled={isPending}
                title="Reject"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          {section.status === 'accepted' && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[hsl(var(--status-validated))] bg-[hsl(var(--status-validated)/0.12)] px-2 py-1 rounded-full">
              <Check className="h-3 w-3" />
              Accepted
            </span>
          )}
          {section.status === 'rejected' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px] gap-1 text-[hsl(var(--muted-foreground))] rounded-full"
              onClick={onRestore}
              disabled={isPending}
            >
              <RotateCcw className="h-3 w-3" />
              Restore
            </Button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-[hsl(var(--border))]" />

      {/* Content */}
      <div className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:mb-2 [&>ol]:list-decimal [&>ol]:pl-4 [&>li]:mb-0.5 [&_strong]:text-[hsl(var(--foreground))] [&_strong]:font-medium">
        <ReactMarkdown>{section.content}</ReactMarkdown>
      </div>
    </div>
  )
}
