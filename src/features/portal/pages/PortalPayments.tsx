import { Banknote, CalendarClock, CircleDollarSign, Landmark, Wallet } from 'lucide-react'
import { useDemo } from '@/store/DemoStore'
import { usePortalActor } from '@/store/hooks'
import { Card, CardHeader, StatCard } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Feedback'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { money } from '@/lib/format'
import { paymentColumns } from '@/features/shared/finance'

export function PortalPayments() {
  const { state } = useDemo()
  const actor = usePortalActor()
  const toast = useToast()
  const payments = state.payments.filter((p) => p.carrierId === actor.carrier.id)
  const sum = (pred: (p: (typeof payments)[number]) => boolean) => payments.filter(pred).reduce((s, p) => s + p.amount, 0)

  return (
    <>
      <PageHeader title="Payments" description="Carrier payouts, broker payments and dispatch fees for your account." />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Paid out to you" value={money(sum((p) => p.kind === 'carrier-payout' && p.status === 'completed'))} icon={<Wallet className="size-5" />} tone="green" />
        <StatCard label="Processing / scheduled" value={money(sum((p) => p.kind === 'carrier-payout' && p.status !== 'completed'))} icon={<CalendarClock className="size-5" />} tone="amber" />
        <StatCard label="Dispatch fees paid" value={money(sum((p) => p.kind === 'dispatch-fee'))} icon={<CircleDollarSign className="size-5" />} tone="violet" />
        <StatCard label="Broker payments received" value={money(sum((p) => p.kind === 'broker-payment'))} icon={<Banknote className="size-5" />} tone="blue" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_320px] [&>*]:min-w-0">
        <Card padded={false}>
          <DataTable
            columns={paymentColumns(state)}
            rows={payments}
            rowKey={(p) => p.id}
            initialSort={{ key: 'date', dir: 'desc' }}
            mobileAside={(p) => <StatusBadge kind="payment" value={p.status} size="sm" />}
            empty={<EmptyState icon={<Wallet className="size-7" />} title="No payments yet" />}
          />
        </Card>
        <Card>
          <CardHeader title="Payout method" icon={<Landmark className="size-4" />} />
          <div className="rounded-xl bg-navy-900 p-4 text-white">
            <p className="text-xs text-navy-300">ACH · Checking</p>
            <p className="mt-1 font-mono text-lg">•••• •••• 4417</p>
            <p className="mt-3 text-xs text-navy-300">Sample Community Bank (demo)</p>
          </div>
          <p className="mt-3 text-xs text-road-500">Production: bank details are verified and tokenized through the approved payment processor (e.g. Stripe). Never stored in plain text.</p>
          <Button variant="outline" size="sm" className="mt-4" block onClick={() => toast({ title: 'Update payout method', description: 'Would open the secure Stripe onboarding flow (not connected in demo).', tone: 'info' })}>
            Update payout method
          </Button>
        </Card>
      </div>
    </>
  )
}
