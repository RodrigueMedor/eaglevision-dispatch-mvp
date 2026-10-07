import { Link } from 'react-router-dom'
import { CalendarClock, Truck, User } from 'lucide-react'
import type { DemoState, Load } from '@/data/types'
import { StatusBadge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/Feedback'
import { driverName, truckUnit } from '@/services/selectors'
import { money, ratePerMile, shortDate, time } from '@/lib/format'
import { LOAD_FLOW, loadStep } from '@/lib/status'
import { RouteLine } from '@/features/shared/LoadBits'

export function LoadCard({ load, state, to }: { load: Load; state: DemoState; to: string }) {
  const progress = Math.round((loadStep(load.status) / (LOAD_FLOW.length - 1)) * 100)
  return (
    <Link to={to} className="block rounded-card border border-road-200 bg-white p-4 shadow-card transition-shadow hover:shadow-lift">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-road-500">{load.id}</span>
        <StatusBadge kind="load" value={load.status} size="sm" />
      </div>
      <RouteLine load={load} className="mt-1.5 text-base" />
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <p className="flex items-center gap-1.5 text-road-600">
          <CalendarClock className="size-3.5 text-road-400" /> PU {shortDate(load.pickup.appointment)} {time(load.pickup.appointment)}
        </p>
        <p className="flex items-center gap-1.5 text-road-600">
          <CalendarClock className="size-3.5 text-road-400" /> DEL {shortDate(load.delivery.appointment)}
        </p>
        <p className="flex items-center gap-1.5 text-road-600">
          <Truck className="size-3.5 text-road-400" /> {truckUnit(state, load.truckId)}
        </p>
        <p className="flex items-center gap-1.5 truncate text-road-600">
          <User className="size-3.5 text-road-400" /> {driverName(state, load.driverId)}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <ProgressBar value={progress} tone={load.status === 'completed' ? 'green' : 'amber'} className="h-1.5 flex-1" label="Load progress" />
        <span className="text-sm font-bold text-navy-900">{money(load.rate)}</span>
        <span className="text-xs text-road-500">{ratePerMile(load.rate, load.miles)}</span>
      </div>
    </Link>
  )
}
