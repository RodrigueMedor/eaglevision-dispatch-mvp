import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/cn'

type AlertTone = 'info' | 'success' | 'warning' | 'danger' | 'demo'

const ALERT: Record<AlertTone, { box: string; icon: typeof Info }> = {
  info: { box: 'border-sky-200 bg-sky-50 text-sky-900', icon: Info },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: CircleCheck },
  warning: { box: 'border-amber-300 bg-amber-50 text-amber-900', icon: TriangleAlert },
  danger: { box: 'border-red-200 bg-red-50 text-red-900', icon: CircleAlert },
  demo: { box: 'border-dashed border-amber-400 bg-amber-50/70 text-amber-900', icon: Info },
}

export function Alert({ tone = 'info', title, children, action, className }: { tone?: AlertTone; title?: ReactNode; children?: ReactNode; action?: ReactNode; className?: string }) {
  const { box, icon: Icon } = ALERT[tone]
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex flex-col gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center', box, className)}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="min-w-0 text-sm">
          {title && <p className="font-semibold">{title}</p>}
          {children && <div className={cn(title && 'mt-0.5', 'opacity-90')}>{children}</div>}
        </div>
      </div>
      {action && <div className="shrink-0 pl-8 sm:pl-0">{action}</div>}
    </div>
  )
}

export function EmptyState({ icon, title, description, action, className }: { icon: ReactNode; title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <span className="flex size-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-400">{icon}</span>
      <h3 className="mt-4 font-display text-base font-semibold text-navy-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-road-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ProgressBar({ value, tone = 'navy', className, label }: { value: number; tone?: 'navy' | 'amber' | 'green' | 'red'; className?: string; label?: string }) {
  const color = { navy: 'bg-navy-700', amber: 'bg-amber-500', green: 'bg-emerald-500', red: 'bg-red-500' }[tone]
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-road-100', className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={cn('h-full rounded-full', color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

const AVATAR_COLORS = ['bg-navy-700', 'bg-amber-600', 'bg-emerald-700', 'bg-sky-700', 'bg-violet-700', 'bg-rose-700']

export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const hash = [...name].reduce((h, c) => h + c.charCodeAt(0), 0)
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        AVATAR_COLORS[hash % AVATAR_COLORS.length],
        size === 'sm' ? 'size-7 text-[11px]' : size === 'md' ? 'size-9 text-xs' : 'size-12 text-sm',
        className,
      )}
    >
      {initials}
    </span>
  )
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold text-navy-900', className)} aria-label={`${value.toFixed(1)} out of 5`}>
      <span className="text-amber-500" aria-hidden>
        ★
      </span>
      {value.toFixed(1)}
    </span>
  )
}
