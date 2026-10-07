import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface TimelineStep {
  key: string
  label: string
  state: 'done' | 'current' | 'upcoming'
  meta?: ReactNode
}

/** Progress timeline: horizontal on wide screens, vertical on phones. */
export function Timeline({ steps, className }: { steps: TimelineStep[]; className?: string }) {
  return (
    <ol className={cn('flex flex-col gap-0 lg:flex-row', className)}>
      {steps.map((s, i) => {
        const last = i === steps.length - 1
        return (
          <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0 lg:flex-1 lg:flex-col lg:items-center lg:gap-2 lg:pb-0 lg:text-center">
            {!last && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-0.5 lg:left-[calc(50%+16px)] lg:top-[13px] lg:h-0.5 lg:w-[calc(100%-32px)]',
                  s.state === 'done' ? 'bg-emerald-500' : 'bg-road-200',
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                s.state === 'done' && 'border-emerald-500 bg-emerald-500 text-white',
                s.state === 'current' && 'border-amber-500 bg-amber-50 text-amber-700 ring-4 ring-amber-500/15',
                s.state === 'upcoming' && 'border-road-200 bg-white text-road-400',
              )}
            >
              {s.state === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <div className="min-w-0 pt-0.5 lg:pt-0">
              <p className={cn('text-sm font-semibold', s.state === 'upcoming' ? 'text-road-400' : 'text-navy-900')}>{s.label}</p>
              {s.meta && <div className="mt-0.5 text-xs text-road-500">{s.meta}</div>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Activity feed for audit trails (events, notes, messages). */
export function ActivityFeed({ items }: { items: { id: string; title: ReactNode; meta: ReactNode; body?: ReactNode; icon?: ReactNode }[] }) {
  return (
    <ul className="space-y-4">
      {items.map((it, i) => (
        <li key={it.id} className="relative flex gap-3">
          {i < items.length - 1 && <span aria-hidden className="absolute left-[15px] top-8 h-[calc(100%-0.5rem)] w-px bg-road-200" />}
          <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700">{it.icon}</span>
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-sm font-medium text-navy-900">{it.title}</p>
            <p className="text-xs text-road-500">{it.meta}</p>
            {it.body && <div className="mt-1.5 rounded-lg bg-road-50 px-3 py-2 text-sm text-road-700">{it.body}</div>}
          </div>
        </li>
      ))}
    </ul>
  )
}
