'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateIdea } from '@/lib/hooks/use-ideas'

const ORIGIN_PRESETS = [
  'Client conversation',
  'Personal frustration',
  'Market research',
  'Team discussion',
  'Competitive analysis',
  'Industry trend',
  'User feedback',
  'Conference / event',
]

export default function NewIdeaPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [origin, setOrigin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const createIdea = useCreateIdea()

  const canSubmit = name.trim().length > 0 && !createIdea.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setErrorMsg('')
    try {
      const idea = await createIdea.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        origin: origin.trim() || undefined,
      })
      router.push(`/ideas/${idea.id}/setup`)
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/inbox"
        className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to inbox
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">New Idea</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Capture it fast — you can paste your research notes in the next step.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Idea name <span className="text-[hsl(var(--destructive))]">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. TRP — Tax Research Platform"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Short description{' '}
              <span className="text-[hsl(var(--muted-foreground))] font-normal">optional</span>
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What problem does it solve? What's the opportunity?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Where did this come from?{' '}
              <span className="text-[hsl(var(--muted-foreground))] font-normal">optional</span>
            </label>
            <Input
              list="origin-options"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Client conversation, market research…"
            />
            <datalist id="origin-options">
              {ORIGIN_PRESETS.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] text-sm text-[hsl(var(--destructive))]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="flex justify-end pb-8">
          <Button type="submit" disabled={!canSubmit} className="gap-2">
            {createIdea.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {createIdea.isPending ? 'Creating…' : 'Create idea'}
          </Button>
        </div>
      </form>
    </div>
  )
}
