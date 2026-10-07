import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import type { DemoState, Truck } from '@/data/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { DescriptionList } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { EquipmentGlyph } from '@/components/brand/EquipmentGlyph'
import { carrierName, documentStatus, driverName } from '@/services/selectors'
import { equipmentLabel } from '@/lib/equipment'
import { date, lbs, number } from '@/lib/format'
import { isActiveLoad } from '@/services/selectors'

export function currentLoadFor(state: DemoState, truckId: string) {
  return state.loads.find((l) => l.truckId === truckId && isActiveLoad(l))
}

export function TruckDetailModal({ truck, state, loadPath, onClose, onEdit }: { truck: Truck; state: DemoState; loadPath: (id: string) => string; onClose: () => void; onEdit?: () => void }) {
  const current = currentLoadFor(state, truck.id)
  const docs = state.documents.filter((d) => d.truckId === truck.id)
  const history = state.loads.filter((l) => l.truckId === truck.id).slice(0, 5)
  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`Truck ${truck.unitNumber}`}
      description={`${truck.year} ${truck.make} ${truck.model} · ${equipmentLabel(truck.equipment)}`}
      footer={
        onEdit && (
          <Button variant="primary" icon={<Pencil className="size-4" />} onClick={onEdit}>
            Edit truck
          </Button>
        )
      }
    >
      <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
        <div className="rounded-xl bg-road-50 p-4">
          <EquipmentGlyph type={truck.equipment} />
          <div className="mt-3 text-center">
            <StatusBadge kind="truck" value={truck.status} />
          </div>
        </div>
        <DescriptionList
          items={[
            { label: 'Carrier', value: carrierName(state, truck.carrierId) },
            { label: 'Driver', value: driverName(state, truck.driverId) },
            { label: 'VIN', value: <span className="font-mono text-xs">{truck.vin}</span> },
            { label: 'Dimensions', value: truck.dimensions || '—' },
            { label: 'Capacity', value: lbs(truck.capacityLbs) },
            { label: 'Home base', value: truck.homeBase || '—' },
            { label: 'Odometer', value: `${number(truck.odometer)} mi` },
            { label: 'Current load', value: current ? <Link className="text-navy-700 underline" to={loadPath(current.id)} onClick={onClose}>{current.id}</Link> : 'None' },
          ]}
        />
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-navy-900">Truck documents</h3>
          {docs.length === 0 ? (
            <p className="text-sm text-road-500">No documents uploaded.</p>
          ) : (
            <ul className="space-y-2">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg bg-road-50 px-3 py-2 text-sm">
                  <span>
                    {d.name}
                    <span className="block text-xs text-road-500">Expires {date(d.expiresAt)}</span>
                  </span>
                  <StatusBadge kind="document" value={documentStatus(d, state.settings.documentExpiryWarningDays)} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-navy-900">Recent loads</h3>
          {history.length === 0 ? (
            <p className="text-sm text-road-500">No loads yet.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((l) => (
                <li key={l.id}>
                  <Link to={loadPath(l.id)} onClick={onClose} className="flex items-center justify-between gap-2 rounded-lg bg-road-50 px-3 py-2 text-sm hover:bg-road-100">
                    <span className="min-w-0 truncate">
                      {l.id} · {l.pickup.city} → {l.delivery.city}
                    </span>
                    <StatusBadge kind="load" value={l.status} size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}
