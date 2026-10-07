import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Building, CircleDollarSign, ClipboardList, FileWarning, PackageCheck, Package, Plus, Receipt, Truck, Upload, Radio } from 'lucide-react'
import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { adminKpis, carrierName, documentStatus, loadsByStatus } from '@/services/selectors'
import { CARRIER_PERFORMANCE, EQUIPMENT_MIX, monthlyRevenue, weeklyLoads } from '@/data/seed/analytics'
import { Card, CardHeader, StatCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { BarChartView, ChartCard, DonutChartView, LineChartView } from '@/components/charts/Charts'
import { equipmentLabel } from '@/lib/equipment'
import { money, moneyCompact, relative, shortDate, time } from '@/lib/format'
import { LOAD_STATUS } from '@/lib/status'

export function AdminDashboard() {
  const { state } = useDemo()
  const actor = useStaffActor()
  const k = adminKpis(state)
  const feePct = state.settings.dispatchFeePct
  const weekly = weeklyLoads()
  const monthly = monthlyRevenue(12, feePct)
  const byStatus = loadsByStatus(state.loads).map((x) => ({ status: LOAD_STATUS[x.status].label, loads: x.count }))
  const equipment = EQUIPMENT_MIX.map((e) => ({ name: equipmentLabel(e.equipment), value: e.loads }))
  const perf = CARRIER_PERFORMANCE.filter((p) => p.loads > 10).map((p) => ({ carrier: carrierName(state, p.carrierId).replace(' LLC', ''), onTime: p.onTime }))

  const pendingApps = state.applications.filter((a) => ['submitted', 'under-review', 'info-required'].includes(a.status))
  const pendingPods = state.loads.filter((l) => l.status === 'delivered')
  const warn = state.settings.documentExpiryWarningDays
  const expiring = state.documents.filter((d) => ['expired', 'expiring'].includes(documentStatus(d, warn))).slice(0, 4)
  const today = new Date().toDateString()
  const todays = state.loads.filter((l) => new Date(l.pickup.appointment).toDateString() === today || new Date(l.delivery.appointment).toDateString() === today)
  const canFinance = actor.can('finance.view')

  return (
    <>
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${actor.user.name.split(' ')[0]}`}
        description="Dispatch operations overview · live demo data plus sample historical trends"
        actions={
          <>
            {actor.can('loadboard.use') && (
              <Button to="/admin/load-board" variant="outline" icon={<Radio className="size-4" />}>
                Load board
              </Button>
            )}
            {actor.can('loads.manage') && (
              <Button to="/admin/loads?new=1" variant="accent" icon={<Plus className="size-4" />}>
                Create load
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Active Carriers" value={k.activeCarriers} icon={<Building className="size-5" />} to="/admin/carriers" />
        <StatCard label="Active Trucks" value={k.activeTrucks} icon={<Truck className="size-5" />} tone="blue" to="/admin/trucks" />
        <StatCard label="Available Trucks" value={k.availableTrucks} icon={<Truck className="size-5" />} tone="green" to="/admin/trucks" />
        <StatCard label="Active Loads" value={k.activeLoads} icon={<Package className="size-5" />} tone="amber" to="/admin/dispatch" />
        <StatCard label="Delivered Today" value={k.deliveredToday} icon={<PackageCheck className="size-5" />} tone="green" to="/admin/loads" />
        <StatCard label="Pending Applications" value={k.pendingApplications} icon={<ClipboardList className="size-5" />} tone="violet" to="/admin/applications" />
        <StatCard label="Documents Expiring" value={k.documentsExpiring} icon={<FileWarning className="size-5" />} tone="red" to="/admin/documents" />
        <StatCard label="Pending PODs" value={k.pendingPods} icon={<Upload className="size-5" />} tone="amber" to="/admin/loads" />
        <StatCard label="Revenue (invoiced)" value={canFinance ? moneyCompact(k.revenue) : '••••'} hint="Gross freight billed" icon={<CircleDollarSign className="size-5" />} tone="blue" to={canFinance ? '/admin/invoices' : undefined} />
        <StatCard label="Dispatch Fees" value={canFinance ? money(k.dispatchFees) : '••••'} hint={`Sample ${feePct}% fee`} icon={<Receipt className="size-5" />} tone="violet" to={canFinance ? '/admin/invoices' : undefined} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3 [&>*]:min-w-0">
        <ChartCard title="Loads by Status" description="Current loads across the workflow" className="xl:col-span-2" table={{ columns: ['Status', 'Loads'], rows: byStatus.map((x) => [x.status, x.loads]) }}>
          <BarChartView data={byStatus} xKey="status" series={[{ key: 'loads', label: 'Loads', color: '#1f3655' }]} height={250} />
        </ChartCard>
        <ChartCard title="Loads by Equipment" description="Last 12 months" table={{ columns: ['Equipment', 'Loads'], rows: equipment.map((e) => [e.name, e.value]) }}>
          <DonutChartView data={equipment} centerLabel="loads" />
        </ChartCard>
        <ChartCard title="Weekly Loads" description="On-time vs. late deliveries · last 12 weeks" className="xl:col-span-2" table={{ columns: ['Week', 'On time', 'Late'], rows: weekly.map((w) => [w.week, w.onTime, w.late]) }}>
          <BarChartView data={weekly} xKey="week" stacked series={[{ key: 'onTime', label: 'On time' }, { key: 'late', label: 'Late' , color: '#e34948' }]} height={250} />
        </ChartCard>
        <ChartCard title="Carrier Performance" description="On-time delivery %" table={{ columns: ['Carrier', 'On-time %'], rows: perf.map((p) => [p.carrier, `${p.onTime}%`]) }}>
          <BarChartView data={perf} xKey="carrier" horizontal series={[{ key: 'onTime', label: 'On-time %', color: '#1baf7a' }]} fmt={(v) => `${v}%`} height={250} />
        </ChartCard>
        {canFinance && (
          <>
            <ChartCard title="Monthly Revenue" description="Gross freight dispatched" className="xl:col-span-2" table={{ columns: ['Month', 'Gross', 'Loads'], rows: monthly.map((m) => [m.month, money(m.gross), m.loads]) }}>
              <LineChartView area data={monthly} xKey="month" series={[{ key: 'gross', label: 'Gross revenue' }]} fmt={(v) => moneyCompact(v)} height={250} />
            </ChartCard>
            <ChartCard title="Dispatch Fees" description={`Monthly fees at sample ${feePct}%`} table={{ columns: ['Month', 'Fees'], rows: monthly.map((m) => [m.month, money(m.fees)]) }}>
              <BarChartView data={monthly} xKey="month" series={[{ key: 'fees', label: 'Dispatch fees', color: '#4a3aa7' }]} fmt={(v) => moneyCompact(v)} height={250} />
            </ChartCard>
          </>
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <TaskCard title="Pending applications" to="/admin/applications" empty="No applications waiting" items={pendingApps.map((a) => ({ id: a.id, to: `/admin/applications/${a.id}`, title: a.company.legalName, sub: `${a.id} · ${relative(a.submittedAt)}`, aside: <StatusBadge kind="application" value={a.status} size="sm" /> }))} />
        <TaskCard title="Pending PODs" to="/admin/loads" empty="All PODs received" items={pendingPods.map((l) => ({ id: l.id, to: `/admin/loads/${l.id}`, title: `${l.id} · ${carrierName(state, l.carrierId)}`, sub: `Delivered ${relative(l.events.at(-1)!.at)}`, aside: <StatusBadge kind="load" value={l.status} size="sm" /> }))} />
        <TaskCard title="Documents expiring" to="/admin/documents" empty="Nothing expiring" items={expiring.map((d) => ({ id: d.id, to: '/admin/documents', title: d.name, sub: `${carrierName(state, d.carrierId)} · ${shortDate(d.expiresAt)}`, aside: <StatusBadge kind="document" value={documentStatus(d, warn)} size="sm" /> }))} />
        <TaskCard title="Today’s stops" to="/admin/dispatch" empty="No stops today" items={todays.map((l) => ({ id: l.id, to: `/admin/loads/${l.id}`, title: `${l.id} · ${l.pickup.city} → ${l.delivery.city}`, sub: new Date(l.pickup.appointment).toDateString() === today ? `Pickup ${time(l.pickup.appointment)}` : `Delivery ${time(l.delivery.appointment)}`, aside: <StatusBadge kind="load" value={l.status} size="sm" /> }))} />
      </div>
    </>
  )
}

function TaskCard({ title, to, items, empty }: { title: string; to: string; empty: string; items: { id: string; to: string; title: string; sub: string; aside: ReactNode }[] }) {
  return (
    <Card>
      <CardHeader
        title={title}
        actions={
          <Link to={to} className="text-xs font-semibold text-navy-600 hover:text-navy-900">
            View all
          </Link>
        }
        className="mb-2"
      />
      {items.length === 0 ? (
        <p className="py-4 text-sm text-road-500">{empty}</p>
      ) : (
        <ul className="divide-y divide-road-100">
          {items.slice(0, 5).map((i) => (
            <li key={i.id}>
              <Link to={i.to} className="flex items-center justify-between gap-3 py-2.5 hover:bg-road-50/70">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-navy-900">{i.title}</span>
                  <span className="block truncate text-xs text-road-500">{i.sub}</span>
                </span>
                <span className="shrink-0">{i.aside}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
