import { useState } from 'react'
import { Eye, Pencil, Plus, Truck as TruckIcon } from 'lucide-react'
import type { Truck } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { upsertTruck } from '@/services/commands'
import { carrierName, driverName } from '@/services/selectors'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Feedback'
import { FilterBar, FilterSelect, PageHeader, SearchInput } from '@/components/ui/PageHeader'
import { useToast } from '@/components/ui/Toast'
import { EquipmentGlyph } from '@/components/brand/EquipmentGlyph'
import { EQUIPMENT, equipmentLabel } from '@/lib/equipment'
import { TRUCK_STATUS } from '@/lib/status'
import { TruckFormModal } from '@/features/shared/FleetForms'
import { currentLoadFor, TruckDetailModal } from '@/features/shared/TruckDetailModal'

export function TrucksPage() {
  const { state, update } = useDemo()
  const actor = useStaffActor()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [carrier, setCarrier] = useState('')
  const [status, setStatus] = useState('')
  const [equipment, setEquipment] = useState('')
  const [editing, setEditing] = useState<Truck | 'new' | null>(null)
  const [viewing, setViewing] = useState<Truck | null>(null)
  const canManage = actor.can('carriers.manage')
  const rows = state.trucks.filter((t) => (!carrier || t.carrierId === carrier) && (!status || t.status === status) && (!equipment || t.equipment === equipment) && (!q || `${t.unitNumber} ${t.make} ${t.model} ${t.vin}`.toLowerCase().includes(q.toLowerCase())))

  const columns: Column<Truck>[] = [
    { key: 'unit', header: 'Truck #', sortValue: (t) => t.unitNumber, render: (t) => <div className="flex items-center gap-3"><span className="w-12 shrink-0"><EquipmentGlyph type={t.equipment} /></span><span className="font-semibold">{t.unitNumber}</span></div> },
    { key: 'carrier', header: 'Carrier', render: (t) => carrierName(state, t.carrierId), sortValue: (t) => carrierName(state, t.carrierId), hideBelow: 'md' },
    { key: 'eq', header: 'Equipment', render: (t) => equipmentLabel(t.equipment), sortValue: (t) => t.equipment },
    { key: 'ymm', header: 'Year / Make / Model', render: (t) => `${t.year} ${t.make} ${t.model}`, hideBelow: 'lg' },
    { key: 'driver', header: 'Driver', render: (t) => driverName(state, t.driverId), hideBelow: 'md' },
    { key: 'load', header: 'Current Load', render: (t) => currentLoadFor(state, t.id)?.id ?? '—', hideBelow: 'xl' },
    { key: 'base', header: 'Home Base', render: (t) => t.homeBase, hideBelow: 'xl' },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge kind="truck" value={t.status} size="sm" />, sortValue: (t) => t.status },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (t) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="xs" variant="ghost" icon={<Eye className="size-3.5" />} onClick={() => setViewing(t)}>View</Button>
          {canManage && <Button size="xs" variant="ghost" icon={<Pencil className="size-3.5" />} onClick={() => setEditing(t)}>Edit</Button>}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Trucks"
        description="Fleet-wide equipment availability for dispatch planning."
        actions={canManage && <Button variant="accent" icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>Add truck</Button>}
      />
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.keys(TRUCK_STATUS).map((s) => (
          <button key={s} type="button" onClick={() => setStatus(status === s ? '' : s)} className={`rounded-xl border bg-white p-3 text-left ${status === s ? 'border-navy-900 ring-1 ring-navy-900' : 'border-road-200'}`}>
            <StatusBadge kind="truck" value={s as Truck['status']} size="sm" />
            <p className="mt-1.5 font-display text-xl font-bold text-navy-900">{state.trucks.filter((t) => t.status === s).length}</p>
          </button>
        ))}
      </div>
      <Card padded={false}>
        <div className="p-4">
          <FilterBar>
            <SearchInput value={q} onChange={setQ} placeholder="Search unit, make, VIN…" className="sm:w-72" />
            <FilterSelect label="Carrier" value={carrier} onChange={setCarrier} options={state.carriers.map((c) => ({ value: c.id, label: c.legalName }))} />
            <FilterSelect label="Equipment" value={equipment} onChange={setEquipment} options={EQUIPMENT.map((e) => ({ value: e.type, label: e.label }))} />
            <FilterSelect label="Status" value={status} onChange={setStatus} options={Object.entries(TRUCK_STATUS).map(([value, x]) => ({ value, label: x.label }))} />
          </FilterBar>
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(t) => t.id} onRowClick={setViewing} mobileAside={(t) => <StatusBadge kind="truck" value={t.status} size="sm" />} empty={<EmptyState icon={<TruckIcon className="size-7" />} title="No trucks match" />} />
      </Card>
      {viewing && <TruckDetailModal truck={viewing} state={state} loadPath={(id) => `/admin/loads/${id}`} onClose={() => setViewing(null)} onEdit={canManage ? () => { setEditing(viewing); setViewing(null) } : undefined} />}
      {editing && (
        <TruckFormModal
          truck={editing === 'new' ? undefined : editing}
          carriers={state.carriers}
          drivers={state.drivers}
          onClose={() => setEditing(null)}
          onSave={(t) => {
            update((s) => upsertTruck(s, t))
            toast({ title: editing === 'new' ? 'Truck added' : 'Truck updated', description: t.unitNumber })
            setEditing(null)
          }}
        />
      )}
    </>
  )
}
