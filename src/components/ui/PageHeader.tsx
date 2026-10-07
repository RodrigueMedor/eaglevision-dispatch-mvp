import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import { cn } from '@/lib/cn'

export function PageHeader({ title, description, actions, back, eyebrow, className }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; back?: { to: string; label: string }; eyebrow?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-6', className)}>
      {back && (
        <Link to={back.to} className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-road-500 hover:text-navy-900">
          <ArrowLeft className="size-4" /> {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <div className="mb-1.5">{eyebrow}</div>}
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-[28px]">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-road-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-road-400" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-lg border border-road-300 bg-white pl-9 pr-3 text-sm placeholder:text-road-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
      />
    </div>
  )
}

/** Compact select used in filter bars. */
export function FilterSelect({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 min-w-0 rounded-lg border border-road-300 bg-white px-3 pr-8 text-sm text-navy-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
    >
      <option value="">{label}: All</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center', className)}>{children}</div>
}
