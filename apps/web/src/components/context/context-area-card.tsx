import Link from 'next/link'
import { cn } from '@/lib/utils'
import { areaKeyToUrl, formatRelativeDate } from '@/lib/mock-data'
import type { ContextArea } from '@/lib/product-types'

export const AREA_COLORS: Record<string, { text: string; bg: string; border: string; bar: string }> = {
  problem_definition: {
    text: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
    border: 'border-indigo-400/20',
    bar: 'bg-indigo-400',
  },
  user_stakeholder_research: {
    text: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/20',
    bar: 'bg-violet-400',
  },
  market_competitive_analysis: {
    text: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
    bar: 'bg-cyan-400',
  },
  regulatory_domain_context: {
    text: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    bar: 'bg-amber-400',
  },
  business_model_strategy: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    bar: 'bg-emerald-400',
  },
  product_vision_roadmap: {
    text: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'border-rose-400/20',
    bar: 'bg-rose-400',
  },
  brand_design_direction: {
    text: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/20',
    bar: 'bg-pink-400',
  },
}

const fallbackColors = AREA_COLORS.problem_definition

interface ContextAreaCardProps {
  area: ContextArea
  productId: string
  isRequired?: boolean
}

export function ContextAreaCard({ area, productId, isRequired }: ContextAreaCardProps) {
  const colors = AREA_COLORS[area.key] ?? fallbackColors
  const urlKey = areaKeyToUrl(area.key)

  return (
    <Link href={`/products/${productId}/context/${urlKey}`}>
      <div
        className={cn(
          'p-4 rounded-xl border transition-all duration-150 cursor-pointer hover:shadow-sm hover:brightness-105',
          colors.bg,
          isRequired ? 'border-indigo-400/40 ring-1 ring-indigo-400/20' : colors.border
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={cn('text-xs font-semibold leading-snug', colors.text)}>
              {area.name}
            </span>
            {isRequired && (
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded-full">
                Required
              </span>
            )}
          </div>
          <span className={cn('text-xs font-bold tabular-nums shrink-0', colors.text)}>
            {area.completenessScore}%
          </span>
        </div>

        <div className="mb-3 h-1.5 w-full rounded-full bg-[hsl(var(--muted))] overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', colors.bar)}
            style={{ width: `${area.completenessScore}%` }}
          />
        </div>

        <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">
          {area.description}
        </p>

        <p className="text-[10px] text-[hsl(var(--muted-foreground)/0.5)] mt-2">
          {area.lastUpdated ? `Updated ${formatRelativeDate(area.lastUpdated)}` : 'Not started'}
        </p>
      </div>
    </Link>
  )
}
