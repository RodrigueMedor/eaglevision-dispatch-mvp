import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, List, Package } from 'lucide-react'
import type { Load, LoadStatus } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { driverName, loadsForPortal, truckUnit, userName } from '@/services/selectors'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Feedback'
import { FilterBar, PageHeader, SearchInput } from '@/components/ui/PageHeader'
import { Segmented, Tabs } from '@/components/ui/Tabs'
import { miles, money, ratePerMile, shortDate } from '@/lib/format'
import { LoadCard } from '../LoadCard'

const GROUPS: { id: string; label: string; statuses: LoadStatus[] }[] = [
  { id: 'active', label: 'Active', statuses: ['approved', 'dispatched', 'pickup', 'in-transit'] },
  { id: 'offers', label: 'Offers', statuses: ['review'] },
  { id: 'delivered', label: 'Delivered', statuses: ['delivered', 'pod-received', 'invoiced'] },
  { id: 'completed', label: 'Completed', statuses: ['completed'] },
  { id: 'all', label: 'All', statuses: [] },
]

export function PortalLoads() {
  const { state } = useDemo()
  const navigate = useNavigate()
  const [group, setGroup] = useState('active')
  const [q, setQ] = useState('')
  const [view, setView] = useState<'table' | 'cards'>('table')
  const loads = loadsForPortal(state)
  const g = GROUPS.find((x) => x.id === group)!
  const rows = loads.filter((l) => (g.statuses.length === 0 || g.statuses.includes(l.status)) && (!q || `${l.id} ${l.pickup.city} ${l.delivery.city} ${l.broker.name}`.toLowerCase().includes(q.toLowerCase())))

  const columns: Column<Load>[] = [
    { key: 'id', header: 'Load #', render: (l) => <span className="font-semibold">{l.id}</span>, sortValue: (l) => l.id },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge kind="load" value={l.status} size="sm" />, sortValue: (l) => l.status },
    { key: 'origin', header: 'Origin', render: (l) => `${l.pickup.city}, ${l.pickup.state}` },
    { key: 'dest', header: 'Destination', render: (l) => `${l.delivery.city}, ${l.delivery.state}` },
    { key: 'pickup', header: 'Pickup', render: (l) => shortDate(l.pickup.appointment), sortValue: (l) => l.pickup.appointment },
    { key: 'delivery', header: 'Delivery', render: (l) => shortDate(l.delivery.appointment), sortValue: (l) => l.delivery.appointment, hideBelow: 'md' },
    { key: 'miles', header: 'Miles', render: (l) => miles(l.miles), sortValue: (l) => l.miles, hideBelow: 'lg', align: 'right' },
    { key: 'rate', header: 'Rate', render: (l) => <span className="font-semibold">{money(l.rate)}</span>, sortValue: (l) => l.rate, align: 'right' },
    { key: 'rpm', header: 'Rate/Mi', render: (l) => ratePerMile(l.rate, l.miles), sortValue: (l) => l.rate / l.miles, hideBelow: 'lg', align: 'right' },
    { key: 'truck', header: 'Truck', render: (l) => truckUnit(state, l.truckId), hideBelow: 'xl' },
    { key: 'driver', header: 'Driver', render: (l) => driverName(state, l.driverId), hideBelow: 'xl' },
    { key: 'dispatcher', header: 'Dispatcher', render: (l) => userName(state, l.dispatcherId), hideBelow: 'xl' },
  ]

  return (
    <>
      <PageHeader
        title="Loads"
        description="Assigned loads, offers awaiting your approval and load history."
        actions={
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: 'table', label: <span className="inline-flex items-center gap-1"><List className="size-3.5" /> Table</span> },
              { value: 'cards', label: <span className="inline-flex items-center gap-1"><LayoutGrid className="size-3.5" /> Cards</span> },
            ]}
          />
        }
      />
      <Card padded={false}>
        <div className="space-y-3 p-4">
          <Tabs value={group} onChange={setGroup} tabs={GROUPS.map((x) => ({ id: x.id, label: x.label, count: loads.filter((l) => x.statuses.length === 0 || x.statuses.includes(l.status)).length }))} />
          <FilterBar>
            <SearchInput value={q} onChange={setQ} placeholder="Search load #, city or broker…" className="sm:w-80" />
          </FilterBar>
        </div>
        {view === 'table' ? (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(l) => l.id}
            onRowClick={(l) => navigate(`/portal/loads/${l.id}`)}
            mobileTitle={(l) => (
              <span>
                {l.id} · {l.pickup.city} → {l.delivery.city}
              </span>
            )}
            mobileAside={(l) => <StatusBadge kind="load" value={l.status} size="sm" />}
            initialSort={{ key: 'pickup', dir: 'desc' }}
            empty={<EmptyState icon={<Package className="size-7" />} title="No loads here yet" description="Loads appear here as your dispatcher books them." />}
          />
        ) : rows.length === 0 ? (
          <EmptyState icon={<Package className="size-7" />} title="No loads here yet" />
        ) : (
          <div className="grid gap-3 p-4 pt-0 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((l) => (
              <LoadCard key={l.id} load={l} state={state} to={`/portal/loads/${l.id}`} />
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
