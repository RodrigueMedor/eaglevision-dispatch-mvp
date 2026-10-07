import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Building, MessageSquare } from 'lucide-react'
import type { Carrier } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { addCarrierDocument, reviewDocument, updateCarrier } from '@/services/commands'
import { carrierKpis, dispatchers, driverName, truckUnit } from '@/services/selectors'
import { CARRIER_PERFORMANCE } from '@/data/seed/analytics'
import { Card, CardHeader, DescriptionList, StatCard } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Form'
import { Avatar, EmptyState, Stars } from '@/components/ui/Feedback'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { equipmentLabel } from '@/lib/equipment'
import { date, money, shortDate } from '@/lib/format'
import { CARRIER_STATUS } from '@/lib/status'
import { DocumentCenter } from '@/features/shared/DocumentCenter'
import { driverColumns } from '@/features/shared/driverColumns'
import { RouteLine } from '@/features/shared/LoadBits'

export function CarrierDetailPage() {
  const { id = '' } = useParams()
  const { state, update } = useDemo()
  const actor = useStaffActor()
  const toast = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const c = state.carriers.find((x) => x.id === id)
  if (!c) return <EmptyState icon={<Building className="size-7" />} title="Carrier not found" action={<Button to="/admin/carriers">Back to carriers</Button>} />

  const k = carrierKpis(state, c.id)
  const perf = CARRIER_PERFORMANCE.find((p) => p.carrierId === c.id)
  const loads = state.loads.filter((l) => l.carrierId === c.id)
  const trucks = state.trucks.filter((t) => t.carrierId === c.id)
  const drivers = state.drivers.filter((d) => d.carrierId === c.id)
  const canManage = actor.can('carriers.manage')

  return (
    <>
      <Button to="/admin/carriers" variant="ghost" size="sm" className="mb-3 -ml-2">
        ← Carriers
      </Button>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={c.legalName} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-navy-900">{c.legalName}</h1>
              <StatusBadge kind="carrier" value={c.status} />
            </div>
            <p className="text-sm text-road-500">
              {c.mcNumber} · DOT {c.dotNumber} · {c.ownerName}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          {canManage && (
            <>
              <Select
                label="Status"
                value={c.status}
                onChange={(e) => {
                  update((s) => updateCarrier(s, c.id, { status: e.target.value as Carrier['status'] }))
                  toast({ title: `Carrier status: ${CARRIER_STATUS[e.target.value as Carrier['status']].label}` })
                }}
                options={Object.entries(CARRIER_STATUS).map(([value, m]) => ({ value, label: m.label }))}
              />
              <Select
                label="Dispatcher"
                value={c.dispatcherId}
                onChange={(e) => {
                  update((s) => updateCarrier(s, c.id, { dispatcherId: e.target.value }))
                  toast({ title: 'Dispatcher reassigned' })
                }}
                options={dispatchers(state).map((u) => ({ value: u.id, label: u.name }))}
              />
            </>
          )}
          <Button to="/admin/messages" variant="outline" icon={<MessageSquare className="size-4" />}>
            Message
          </Button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Active loads" value={k.activeLoads} icon={<Building className="size-5" />} />
        <StatCard label="Trucks available" value={`${k.availableTrucks}/${k.totalTrucks}`} icon={<Building className="size-5" />} tone="green" />
        <StatCard label="Docs expiring" value={k.documentsExpiring} icon={<Building className="size-5" />} tone={k.documentsExpiring ? 'red' : 'green'} />
        <StatCard label="On-time (12 mo)" value={`${perf?.onTime ?? c.onTimeRate}%`} icon={<Building className="size-5" />} tone="blue" hint="Sample history" />
        <StatCard label="Dispatch fees" value={money(k.dispatchFees)} icon={<Building className="size-5" />} tone="violet" />
      </div>

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'loads', label: 'Loads', count: loads.length },
          { id: 'fleet', label: 'Trucks & Drivers', count: trucks.length + drivers.length },
          { id: 'documents', label: 'Documents', count: state.documents.filter((d) => d.carrierId === c.id).length },
        ]}
      />

      {tab === 'overview' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Company profile" />
            <DescriptionList
              items={[
                { label: 'Owner', value: c.ownerName },
                { label: 'Email', value: c.email },
                { label: 'Phone', value: c.phone },
                { label: 'EIN', value: `••-•••${c.einLast4}` },
                { label: 'Address', value: `${c.address.street}, ${c.address.city}, ${c.address.state} ${c.address.zip}` },
                { label: 'Joined', value: date(c.joinedAt) },
                { label: 'Rating', value: <Stars value={c.rating} /> },
                { label: 'Equipment', value: c.equipment.map(equipmentLabel).join(', ') },
              ]}
            />
          </Card>
          <Card>
            <CardHeader title="Insurance & preferences" />
            <DescriptionList
              items={[
                { label: 'Insurance', value: c.insurance.provider },
                { label: 'Policy', value: c.insurance.policyNumber },
                { label: 'Auto liability', value: money(c.insurance.autoLiability) },
                { label: 'Cargo', value: money(c.insurance.cargo) },
                { label: 'Insurance expires', value: date(c.insurance.expiresAt) },
                { label: 'Radius', value: c.radius.toUpperCase() },
                { label: 'Preferred states', value: <div className="flex flex-wrap gap-1">{c.preferredStates.map((s) => <Badge key={s} size="sm">{s}</Badge>)}</div> },
              ]}
            />
          </Card>
        </div>
      )}

      {tab === 'loads' && (
        <Card padded={false}>
          <DataTable
            rows={loads}
            rowKey={(l) => l.id}
            onRowClick={(l) => navigate(`/admin/loads/${l.id}`)}
            columns={[
              { key: 'id', header: 'Load #', render: (l) => <span className="font-semibold">{l.id}</span>, sortValue: (l) => l.id },
              { key: 'lane', header: 'Lane', render: (l) => <RouteLine load={l} /> },
              { key: 'pickup', header: 'Pickup', render: (l) => shortDate(l.pickup.appointment), sortValue: (l) => l.pickup.appointment },
              { key: 'truck', header: 'Truck', render: (l) => truckUnit(state, l.truckId), hideBelow: 'md' },
              { key: 'driver', header: 'Driver', render: (l) => driverName(state, l.driverId), hideBelow: 'lg' },
              { key: 'rate', header: 'Rate', render: (l) => money(l.rate), align: 'right' },
              { key: 'status', header: 'Status', render: (l) => <StatusBadge kind="load" value={l.status} size="sm" /> },
            ]}
            initialSort={{ key: 'pickup', dir: 'desc' }}
            empty={<EmptyState icon={<Building className="size-7" />} title="No loads yet" />}
          />
        </Card>
      )}

      {tab === 'fleet' && (
        <div className="space-y-5">
          <Card padded={false}>
            <div className="p-4 pb-0">
              <CardHeader title="Trucks" />
            </div>
            <DataTable
              rows={trucks}
              rowKey={(t) => t.id}
              columns={[
                { key: 'unit', header: 'Unit', render: (t) => <span className="font-semibold">{t.unitNumber}</span> },
                { key: 'eq', header: 'Equipment', render: (t) => equipmentLabel(t.equipment) },
                { key: 'ymm', header: 'Year / Make / Model', render: (t) => `${t.year} ${t.make} ${t.model}` },
                { key: 'driver', header: 'Driver', render: (t) => driverName(state, t.driverId) },
                { key: 'status', header: 'Status', render: (t) => <StatusBadge kind="truck" value={t.status} size="sm" /> },
              ]}
              empty={<EmptyState icon={<Building className="size-7" />} title="No trucks" />}
            />
          </Card>
          <Card padded={false}>
            <div className="p-4 pb-0">
              <CardHeader title="Drivers" />
            </div>
            <DataTable columns={driverColumns(state)} rows={drivers} rowKey={(d) => d.id} empty={<EmptyState icon={<Building className="size-7" />} title="No drivers" />} />
          </Card>
        </div>
      )}

      {tab === 'documents' && (
        <DocumentCenter
          documents={state.documents.filter((d) => d.carrierId === c.id)}
          warnDays={state.settings.documentExpiryWarningDays}
          mode="admin"
          carriers={[c]}
          trucks={state.trucks}
          drivers={state.drivers}
          carrierId={c.id}
          canUpload={actor.can('documents.review')}
          canReview={actor.can('documents.review')}
          onUpload={(doc) => update((s) => addCarrierDocument(s, doc))}
          onReview={(docId, review) => update((s) => reviewDocument(s, docId, review))}
        />
      )}
    </>
  )
}
