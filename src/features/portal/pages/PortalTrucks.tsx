import { useState } from 'react'
import { Eye, Pencil, Plus, Truck as TruckIcon } from 'lucide-react'
import type { Truck } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { usePortalActor } from '@/store/hooks'
import { upsertTruck } from '@/services/commands'
import { driverName } from '@/services/selectors'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Feedback'
import { PageHeader } from '@/components/ui/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { EquipmentGlyph } from '@/components/brand/EquipmentGlyph'
import { equipmentLabel } from '@/lib/equipment'
import { TRUCK_STATUS } from '@/lib/status'
import { TruckFormModal } from '@/features/shared/FleetForms'
import { currentLoadFor, TruckDetailModal } from '@/features/shared/TruckDetailModal'

export function PortalTrucks() {
  const { state, update } = useDemo()
  const actor = usePortalActor()
  const toast = useToast()
  const [status, setStatus] = useState('all')
  const [editing, setEditing] = useState<Truck | 'new' | null>(null)
  const [viewing, setViewing] = useState<Truck | null>(null)
  const trucks = state.trucks.filter((t) => t.carrierId === actor.carrier.id)
  const rows = trucks.filter((t) => status === 'all' || t.status === status)

  const columns: Column<Truck>[] = [
    {
      key: 'unit',
      header: 'Truck #',
      sortValue: (t) => t.unitNumber,
      render: (t) => (
        <div className="flex items-center gap-3">
          <span className="w-14 shrink-0 rounded-md bg-road-50 p-1">
            <EquipmentGlyph type={t.equipment} />
          </span>
          <span className="font-semibold">{t.unitNumber}</span>
        </div>
      ),
    },
    { key: 'equipment', header: 'Equipment', render: (t) => equipmentLabel(t.equipment), sortValue: (t) => t.equipment },
    { key: 'year', header: 'Year', render: (t) => t.year, sortValue: (t) => t.year, hideBelow: 'md' },
    { key: 'make', header: 'Make', render: (t) => t.make, hideBelow: 'md' },
    { key: 'model', header: 'Model', render: (t) => t.model, hideBelow: 'lg' },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge kind="truck" value={t.status} size="sm" />, sortValue: (t) => t.status },
    { key: 'driver', header: 'Driver', render: (t) => driverName(state, t.driverId) },
    { key: 'load', header: 'Current Load', render: (t) => currentLoadFor(state, t.id)?.id ?? <span className="text-road-400">—</span> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (t) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="xs" variant="ghost" icon={<Eye className="size-3.5" />} onClick={() => setViewing(t)}>
            View
          </Button>
          <Button size="xs" variant="ghost" icon={<Pencil className="size-3.5" />} onClick={() => setEditing(t)}>
            Edit
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Trucks"
        description="Your equipment, status and assignments."
        actions={
          <Button variant="accent" icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
            Add truck
          </Button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(TRUCK_STATUS).map(([s, m]) => (
          <div key={s} className="rounded-xl border border-road-200 bg-white p-3">
            <p className="text-xs font-medium text-road-500">{m.label}</p>
            <p className="font-display text-xl font-bold text-navy-900">{trucks.filter((t) => t.status === s).length}</p>
          </div>
        ))}
      </div>
      <Card padded={false}>
        <div className="p-4 pb-2">
          <Tabs value={status} onChange={setStatus} tabs={[{ id: 'all', label: 'All', count: trucks.length }, ...Object.entries(TRUCK_STATUS).map(([id, m]) => ({ id, label: m.label }))]} />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(t) => t.id}
          onRowClick={setViewing}
          mobileAside={(t) => <StatusBadge kind="truck" value={t.status} size="sm" />}
          empty={<EmptyState icon={<TruckIcon className="size-7" />} title="No trucks with this status" action={<Button onClick={() => setEditing('new')}>Add truck</Button>} />}
        />
      </Card>

      {viewing && <TruckDetailModal truck={viewing} state={state} loadPath={(id) => `/portal/loads/${id}`} onClose={() => setViewing(null)} onEdit={() => { setEditing(viewing); setViewing(null) }} />}
      {editing && (
        <TruckFormModal
          truck={editing === 'new' ? undefined : editing}
          carrierId={actor.carrier.id}
          drivers={state.drivers}
          onClose={() => setEditing(null)}
          onSave={(t) => {
            update((s) => upsertTruck(s, t))
            toast({ title: editing === 'new' ? 'Truck added' : 'Truck updated', description: `${t.unitNumber} · ${equipmentLabel(t.equipment)}` })
            setEditing(null)
          }}
        />
      )}
    </>
  )
}
