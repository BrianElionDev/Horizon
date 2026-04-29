import { Inbox, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function InboxPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="rounded-full bg-[hsl(var(--muted))] p-5 mb-6">
        <Inbox className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-2">
        No ideas yet
      </h2>
      <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs mb-8">
        Your product ideas will appear here. Capture a hunch, a problem you've observed, or an opportunity you've spotted.
      </p>
      <Button
        disabled
        title="Coming in the next update"
        className="gap-2 opacity-60 cursor-not-allowed"
      >
        <Plus className="h-4 w-4" />
        New Idea
      </Button>
    </div>
  )
}
