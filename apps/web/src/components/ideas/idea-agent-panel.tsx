'use client'

import { useEffect } from 'react'
import { Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAnalyseIdea } from '@/lib/hooks/use-ideas'
import { formatRelativeDate } from '@/lib/mock-data'
import type { Idea } from '@horizon/shared'

interface IdeaAgentPanelProps {
  idea: Idea | null
  open: boolean
  onClose: () => void
}

function AnalysisSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="text-sm text-[hsl(var(--foreground))] leading-relaxed whitespace-pre-wrap">
        {content.trim()}
      </div>
    </div>
  )
}

function parseAnalysis(raw: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = []
  const parts = raw.split(/^## /m).filter(Boolean)
  for (const part of parts) {
    const newline = part.indexOf('\n')
    if (newline === -1) continue
    const title = part.slice(0, newline).trim()
    const content = part.slice(newline + 1).trim()
    if (title && content) sections.push({ title, content })
  }
  return sections
}

export function IdeaAgentPanel({ idea, open, onClose }: IdeaAgentPanelProps) {
  const analyse = useAnalyseIdea()

  useEffect(() => {
    // Auto-run only if there's no cached analysis
    if (open && idea && !idea.lastAnalysis && !analyse.data && !analyse.isPending) {
      analyse.mutate(idea.id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idea?.id])

  function handleReanalyse() {
    if (idea) analyse.mutate(idea.id)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      onClose()
      analyse.reset()
    }
  }

  // Fresh result takes priority over cached
  const displayText = analyse.data?.analysis ?? idea?.lastAnalysis ?? null
  const sections = displayText ? parseAnalysis(displayText) : []
  const isCached = !analyse.data && !!idea?.lastAnalysis
  const analysedAt = analyse.data?.analysedAt ?? idea?.lastAnalysedAt ?? null

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-[hsl(var(--border))] pr-12">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)]">
            <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-0.5">Forge Analysis</p>
            <p className="text-sm font-semibold truncate">{idea?.name ?? ''}</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {analyse.isPending && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-[hsl(var(--muted-foreground))]">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Forge is thinking…</p>
            </div>
          )}

          {analyse.isError && !displayText && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-[hsl(var(--muted-foreground))]">
              <AlertCircle className="h-6 w-6 text-[hsl(var(--destructive))]" />
              <p className="text-sm">Analysis failed. Check that Forge is reachable.</p>
              <Button size="sm" variant="outline" onClick={handleReanalyse} className="gap-2">
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          )}

          {!analyse.isPending && displayText && sections.length === 0 && (
            <pre className="text-xs text-[hsl(var(--muted-foreground))] whitespace-pre-wrap leading-relaxed">
              {displayText}
            </pre>
          )}

          {!analyse.isPending && sections.length > 0 && (
            <>
              <div className="flex items-center justify-between gap-2 mb-4">
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Sparkles className="h-3 w-3" />
                  Forge · Qwen 3 27B
                </Badge>
                {isCached && analysedAt && (
                  <span className="text-[10px] text-[hsl(var(--muted-foreground)/0.6)]">
                    {formatRelativeDate(analysedAt)}
                  </span>
                )}
              </div>
              {sections.map((s) => (
                <AnalysisSection key={s.title} title={s.title} content={s.content} />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {!analyse.isPending && displayText && (
          <div className="px-5 py-3 border-t border-[hsl(var(--border))]">
            <Button
              size="sm"
              variant="ghost"
              className="w-full gap-2 text-[hsl(var(--muted-foreground))]"
              onClick={handleReanalyse}
              disabled={analyse.isPending}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Re-analyse
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
