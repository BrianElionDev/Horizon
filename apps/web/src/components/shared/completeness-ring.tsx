import { cn } from '@/lib/utils'

interface CompletenessRingProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  showValue?: boolean
}

export function CompletenessRing({
  value,
  size = 40,
  strokeWidth = 3,
  className,
  showValue = true,
}: CompletenessRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference

  const color =
    value >= 80
      ? 'hsl(var(--status-validated))'
      : value >= 40
      ? 'hsl(var(--status-exploring))'
      : value > 0
      ? 'hsl(var(--status-new))'
      : 'hsl(var(--border))'

  const fontSize = size <= 32 ? 8 : size <= 48 ? 9 : 10

  return (
    <div
      className={cn('relative inline-flex items-center justify-center shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {showValue && (
        <span
          className="absolute font-semibold leading-none"
          style={{ color, fontSize }}
        >
          {value}%
        </span>
      )}
    </div>
  )
}
