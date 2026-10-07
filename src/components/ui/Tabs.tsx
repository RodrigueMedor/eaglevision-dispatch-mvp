import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface TabItem {
  id: string
  label: ReactNode
  count?: number
}

export function Tabs({ tabs, value, onChange, className }: { tabs: TabItem[]; value: string; onChange: (id: string) => void; className?: string }) {
  return (
    <div className={cn('-mx-1 overflow-x-auto scrollbar-thin', className)}>
      <div role="tablist" className="flex min-w-max gap-1 border-b border-road-200 px-1">
        {tabs.map((t) => {
          const active = t.id === value
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t.id)}
              className={cn(
                '-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'border-amber-500 text-navy-900' : 'border-transparent text-road-500 hover:text-navy-800',
              )}
            >
              {t.label}
              {t.count !== undefined && (
                <span className={cn('rounded-full px-1.5 py-px text-[11px] font-semibold', active ? 'bg-navy-900 text-white' : 'bg-road-100 text-road-600')}>{t.count}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Compact pill-style segmented control. */
export function Segmented<T extends string>({ options, value, onChange, className }: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn('inline-flex rounded-lg bg-road-100 p-0.5', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn('rounded-md px-3 py-1.5 text-xs font-semibold transition-colors', o.value === value ? 'bg-white text-navy-900 shadow-sm' : 'text-road-600 hover:text-navy-900')}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
