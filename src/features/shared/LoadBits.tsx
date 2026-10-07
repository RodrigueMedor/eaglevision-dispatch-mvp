import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Load, StopLocation } from '@/data/types'
import { feeBreakdown } from '@/lib/fees'
import { moneyCents, shortDate, time } from '@/lib/format'
import { cn } from '@/lib/cn'
import { SampleTag } from '@/components/ui/Badge'

/** "Orlando, FL → Atlanta, GA" with optional dates. */
export function RouteLine({ load, showDates, className }: { load: Load; showDates?: boolean; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex min-w-0 items-center gap-1.5 font-medium text-navy-900">
        <span className="truncate">
          {load.pickup.city}, {load.pickup.state}
        </span>
        <ArrowRight className="size-3.5 shrink-0 text-amber-600" aria-label="to" />
        <span className="truncate">
          {load.delivery.city}, {load.delivery.state}
        </span>
      </div>
      {showDates && (
        <p className="text-xs text-road-500">
          {shortDate(load.pickup.appointment)} → {shortDate(load.delivery.appointment)}
        </p>
      )}
    </div>
  )
}

export function StopCard({ kind, stop }: { kind: 'Pickup' | 'Delivery'; stop: StopLocation }) {
  return (
    <div className="flex gap-3">
      <span className={cn('mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold', kind === 'Pickup' ? 'bg-navy-900 text-amber-400' : 'bg-amber-500 text-navy-950')}>{kind === 'Pickup' ? 'P' : 'D'}</span>
      <div className="min-w-0 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-road-500">{kind}</p>
        <p className="font-semibold text-navy-900">{stop.facility}</p>
        <p className="text-road-600">
          {stop.street}, {stop.city}, {stop.state} {stop.zip}
        </p>
        <p className="mt-1.5 font-medium text-navy-900">
          {shortDate(stop.appointment)} · {time(stop.appointment)} <span className="font-normal text-road-500">(window {stop.window})</span>
        </p>
        <p className="text-xs text-road-500">
          {stop.contact} · {stop.phone}
        </p>
      </div>
    </div>
  )
}

/** Stylized route preview. Production: Google Maps route + mileage (integration-ready). */
export function MapPreview({ load }: { load: Load }) {
  return (
    <div className="relative h-40 overflow-hidden rounded-xl bg-[#e9eef4] ring-1 ring-road-200">
      <svg viewBox="0 0 400 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
        <path d="M0 120 Q80 100 140 115 T280 90 T400 70" fill="none" stroke="#d6dee8" strokeWidth="10" />
        <path d="M30 40 L120 70 L200 50 L300 85 L380 60" fill="none" stroke="#d6dee8" strokeWidth="6" />
        <path d="M50 120 C 140 30, 260 150, 350 45" fill="none" stroke="#0b1b2e" strokeWidth="4" strokeLinecap="round" />
        <path d="M50 120 C 140 30, 260 150, 350 45" fill="none" stroke="#f5a524" strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round" />
        <circle cx="50" cy="120" r="8" fill="#0b1b2e" />
        <circle cx="350" cy="45" r="8" fill="#f5a524" />
      </svg>
      <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-navy-900 shadow-sm">
        {load.pickup.city}, {load.pickup.state}
      </span>
      <span className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-navy-900 shadow-sm">
        {load.delivery.city}, {load.delivery.state}
      </span>
      <span className="absolute bottom-2 right-2 rounded-md bg-navy-900/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">Maps integration · preview</span>
    </div>
  )
}

export function FeeBreakdownList({ gross, feePct, compact, footer }: { gross: number; feePct: number; compact?: boolean; footer?: ReactNode }) {
  const f = feeBreakdown(gross, feePct)
  return (
    <div>
      <dl className={cn('divide-y divide-road-100 rounded-xl bg-road-50 px-4', compact ? 'text-xs' : 'text-sm')}>
        <div className="flex justify-between py-2.5">
          <dt className="text-road-600">Gross load rate</dt>
          <dd className="font-semibold text-navy-900">{moneyCents(f.gross)}</dd>
        </div>
        <div className="flex justify-between py-2.5">
          <dt className="text-road-600">Dispatch fee ({feePct}%)</dt>
          <dd className="font-semibold text-navy-900">− {moneyCents(f.fee)}</dd>
        </div>
        <div className="flex items-center justify-between py-3">
          <dt className="font-semibold text-navy-900">Carrier net</dt>
          <dd className={cn('font-display font-bold text-emerald-700', compact ? 'text-base' : 'text-lg')}>{moneyCents(f.net)}</dd>
        </div>
      </dl>
      <p className="mt-2 flex items-center gap-2 text-[11px] text-road-500">
        <SampleTag>Sample fee</SampleTag> Configurable in Settings — not actual pricing.
      </p>
      {footer}
    </div>
  )
}
