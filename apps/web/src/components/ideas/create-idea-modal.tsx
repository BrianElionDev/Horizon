'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

interface CreateIdeaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateIdeaModal({ open, onOpenChange }: CreateIdeaModalProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [origin, setOrigin] = useState('')

  const createIdea = useCreateIdea()

  function reset() {
    setName('')
    setDescription('')
    setOrigin('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || createIdea.isPending) return

    try {
      const idea = await createIdea.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        origin: origin.trim() || undefined,
      })
      reset()
      onOpenChange(false)
      router.push(`/ideas/${idea.id}/setup`)
    } catch {
      // error is surfaced via createIdea.isError
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) reset()
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Idea</DialogTitle>
            <DialogDescription>
              Capture it fast — you can add your research notes in the next step.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="idea-name">
                Name{' '}
                <span className="text-[hsl(var(--destructive))]">*</span>
              </Label>
              <Input
                id="idea-name"
                placeholder="e.g. TRP — Tax Research Platform"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="idea-desc">
                Description{' '}
                <span className="text-xs text-[hsl(var(--muted-foreground))]">optional</span>
              </Label>
              <Textarea
                id="idea-desc"
                placeholder="What problem does this solve? What's the opportunity?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="idea-origin">
                Where did this come from?{' '}
                <span className="text-xs text-[hsl(var(--muted-foreground))]">optional</span>
              </Label>
              <Input
                id="idea-origin"
                placeholder="e.g. Client conversation, market research..."
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                list="origin-presets"
              />
              <datalist id="origin-presets">
                {ORIGIN_PRESETS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            {createIdea.isError && (
              <p className="text-sm text-[hsl(var(--destructive))]">
                Something went wrong. Please try again.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || createIdea.isPending}>
              {createIdea.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {createIdea.isPending ? 'Creating…' : 'Create idea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
