import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { STATUS_MAPS, type StatusKind, type Tone } from '@/lib/status'

const TONES: Record<Tone, { badge: string; dot: string }> = {
  neutral: { badge: 'bg-road-100 text-road-700 ring-road-200', dot: 'bg-road-400' },
  info: { badge: 'bg-sky-50 text-sky-800 ring-sky-200', dot: 'bg-sky-500' },
  success: { badge: 'bg-emerald-50 text-emerald-800 ring-emerald-200', dot: 'bg-emerald-500' },
  warning: { badge: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500' },
  danger: { badge: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
  progress: { badge: 'bg-blue-50 text-blue-800 ring-blue-200', dot: 'bg-blue-500' },
  brand: { badge: 'bg-navy-900 text-white ring-navy-900', dot: 'bg-amber-400' },
  violet: { badge: 'bg-violet-50 text-violet-800 ring-violet-200', dot: 'bg-violet-500' },
}

export const toneDot = (tone: Tone) => TONES[tone].dot

export function Badge({ tone = 'neutral', dot, children, className, size = 'md' }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs',
        TONES[tone].badge,
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', TONES[tone].dot)} aria-hidden />}
      {children}
    </span>
  )
}

/** Renders any domain status (load, truck, document, invoice…) using the shared status maps. */
export function StatusBadge<K extends StatusKind>({ kind, value, size, className }: { kind: K; value: keyof (typeof STATUS_MAPS)[K] & string; size?: 'sm' | 'md'; className?: string }) {
  const meta = (STATUS_MAPS[kind] as Record<string, { label: string; tone: Tone }>)[value]
  if (!meta) return <Badge size={size}>{value}</Badge>
  return (
    <Badge tone={meta.tone} dot size={size} className={className}>
      {meta.label}
    </Badge>
  )
}

/** Marks prototype data so customers never confuse it with real records. */
export function SampleTag({ children = 'Sample data', className }: { children?: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md border border-dashed border-amber-400 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800', className)}>
      {children}
    </span>
  )
}
