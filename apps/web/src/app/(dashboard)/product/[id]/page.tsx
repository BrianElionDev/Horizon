import { Telescope } from 'lucide-react'

export default function ProductPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="rounded-full bg-[hsl(var(--muted))] p-5 mb-6">
        <Telescope className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-2">
        Product Workspace
      </h2>
      <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs">
        Select an idea from the Inbox to start defining a product.
      </p>
    </div>
  )
}
