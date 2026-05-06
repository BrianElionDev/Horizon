'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, AlertCircle, SkipForward, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useIdea, useStructureAll } from '@/lib/hooks/use-ideas'

const AREAS = [
  'Problem Definition',
  'User & Stakeholder Research',
  'Market & Competitive Analysis',
  'Regulatory & Domain Context',
  'Business Model & Strategy',
  'Product Vision & Roadmap',
  'Brand & Design Direction',
]

type Stage = 'idle' | 'analysing' | 'done' | 'error'

export default function IdeaSetupPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [rawContent, setRawContent] = useState('')
  const [prefilled, setPrefilled] = useState(false)
  const [stage, setStage] = useState<Stage>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const { data: idea } = useIdea(id)
  const structureAll = useStructureAll()

  // Pre-fill with existing notes once the idea loads
  useEffect(() => {
    if (idea?.rawNotes && !prefilled) {
      setRawContent(idea.rawNotes)
      setPrefilled(true)
    }
  }, [idea, prefilled])

  const hasExistingNotes = Boolean(idea?.rawNotes)
  const canSubmit = rawContent.trim().length > 0 && stage === 'idle'

  async function handleAnalyse(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setErrorMsg('')
    setStage('analysing')

    try {
      await structureAll.mutateAsync({ ideaId: id, rawContent: rawContent.trim() })
      setStage('done')
      setTimeout(() => router.push(`/products/${id}/overview`), 1200)
    } catch {
      setErrorMsg('Analysis failed. Please try again.')
      setStage('error')
    }
  }

  if (stage === 'analysing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-8">
        <div className="text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)] mx-auto mb-4">
            <Sparkles className="h-6 w-6 text-[hsl(var(--primary))] animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold mb-1">Forge is reading your notes</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Structuring all 7 context areas simultaneously — takes about 30 seconds
          </p>
        </div>

        <div className="w-full max-w-xs space-y-1.5">
          {AREAS.map((area) => (
            <div
              key={area}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))]"
            >
              <Loader2 className="h-3.5 w-3.5 text-[hsl(var(--primary))] animate-spin shrink-0" />
              <span className="text-sm text-[hsl(var(--muted-foreground))]">{area}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
          <CheckCircle2 className="h-7 w-7 text-green-500" />
        </div>
        <h2 className="text-xl font-semibold">Analysis complete</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Taking you to your overview…</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/inbox"
        className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to inbox
      </Link>

      <div className="mb-8">
        {!hasExistingNotes && (
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
            Step 2 of 2
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          {idea ? `${hasExistingNotes ? 'Update notes for' : 'Set up'} "${idea.name}"` : 'Add your research'}
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {hasExistingNotes
            ? 'Your previous notes are loaded — add more or edit them, then re-analyse.'
            : 'Paste everything you know — Forge will structure it across all 7 context areas.'}
        </p>
      </div>

      {hasExistingNotes && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.15)] mb-5 text-sm">
          <RefreshCw className="h-4 w-4 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
          <p className="text-[hsl(var(--muted-foreground))]">
            Re-analysing will regenerate all 7 context areas from the notes below.
            <span className="text-[hsl(var(--foreground))] font-medium"> Edit the text to add more before re-running.</span>
          </p>
        </div>
      )}

      <form onSubmit={handleAnalyse} className="space-y-5">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-3">
          <div>
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
              Your Research & Notes
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Customer interviews, competitor analysis, market data, pricing thoughts, regulatory notes, your own
              reasoning — anything. Don't filter it.
            </p>
          </div>

          <Textarea
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            placeholder={`Paste everything you know about this idea…

Customer interviews, transcripts, competitor analysis, market data, regulatory constraints, pricing ideas, your strategic reasoning — anything and everything. Don't filter it.

Forge will read through all of it and structure the relevant insights into Problem Definition, User Research, Market Analysis, Regulatory Context, Business Model, Product Vision, and Brand Direction.`}
            className="min-h-[320px] text-sm resize-y"
          />

          <p className="text-[11px] text-[hsl(var(--muted-foreground)/0.6)]">
            More context = better AI output. Don't worry about formatting.
          </p>
        </div>

        {stage === 'error' && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] text-sm text-[hsl(var(--destructive))]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 pb-8">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-[hsl(var(--muted-foreground))]"
            onClick={() => router.push(`/products/${id}/overview`)}
          >
            <SkipForward className="h-3.5 w-3.5" />
            {hasExistingNotes ? 'Cancel' : 'Skip for now'}
          </Button>

          <div className="flex items-center gap-3">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Forge analyses all 7 sections simultaneously — takes ~30 seconds.
            </p>
            <Button type="submit" disabled={!canSubmit} className="gap-2 shrink-0">
              <Sparkles className="h-4 w-4" />
              {hasExistingNotes ? 'Re-analyse' : 'Analyse All Sections'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
