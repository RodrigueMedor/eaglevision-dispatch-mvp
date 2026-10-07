import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Package, Plus, X } from 'lucide-react'
import type { Load } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { createLoad, nextLoadId } from '@/services/commands'
import { carrierName, dispatchers, driverName, truckUnit, userName } from '@/services/selectors'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Feedback'
import { FilterBar, FilterSelect, PageHeader, SearchInput } from '@/components/ui/PageHeader'
import { useToast } from '@/components/ui/Toast'
import { EQUIPMENT, equipmentLabel } from '@/lib/equipment'
import { miles, money, ratePerMile, shortDate } from '@/lib/format'
import { LOAD_FLOW, LOAD_STATUS } from '@/lib/status'
import { LoadFormModal } from '../loads/LoadModals'

export function LoadsPage() {
  const { state, update } = useDemo()
  const actor = useStaffActor()
  const toast = useToast()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState(params.get('status') ?? '')
  const [equipment, setEquipment] = useState('')
  const [carrier, setCarrier] = useState('')
  const [dispatcher, setDispatcher] = useState('')
  const creating = params.get('new') === '1'
  const canManage = actor.can('loads.manage')

  const rows = state.loads.filter(
    (l) =>
      (!status || l.status === status) &&
      (!equipment || l.equipment === equipment) &&
      (!carrier || (carrier === 'none' ? !l.carrierId : l.carrierId === carrier)) &&
      (!dispatcher || l.dispatcherId === dispatcher) &&
      (!q || `${l.id} ${l.pickup.city} ${l.delivery.city} ${l.broker.name} ${l.reference}`.toLowerCase().includes(q.toLowerCase())),
  )
  const filtered = !!(status || equipment || carrier || dispatcher || q)

  const columns: Column<Load>[] = [
    { key: 'id', header: 'Load #', render: (l) => <div><p className="font-semibold">{l.id}</p><p className="text-xs text-road-500">{equipmentLabel(l.equipment)}</p></div>, sortValue: (l) => l.id },
    { key: 'carrier', header: 'Carrier', render: (l) => (l.carrierId ? carrierName(state, l.carrierId) : <Badge size="sm">Unassigned</Badge>), sortValue: (l) => carrierName(state, l.carrierId) },
    { key: 'truck', header: 'Truck', render: (l) => truckUnit(state, l.truckId), hideBelow: 'xl' },
    { key: 'driver', header: 'Driver', render: (l) => driverName(state, l.driverId), hideBelow: 'xl' },
    { key: 'origin', header: 'Origin', render: (l) => `${l.pickup.city}, ${l.pickup.state}` },
    { key: 'dest', header: 'Destination', render: (l) => `${l.delivery.city}, ${l.delivery.state}` },
    { key: 'pickup', header: 'Pickup', render: (l) => shortDate(l.pickup.appointment), sortValue: (l) => l.pickup.appointment, hideBelow: 'md' },
    { key: 'delivery', header: 'Delivery', render: (l) => shortDate(l.delivery.appointment), sortValue: (l) => l.delivery.appointment, hideBelow: 'lg' },
    { key: 'miles', header: 'Miles', render: (l) => miles(l.miles), sortValue: (l) => l.miles, align: 'right', hideBelow: 'lg' },
    { key: 'rate', header: 'Rate', render: (l) => <div className="text-right"><p className="font-semibold">{money(l.rate)}</p><p className="text-xs text-road-500">{ratePerMile(l.rate, l.miles)}</p></div>, sortValue: (l) => l.rate, align: 'right' },
    { key: 'dispatcher', header: 'Dispatcher', render: (l) => userName(state, l.dispatcherId), hideBelow: 'xl' },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge kind="load" value={l.status} size="sm" />, sortValue: (l) => LOAD_FLOW.indexOf(l.status) },
  ]

  return (
    <>
      <PageHeader
        title="Loads"
        description="Every load from opportunity to completion. Click a load to assign, update status, upload documents or add notes."
        actions={
          <>
            <Button to="/admin/dispatch" variant="outline">
              Dispatch board
            </Button>
            {canManage && (
              <Button variant="accent" icon={<Plus className="size-4" />} onClick={() => setParams({ new: '1' })}>
                Create load
              </Button>
            )}
          </>
        }
      />
      <Card padded={false}>
        <div className="p-4">
          <FilterBar>
            <SearchInput value={q} onChange={setQ} placeholder="Search load #, city, broker, PO…" className="sm:w-72" />
            <FilterSelect label="Status" value={status} onChange={setStatus} options={LOAD_FLOW.map((s) => ({ value: s, label: LOAD_STATUS[s].label }))} />
            <FilterSelect label="Equipment" value={equipment} onChange={setEquipment} options={EQUIPMENT.map((e) => ({ value: e.type, label: e.label }))} />
            <FilterSelect label="Carrier" value={carrier} onChange={setCarrier} options={[{ value: 'none', label: 'Unassigned' }, ...state.carriers.map((c) => ({ value: c.id, label: c.legalName }))]} />
            <FilterSelect label="Dispatcher" value={dispatcher} onChange={setDispatcher} options={dispatchers(state).map((u) => ({ value: u.id, label: u.name }))} />
            {filtered && (
              <Button variant="ghost" size="sm" icon={<X className="size-4" />} onClick={() => { setQ(''); setStatus(''); setEquipment(''); setCarrier(''); setDispatcher('') }}>
                Clear
              </Button>
            )}
            <span className="text-sm text-road-500 sm:ml-auto">
              {rows.length} of {state.loads.length} loads
            </span>
          </FilterBar>
        </div>
        <DataTable
          dense
          columns={columns}
          rows={rows}
          rowKey={(l) => l.id}
          onRowClick={(l) => navigate(`/admin/loads/${l.id}`)}
          initialSort={{ key: 'pickup', dir: 'desc' }}
          mobileTitle={(l) => <span>{l.id} · {l.pickup.city} → {l.delivery.city}</span>}
          mobileAside={(l) => <StatusBadge kind="load" value={l.status} size="sm" />}
          empty={<EmptyState icon={<Package className="size-7" />} title="No loads match these filters" />}
        />
      </Card>
      {creating && (
        <LoadFormModal
          state={state}
          onClose={() => setParams({})}
          onSave={(input) => {
            const id = nextLoadId(state)
            update((s) => createLoad(s, input, actor.user.name))
            toast({ title: `Load ${id} created`, description: input.carrierId ? 'Offered to carrier for review.' : 'Added as an open opportunity.' })
            setParams({})
            navigate(`/admin/loads/${id}`)
          }}
        />
      )}
    </>
  )
}
