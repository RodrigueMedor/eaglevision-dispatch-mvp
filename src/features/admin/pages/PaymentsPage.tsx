import { useState } from 'react'
import { Banknote, CircleDollarSign, Download, Wallet, Landmark } from 'lucide-react'
import type { Payment } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { Card, CardHeader, StatCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import { Alert, EmptyState } from '@/components/ui/Feedback'
import { FilterBar, FilterSelect, PageHeader } from '@/components/ui/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { money } from '@/lib/format'
import { PAYMENT_STATUS } from '@/lib/status'
import { PAYMENT_KIND_LABEL, paymentColumns } from '@/features/shared/finance'

export function PaymentsPage() {
  const { state } = useDemo()
  const toast = useToast()
  const [kind, setKind] = useState<'all' | Payment['kind']>('all')
  const [status, setStatus] = useState('')
  const [carrier, setCarrier] = useState('')
  const rows = state.payments.filter((p) => (kind === 'all' || p.kind === kind) && (!status || p.status === status) && (!carrier || p.carrierId === carrier))
  const total = (k: Payment['kind']) => state.payments.filter((p) => p.kind === k && p.status === 'completed').reduce((s, p) => s + p.amount, 0)
  const pending = state.payments.filter((p) => p.status !== 'completed').reduce((s, p) => s + p.amount, 0)

  return (
    <>
      <PageHeader
        title="Payments"
        description="Broker payments received, dispatch fees collected and carrier payouts."
        actions={<Button variant="outline" icon={<Download className="size-4" />} onClick={() => toast({ title: 'Export started', description: 'payments.csv (demo) — QuickBooks sync is a planned integration.', tone: 'info' })}>Export CSV</Button>}
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Broker payments received" value={money(total('broker-payment'))} icon={<Banknote className="size-5" />} tone="blue" />
        <StatCard label="Dispatch fees collected" value={money(total('dispatch-fee'))} icon={<CircleDollarSign className="size-5" />} tone="violet" />
        <StatCard label="Carrier payouts" value={money(total('carrier-payout'))} icon={<Wallet className="size-5" />} tone="green" />
        <StatCard label="Scheduled / processing" value={money(pending)} icon={<Landmark className="size-5" />} tone="amber" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_320px] [&>*]:min-w-0">
        <Card padded={false}>
          <div className="space-y-3 p-4">
            <Tabs value={kind} onChange={(v) => setKind(v as typeof kind)} tabs={[{ id: 'all', label: 'All' }, ...(Object.keys(PAYMENT_KIND_LABEL) as Payment['kind'][]).map((k) => ({ id: k, label: PAYMENT_KIND_LABEL[k], count: state.payments.filter((p) => p.kind === k).length }))]} />
            <FilterBar>
              <FilterSelect label="Status" value={status} onChange={setStatus} options={Object.entries(PAYMENT_STATUS).map(([value, m]) => ({ value, label: m.label }))} />
              <FilterSelect label="Carrier" value={carrier} onChange={setCarrier} options={state.carriers.map((c) => ({ value: c.id, label: c.legalName }))} />
            </FilterBar>
          </div>
          <DataTable dense columns={paymentColumns(state, true)} rows={rows} rowKey={(p) => p.id} initialSort={{ key: 'date', dir: 'desc' }} mobileAside={(p) => <StatusBadge kind="payment" value={p.status} size="sm" />} empty={<EmptyState icon={<Wallet className="size-7" />} title="No payments match" />} />
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Payment status" />
            <ul className="space-y-3">
              {Object.entries(PAYMENT_STATUS).map(([s]) => {
                const items = state.payments.filter((p) => p.status === s)
                return (
                  <li key={s} className="flex items-center justify-between text-sm">
                    <StatusBadge kind="payment" value={s as Payment['status']} />
                    <span className="font-semibold text-navy-900">
                      {items.length} · {money(items.reduce((a, p) => a + p.amount, 0))}
                    </span>
                  </li>
                )
              })}
            </ul>
          </Card>
          <Alert tone="demo" title="Payments are simulated">
            Stripe (fee collection, ACH payouts) and QuickBooks (accounting sync) are shown as integration points — see Integrations.
          </Alert>
        </div>
      </div>
    </>
  )
}
