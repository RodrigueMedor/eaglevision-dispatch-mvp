import { useState } from 'react'
import { Download } from 'lucide-react'
import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { carrierName, loadsByStatus } from '@/services/selectors'
import { CARRIER_PERFORMANCE, EQUIPMENT_MIX, LANE_PERFORMANCE, TRUCK_PERFORMANCE, monthlyRevenue, weeklyLoads } from '@/data/seed/analytics'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { ProgressBar } from '@/components/ui/Feedback'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { Segmented, Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { BarChartView, ChartCard, DonutChartView, LineChartView } from '@/components/charts/Charts'
import { equipmentLabel } from '@/lib/equipment'
import { money, moneyCompact, number } from '@/lib/format'
import { LOAD_STATUS } from '@/lib/status'

const REPORTS = [
  { id: 'loads', label: 'Loads' },
  { id: 'revenue', label: 'Revenue', finance: true },
  { id: 'fees', label: 'Dispatch Fees', finance: true },
  { id: 'carriers', label: 'Carrier Performance' },
  { id: 'trucks', label: 'Truck Performance' },
  { id: 'delivery', label: 'Delivery Performance' },
  { id: 'equipment', label: 'Equipment Type' },
  { id: 'lanes', label: 'Lane Performance' },
]

export function ReportsPage() {
  const { state } = useDemo()
  const actor = useStaffActor()
  const toast = useToast()
  const [tab, setTab] = useState('loads')
  const [range, setRange] = useState<'3' | '6' | '12'>('12')
  const months = Number(range)
  const feePct = state.settings.dispatchFeePct
  const monthly = monthlyRevenue(12, feePct).slice(-months)
  const weekly = weeklyLoads(Math.round(months * 4.3)).slice(-Math.min(26, Math.round(months * 4.3)))
  const reports = REPORTS.filter((r) => !r.finance || actor.can('finance.view'))

  const exportBtn = (
    <Button variant="outline" icon={<Download className="size-4" />} onClick={() => toast({ title: 'Report exported', description: `${REPORTS.find((r) => r.id === tab)?.label} report (CSV / PDF) — demo only.`, tone: 'info' })}>
      Export
    </Button>
  )

  return (
    <>
      <PageHeader
        title="Reports"
        description="Operational and financial reporting. Charts combine live demo records with sample historical trends."
        actions={
          <>
            <Segmented value={range} onChange={setRange} options={[{ value: '3', label: '3 mo' }, { value: '6', label: '6 mo' }, { value: '12', label: '12 mo' }]} />
            {exportBtn}
          </>
        }
      />
      <Tabs className="mb-5" value={tab} onChange={setTab} tabs={reports.map((r) => ({ id: r.id, label: r.label }))} />

      {tab === 'loads' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartCard title="Loads per week" table={{ columns: ['Week', 'Loads'], rows: weekly.map((w) => [w.week, w.loads]) }}>
            <LineChartView area data={weekly} xKey="week" series={[{ key: 'loads', label: 'Loads' }]} />
          </ChartCard>
          <ChartCard title="Current loads by status" description="Live demo data" table={{ columns: ['Status', 'Loads'], rows: loadsByStatus(state.loads).map((x) => [LOAD_STATUS[x.status].label, x.count]) }}>
            <BarChartView data={loadsByStatus(state.loads).map((x) => ({ status: LOAD_STATUS[x.status].label, loads: x.count }))} xKey="status" series={[{ key: 'loads', label: 'Loads', color: '#1f3655' }]} />
          </ChartCard>
        </div>
      )}

      {tab === 'revenue' && (
        <div className="grid gap-5 xl:grid-cols-[2fr_1fr] [&>*]:min-w-0">
          <ChartCard title="Gross revenue by month" table={{ columns: ['Month', 'Gross', 'Loads'], rows: monthly.map((m) => [m.month, money(m.gross), m.loads]) }}>
            <LineChartView area data={monthly} xKey="month" series={[{ key: 'gross', label: 'Gross revenue' }]} fmt={moneyCompact} height={280} />
          </ChartCard>
          <Card>
            <p className="text-sm text-road-500">Total gross · {months} months</p>
            <p className="font-display text-3xl font-bold text-navy-900">{money(monthly.reduce((s, m) => s + m.gross, 0))}</p>
            <p className="mt-4 text-sm text-road-500">Loads</p>
            <p className="font-display text-2xl font-bold text-navy-900">{number(monthly.reduce((s, m) => s + m.loads, 0))}</p>
            <p className="mt-4 text-sm text-road-500">Average revenue per load</p>
            <p className="font-display text-2xl font-bold text-navy-900">{money(monthly.reduce((s, m) => s + m.gross, 0) / Math.max(1, monthly.reduce((s, m) => s + m.loads, 0)))}</p>
          </Card>
        </div>
      )}

      {tab === 'fees' && (
        <ChartCard title={`Dispatch fees by month · sample ${feePct}%`} table={{ columns: ['Month', 'Fees'], rows: monthly.map((m) => [m.month, money(m.fees)]) }}>
          <BarChartView data={monthly} xKey="month" series={[{ key: 'fees', label: 'Dispatch fees', color: '#4a3aa7' }]} fmt={moneyCompact} height={300} />
        </ChartCard>
      )}

      {tab === 'carriers' && (
        <Card padded={false}>
          <DataTable
            rows={CARRIER_PERFORMANCE}
            rowKey={(r) => r.carrierId}
            initialSort={{ key: 'loads', dir: 'desc' }}
            columns={[
              { key: 'carrier', header: 'Carrier', render: (r) => <span className="font-semibold">{carrierName(state, r.carrierId)}</span> },
              { key: 'loads', header: 'Loads', render: (r) => r.loads, sortValue: (r) => r.loads, align: 'right' },
              { key: 'revenue', header: 'Revenue', render: (r) => money(r.revenue), sortValue: (r) => r.revenue, align: 'right' },
              { key: 'rpm', header: 'Avg $/mi', render: (r) => `$${r.avgRpm.toFixed(2)}`, sortValue: (r) => r.avgRpm, align: 'right' },
              { key: 'ontime', header: 'On-time', sortValue: (r) => r.onTime, render: (r) => <div className="flex min-w-32 items-center gap-2"><ProgressBar value={r.onTime} tone={r.onTime >= 95 ? 'green' : r.onTime >= 92 ? 'amber' : 'red'} className="flex-1" /><span className="w-10 text-right text-xs font-semibold">{r.onTime}%</span></div> },
              { key: 'claims', header: 'Claims', render: (r) => (r.claims ? <Badge tone="warning" size="sm">{r.claims}</Badge> : <Badge tone="success" size="sm">0</Badge>), align: 'right' },
            ]}
          />
        </Card>
      )}

      {tab === 'trucks' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartCard title="Revenue by truck" table={{ columns: ['Unit', 'Revenue', 'Loads', 'Miles'], rows: TRUCK_PERFORMANCE.map((t) => [t.unit, money(t.revenue), t.loads, number(t.miles)]) }}>
            <BarChartView data={TRUCK_PERFORMANCE} xKey="unit" series={[{ key: 'revenue', label: 'Revenue' }]} fmt={moneyCompact} height={280} />
          </ChartCard>
          <ChartCard title="Utilization by truck" description="% of available days under load" table={{ columns: ['Unit', 'Utilization'], rows: TRUCK_PERFORMANCE.map((t) => [t.unit, `${t.utilization}%`]) }}>
            <BarChartView horizontal data={TRUCK_PERFORMANCE.map((t) => ({ unit: `${t.unit} · ${equipmentLabel(t.equipment)}`, utilization: t.utilization }))} xKey="unit" series={[{ key: 'utilization', label: 'Utilization', color: '#1baf7a' }]} fmt={(v) => `${v}%`} height={280} />
          </ChartCard>
        </div>
      )}

      {tab === 'delivery' && (
        <ChartCard title="On-time vs. late deliveries" table={{ columns: ['Week', 'On time', 'Late', 'On-time %'], rows: weekly.map((w) => [w.week, w.onTime, w.late, `${Math.round((w.onTime / w.loads) * 100)}%`]) }}>
          <BarChartView stacked data={weekly} xKey="week" series={[{ key: 'onTime', label: 'On time' }, { key: 'late', label: 'Late', color: '#e34948' }]} height={300} />
        </ChartCard>
      )}

      {tab === 'equipment' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartCard title="Loads by equipment type" table={{ columns: ['Equipment', 'Loads'], rows: EQUIPMENT_MIX.map((e) => [equipmentLabel(e.equipment), e.loads]) }}>
            <DonutChartView data={EQUIPMENT_MIX.map((e) => ({ name: equipmentLabel(e.equipment), value: e.loads }))} centerLabel="loads" height={240} />
          </ChartCard>
          <ChartCard title="Equipment share" description="Box trucks are the largest segment">
            <BarChartView horizontal data={EQUIPMENT_MIX.map((e) => ({ eq: equipmentLabel(e.equipment), loads: e.loads }))} xKey="eq" series={[{ key: 'loads', label: 'Loads', color: '#1f3655' }]} height={280} />
          </ChartCard>
        </div>
      )}

      {tab === 'lanes' && (
        <Card padded={false}>
          <DataTable
            rows={LANE_PERFORMANCE}
            rowKey={(r) => r.lane}
            initialSort={{ key: 'loads', dir: 'desc' }}
            columns={[
              { key: 'lane', header: 'Lane', render: (r) => <span className="font-semibold">{r.lane}</span> },
              { key: 'loads', header: 'Loads', render: (r) => r.loads, sortValue: (r) => r.loads, align: 'right' },
              { key: 'avgRate', header: 'Avg rate', render: (r) => money(r.avgRate), sortValue: (r) => r.avgRate, align: 'right' },
              { key: 'rpm', header: 'Avg $/mi', render: (r) => `$${r.avgRpm.toFixed(2)}`, sortValue: (r) => r.avgRpm, align: 'right' },
              { key: 'ontime', header: 'On-time', render: (r) => `${r.onTime}%`, sortValue: (r) => r.onTime, align: 'right' },
            ]}
          />
        </Card>
      )}
    </>
  )
}
