import { useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, GripVertical, Truck, User } from 'lucide-react'
import type { Load, LoadStatus } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { assignLoad, setLoadStatus } from '@/services/commands'
import { carrierName, dispatchers, driverName, truckUnit } from '@/services/selectors'
import { StatusBadge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Feedback'
import { FilterBar, FilterSelect, PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/components/ui/Toast'
import { EQUIPMENT, equipmentLabel } from '@/lib/equipment'
import { money, ratePerMile, shortDate, time } from '@/lib/format'
import { LOAD_STATUS } from '@/lib/status'
import { cn } from '@/lib/cn'
import { AssignModal } from '../loads/LoadModals'

interface Column {
  id: string
  label: string
  statuses: LoadStatus[]
  /** status applied when a card is dropped here */
  target: LoadStatus
  accent: string
}

const COLUMNS: Column[] = [
  { id: 'available', label: 'Available', statuses: ['opportunity', 'review'], target: 'review', accent: 'bg-road-400' },
  { id: 'assigned', label: 'Assigned', statuses: ['approved'], target: 'approved', accent: 'bg-sky-500' },
  { id: 'dispatched', label: 'Dispatched', statuses: ['dispatched'], target: 'dispatched', accent: 'bg-navy-900' },
  { id: 'picked-up', label: 'Picked Up', statuses: ['pickup'], target: 'pickup', accent: 'bg-blue-500' },
  { id: 'in-transit', label: 'In Transit', statuses: ['in-transit'], target: 'in-transit', accent: 'bg-amber-500' },
  { id: 'delivered', label: 'Delivered', statuses: ['delivered', 'pod-received'], target: 'delivered', accent: 'bg-emerald-500' },
]

export function DispatchBoardPage() {
  const { state, update } = useDemo()
  const actor = useStaffActor()
  const toast = useToast()
  const [equipment, setEquipment] = useState('')
  const [dispatcher, setDispatcher] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<string | null>(null)
  const [assigning, setAssigning] = useState<{ load: Load; then: LoadStatus } | null>(null)
  const canMove = actor.can('loads.manage')

  const loads = state.loads.filter((l) => (!equipment || l.equipment === equipment) && (!dispatcher || l.dispatcherId === dispatcher))

  const move = (load: Load, col: Column) => {
    if (col.statuses.includes(load.status)) return
    const target = col.id === 'available' && !load.carrierId ? 'opportunity' : col.target
    if (!load.carrierId && target !== 'opportunity') {
      setAssigning({ load, then: target })
      return
    }
    update((s) => setLoadStatus(s, load.id, target, actor.user.name, 'Moved on dispatch board'))
    toast({ title: `${load.id} → ${LOAD_STATUS[target].label}`, description: 'Carrier notified automatically.' })
  }

  const onDrop = (e: DragEvent, col: Column) => {
    e.preventDefault()
    const load = state.loads.find((l) => l.id === (dragId ?? e.dataTransfer.getData('text/plain')))
    setDragId(null)
    setOverCol(null)
    if (load && canMove) move(load, col)
  }

  return (
    <>
      <PageHeader title="Dispatch Board" description="Drag loads between columns to update status. On touch devices, use the “Move to” menu on each card." />
      <FilterBar className="mb-4">
        <FilterSelect label="Equipment" value={equipment} onChange={setEquipment} options={EQUIPMENT.map((e) => ({ value: e.type, label: e.label }))} />
        <FilterSelect label="Dispatcher" value={dispatcher} onChange={setDispatcher} options={dispatchers(state).map((u) => ({ value: u.id, label: u.name }))} />
        {!canMove && <span className="text-sm text-road-500">Read-only for {actor.roleLabel}</span>}
      </FilterBar>
      {!canMove && <Alert tone="info" className="mb-4">Your role can view the board but not move loads.</Alert>}

      <div className="-mx-4 overflow-x-auto px-4 pb-4 scrollbar-thin sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="grid min-w-[1320px] grid-cols-6 gap-3">
          {COLUMNS.map((col) => {
            const items = loads.filter((l) => col.statuses.includes(l.status))
            const total = items.reduce((s, l) => s + l.rate, 0)
            return (
              <section
                key={col.id}
                aria-label={col.label}
                onDragOver={(e) => {
                  if (!canMove) return
                  e.preventDefault()
                  setOverCol(col.id)
                }}
                onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
                onDrop={(e) => onDrop(e, col)}
                className={cn('flex min-h-[60vh] flex-col rounded-2xl bg-road-100/80 p-2 transition-colors', overCol === col.id && 'bg-amber-100 ring-2 ring-amber-400')}
              >
                <header className="mb-2 flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className={cn('size-2.5 rounded-full', col.accent)} />
                    <h2 className="text-sm font-bold text-navy-900">{col.label}</h2>
                    <span className="rounded-full bg-white px-1.5 text-xs font-semibold text-road-600">{items.length}</span>
                  </div>
                  <span className="text-xs font-medium text-road-500">{money(total)}</span>
                </header>
                <div className="flex flex-1 flex-col gap-2">
                  {items.map((l) => (
                    <article
                      key={l.id}
                      draggable={canMove}
                      onDragStart={(e) => {
                        setDragId(l.id)
                        e.dataTransfer.setData('text/plain', l.id)
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragEnd={() => {
                        setDragId(null)
                        setOverCol(null)
                      }}
                      className={cn('group rounded-xl border border-road-200 bg-white p-3 shadow-sm transition', canMove && 'cursor-grab active:cursor-grabbing', dragId === l.id && 'opacity-40')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/admin/loads/${l.id}`} className="text-sm font-bold text-navy-900 hover:text-amber-700">
                          {l.id}
                        </Link>
                        {canMove && <GripVertical className="size-4 text-road-300 group-hover:text-road-500" aria-hidden />}
                      </div>
                      <p className="mt-1 text-sm font-medium text-navy-900">
                        {l.pickup.city}, {l.pickup.state} → {l.delivery.city}, {l.delivery.state}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-road-500">{l.carrierId ? carrierName(state, l.carrierId) : 'No carrier yet'} · {equipmentLabel(l.equipment)}</p>
                      <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-road-600">
                        <span className="flex items-center gap-1"><Truck className="size-3" /> {truckUnit(state, l.truckId)}</span>
                        <span className="flex items-center gap-1 truncate"><User className="size-3" /> {driverName(state, l.driverId)}</span>
                        <span className="flex items-center gap-1"><CalendarClock className="size-3" /> PU {shortDate(l.pickup.appointment)} {time(l.pickup.appointment)}</span>
                        <span className="flex items-center gap-1"><CalendarClock className="size-3" /> DEL {shortDate(l.delivery.appointment)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-road-100 pt-2">
                        <StatusBadge kind="load" value={l.status} size="sm" />
                        <span className="text-xs">
                          <span className="font-bold text-navy-900">{money(l.rate)}</span> <span className="text-road-500">{ratePerMile(l.rate, l.miles)}</span>
                        </span>
                      </div>
                      {canMove && (
                        <select
                          aria-label={`Move ${l.id} to`}
                          value=""
                          onChange={(e) => {
                            const c = COLUMNS.find((x) => x.id === e.target.value)
                            if (c) move(l, c)
                          }}
                          className="mt-2 h-7 w-full rounded-md border border-road-200 bg-road-50 px-2 text-[11px] font-medium text-road-600 lg:hidden"
                        >
                          <option value="">Move to…</option>
                          {COLUMNS.filter((c) => !c.statuses.includes(l.status)).map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </article>
                  ))}
                  {items.length === 0 && <p className="rounded-xl border-2 border-dashed border-road-300 px-3 py-6 text-center text-xs text-road-400">Drop loads here</p>}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      {assigning && (
        <AssignModal
          state={state}
          load={assigning.load}
          onClose={() => setAssigning(null)}
          onSave={(a) => {
            const { load, then } = assigning
            update((s) => setLoadStatus(assignLoad(s, load.id, a, actor.user.name), load.id, then, actor.user.name, 'Assigned from dispatch board'))
            toast({ title: `${load.id} assigned`, description: `Moved to ${LOAD_STATUS[then].label}.` })
            setAssigning(null)
          }}
        />
      )}
    </>
  )
}
