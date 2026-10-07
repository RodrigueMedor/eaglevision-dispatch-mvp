import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building } from 'lucide-react'
import type { Carrier } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { documentStatus, isActiveLoad, userName } from '@/services/selectors'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Avatar, EmptyState, Stars } from '@/components/ui/Feedback'
import { FilterBar, FilterSelect, PageHeader, SearchInput } from '@/components/ui/PageHeader'
import { EQUIPMENT, equipmentLabel } from '@/lib/equipment'
import { CARRIER_STATUS } from '@/lib/status'

export function CarriersPage() {
  const { state } = useDemo()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [equipment, setEquipment] = useState('')
  const warn = state.settings.documentExpiryWarningDays
  const rows = state.carriers.filter(
    (c) =>
      (!status || c.status === status) &&
      (!equipment || c.equipment.includes(equipment as Carrier['equipment'][number])) &&
      (!q || `${c.legalName} ${c.mcNumber} ${c.dotNumber} ${c.ownerName}`.toLowerCase().includes(q.toLowerCase())),
  )

  const columns: Column<Carrier>[] = [
    {
      key: 'name',
      header: 'Carrier',
      sortValue: (c) => c.legalName,
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar name={c.legalName} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{c.legalName}</p>
            <p className="truncate text-xs text-road-500">
              {c.ownerName} · {c.address.city}, {c.address.state}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'mc', header: 'MC / DOT', render: (c) => <span className="text-xs">{c.mcNumber}<br />DOT {c.dotNumber}</span>, hideBelow: 'md' },
    { key: 'equipment', header: 'Equipment', render: (c) => <div className="flex flex-wrap gap-1">{c.equipment.map((e) => <Badge key={e} size="sm">{equipmentLabel(e)}</Badge>)}</div> },
    { key: 'trucks', header: 'Trucks', render: (c) => state.trucks.filter((t) => t.carrierId === c.id).length, align: 'right', hideBelow: 'lg' },
    { key: 'loads', header: 'Active Loads', render: (c) => state.loads.filter((l) => l.carrierId === c.id && isActiveLoad(l)).length, align: 'right', hideBelow: 'lg' },
    {
      key: 'compliance',
      header: 'Compliance',
      render: (c) => {
        const docs = state.documents.filter((d) => d.carrierId === c.id).map((d) => documentStatus(d, warn))
        return docs.includes('expired') ? <Badge tone="danger" dot size="sm">Expired docs</Badge> : docs.includes('expiring') ? <Badge tone="warning" dot size="sm">Expiring</Badge> : <Badge tone="success" dot size="sm">Compliant</Badge>
      },
    },
    { key: 'rating', header: 'Rating', render: (c) => <Stars value={c.rating} />, sortValue: (c) => c.rating, hideBelow: 'xl' },
    { key: 'dispatcher', header: 'Dispatcher', render: (c) => userName(state, c.dispatcherId), hideBelow: 'xl' },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge kind="carrier" value={c.status} size="sm" />, sortValue: (c) => c.status },
  ]

  return (
    <>
      <PageHeader title="Carriers" description="Approved carriers and owner-operators under dispatch." />
      <Card padded={false}>
        <div className="p-4">
          <FilterBar>
            <SearchInput value={q} onChange={setQ} placeholder="Search name, MC, DOT, owner…" className="sm:w-80" />
            <FilterSelect label="Status" value={status} onChange={setStatus} options={Object.entries(CARRIER_STATUS).map(([value, m]) => ({ value, label: m.label }))} />
            <FilterSelect label="Equipment" value={equipment} onChange={setEquipment} options={EQUIPMENT.map((e) => ({ value: e.type, label: e.label }))} />
          </FilterBar>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          onRowClick={(c) => navigate(`/admin/carriers/${c.id}`)}
          mobileAside={(c) => <StatusBadge kind="carrier" value={c.status} size="sm" />}
          empty={<EmptyState icon={<Building className="size-7" />} title="No carriers match" />}
        />
      </Card>
    </>
  )
}
