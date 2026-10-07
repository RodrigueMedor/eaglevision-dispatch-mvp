import type { HTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Card({ className, padded = true, children, ...rest }: HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  return (
    <div className={cn('rounded-card border border-road-200 bg-white shadow-card', padded && 'p-4 sm:p-5', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardHeader({ title, description, actions, icon, className }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">{icon}</span>}
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-navy-900">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-road-500">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

type StatTone = 'navy' | 'amber' | 'green' | 'blue' | 'red' | 'violet'

const STAT_TONES: Record<StatTone, string> = {
  navy: 'bg-navy-900 text-amber-400',
  amber: 'bg-amber-100 text-amber-700',
  green: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-sky-50 text-sky-700',
  red: 'bg-red-50 text-red-600',
  violet: 'bg-violet-50 text-violet-700',
}

export function StatCard({ label, value, icon, hint, tone = 'navy', to, className }: { label: string; value: ReactNode; icon: ReactNode; hint?: ReactNode; tone?: StatTone; to?: string; className?: string }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={cn('flex size-10 items-center justify-center rounded-xl', STAT_TONES[tone])}>{icon}</span>
        {to && <ArrowUpRight className="size-4 text-road-300 transition-colors group-hover:text-navy-700" aria-hidden />}
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-[26px]">{value}</p>
      <p className="text-sm font-medium text-road-600">{label}</p>
      {hint && <p className="mt-1 text-xs text-road-500">{hint}</p>}
    </>
  )
  const cls = cn('group block rounded-card border border-road-200 bg-white p-4 shadow-card transition-shadow', to && 'hover:shadow-lift', className)
  return to ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

export function DescriptionList({ items, columns = 2, className }: { items: { label: string; value: ReactNode }[]; columns?: 1 | 2 | 3; className?: string }) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-4', columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {items.map((it) => (
        <div key={it.label} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-road-500">{it.label}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-navy-900">{it.value}</dd>
        </div>
      ))}
    </dl>
  )
}
