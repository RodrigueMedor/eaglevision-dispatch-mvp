import { Link } from 'react-router-dom'
import { ArrowRight, CheckCheck, CircleDollarSign, FileWarning, MessageSquare, Package, Phone, Receipt, TriangleAlert, Truck, Upload } from 'lucide-react'
import { useDemo } from '@/store/DemoStore'
import { usePortalActor } from '@/store/hooks'
import { carrierKpis, documentStatus, isActiveLoad, loadsForPortal, userName } from '@/services/selectors'
import { Card, CardHeader, StatCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar, EmptyState } from '@/components/ui/Feedback'
import { StatusBadge } from '@/components/ui/Badge'
import { BarChartView, ChartCard } from '@/components/charts/Charts'
import { money, moneyCents, relative, shortDate, time } from '@/lib/format'
import { feeBreakdown } from '@/lib/fees'
import { LoadCard } from '../LoadCard'

export function PortalDashboard() {
  const { state } = useDemo()
  const actor = usePortalActor()
  const k = carrierKpis(state, actor.carrier.id)
  const loads = loadsForPortal(state)
  const active = loads.filter(isActiveLoad)
  const offers = loads.filter((l) => l.status === 'review')
  const needPod = loads.filter((l) => l.status === 'delivered')
  const warn = state.settings.documentExpiryWarningDays
  const expiring = state.documents.filter((d) => d.carrierId === actor.carrier.id && ['expiring', 'expired'].includes(documentStatus(d, warn)))
  const isDriver = actor.role === 'driver'
  const dispatcherId = actor.carrier.dispatcherId
  const thread = state.threads.filter((t) => t.carrierId === actor.carrier.id).sort((a, b) => (b.messages.at(-1)?.at ?? '').localeCompare(a.messages.at(-1)?.at ?? ''))[0]

  const upcoming = loads
    .filter((l) => ['review', 'approved', 'dispatched', 'pickup', 'in-transit'].includes(l.status))
    .flatMap((l) => [
      ...(['review', 'approved', 'dispatched'].includes(l.status) ? [{ id: `${l.id}-pu`, load: l, kind: 'Pickup' as const, at: l.pickup.appointment, place: `${l.pickup.facility}, ${l.pickup.city}, ${l.pickup.state}` }] : []),
      { id: `${l.id}-del`, load: l, kind: 'Delivery' as const, at: l.delivery.appointment, place: `${l.delivery.facility}, ${l.delivery.city}, ${l.delivery.state}` },
    ])
    .sort((a, b) => a.at.localeCompare(b.at))
    .slice(0, 5)

  const earnings = state.invoices
    .filter((i) => i.carrierId === actor.carrier.id)
    .sort((a, b) => a.issuedAt.localeCompare(b.issuedAt))
    .map((i) => {
      const f = feeBreakdown(i.grossRate, i.feePct)
      return { load: i.loadId.replace('EVD-', '#'), net: f.net, fee: f.fee }
    })

  const firstName = actor.name.split(' ')[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-road-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">Welcome back, {firstName}</h1>
          <p className="text-sm text-road-500">
            {actor.carrier.legalName} · {isDriver ? 'Driver' : 'Owner-Operator'} account
          </p>
        </div>
        <div className="flex gap-2">
          <Button to="/portal/loads" variant="outline" icon={<Package className="size-4" />}>
            My loads
          </Button>
          {needPod[0] && (
            <Button to={`/portal/loads/${needPod[0].id}`} variant="accent" icon={<Upload className="size-4" />}>
              Upload POD
            </Button>
          )}
        </div>
      </div>

      {isDriver ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="My active loads" value={active.length} icon={<Package className="size-5" />} to="/portal/loads" />
          <StatCard label="Next stop" value={upcoming[0] ? shortDate(upcoming[0].at) : '—'} hint={upcoming[0]?.place} icon={<Truck className="size-5" />} tone="blue" />
          <StatCard label="PODs to upload" value={needPod.length} icon={<Upload className="size-5" />} tone="amber" />
          <StatCard label="Unread messages" value={state.threads.filter((t) => t.carrierId === actor.carrier.id && t.unreadForCarrier).length} icon={<MessageSquare className="size-5" />} tone="violet" to="/portal/messages" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Active Loads" value={k.activeLoads} icon={<Package className="size-5" />} to="/portal/loads" />
          <StatCard label="Available Trucks" value={`${k.availableTrucks}/${k.totalTrucks}`} icon={<Truck className="size-5" />} tone="green" to="/portal/trucks" />
          <StatCard label="Documents Expiring" value={k.documentsExpiring} icon={<FileWarning className="size-5" />} tone={k.documentsExpiring ? 'red' : 'green'} to="/portal/documents" />
          <StatCard label="Pending Payments" value={money(k.pendingPayments)} hint={`${k.pendingPaymentCount} invoices`} icon={<CircleDollarSign className="size-5" />} tone="amber" to="/portal/payments" />
          <StatCard label="Completed Loads" value={k.completedLoads} icon={<CheckCheck className="size-5" />} tone="blue" to="/portal/loads" />
          <StatCard label="Dispatch Fees" value={money(k.dispatchFees)} hint="Sample fee rate" icon={<Receipt className="size-5" />} tone="violet" to="/portal/invoices" />
        </div>
      )}

      {(offers.length > 0 || needPod.length > 0 || expiring.length > 0) && (
        <Card>
          <CardHeader title="Action needed" icon={<TriangleAlert className="size-4" />} />
          <ul className="divide-y divide-road-100">
            {offers.map((l) => (
              <ActionRow key={l.id} to={`/portal/loads/${l.id}`} tone="violet" title={`Review load offer ${l.id}`} body={`${l.pickup.city}, ${l.pickup.state} → ${l.delivery.city}, ${l.delivery.state} · ${money(l.rate)}`} cta="Review" />
            ))}
            {needPod.map((l) => (
              <ActionRow key={l.id} to={`/portal/loads/${l.id}`} tone="amber" title={`Upload POD for ${l.id}`} body={`Delivered ${relative(l.events.at(-1)!.at)} — invoice is waiting on the signed POD`} cta="Upload" />
            ))}
            {!isDriver &&
              expiring.map((d) => (
                <ActionRow key={d.id} to="/portal/documents" tone="red" title={`${d.name} ${documentStatus(d, warn) === 'expired' ? 'expired' : 'expiring soon'}`} body={`${d.subject} · ${shortDate(d.expiresAt)}`} cta="Renew" />
              ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr] [&>*]:min-w-0">
        <div className="space-y-6">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-navy-900">Current loads</h2>
              <Link to="/portal/loads" className="text-sm font-semibold text-navy-700 hover:text-amber-700">
                View all →
              </Link>
            </div>
            {active.length === 0 ? (
              <Card>
                <EmptyState icon={<Package className="size-7" />} title="No active loads" description="Your dispatcher will send load offers that match your preferences." />
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {active.map((l) => (
                  <LoadCard key={l.id} load={l} state={state} to={`/portal/loads/${l.id}`} />
                ))}
              </div>
            )}
          </section>
          {!isDriver && earnings.length > 0 && (
            <ChartCard
              title="Recent load earnings"
              description="Carrier net vs. dispatch fee per invoiced load"
              table={{ columns: ['Load', 'Carrier net', 'Dispatch fee'], rows: earnings.map((e) => [e.load, moneyCents(e.net), moneyCents(e.fee)]) }}
            >
              <BarChartView
                data={earnings}
                xKey="load"
                stacked
                fmt={(v) => `$${Math.round(v).toLocaleString()}`}
                series={[
                  { key: 'net', label: 'Carrier net' },
                  { key: 'fee', label: 'Dispatch fee' },
                ]}
              />
            </ChartCard>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Upcoming schedule" />
            {upcoming.length === 0 ? (
              <p className="text-sm text-road-500">No scheduled stops.</p>
            ) : (
              <ol className="space-y-3">
                {upcoming.map((u) => (
                  <li key={u.id}>
                    <Link to={`/portal/loads/${u.load.id}`} className="flex gap-3 rounded-xl p-2 hover:bg-road-50">
                      <div className="w-12 shrink-0 rounded-lg bg-navy-900 py-1.5 text-center text-white">
                        <p className="text-[10px] font-semibold uppercase text-amber-400">{new Date(u.at).toLocaleDateString('en-US', { month: 'short' })}</p>
                        <p className="font-display text-lg font-bold leading-none">{new Date(u.at).getDate()}</p>
                      </div>
                      <div className="min-w-0 text-sm">
                        <p className="font-semibold text-navy-900">
                          {u.kind} · {time(u.at)}
                        </p>
                        <p className="truncate text-road-500">{u.place}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-road-400">{u.load.id}</span>
                          <StatusBadge kind="load" value={u.load.status} size="sm" />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card>
            <CardHeader title="Your dispatcher" />
            <div className="flex items-center gap-3">
              <Avatar name={userName(state, dispatcherId)} size="lg" />
              <div>
                <p className="font-semibold text-navy-900">{userName(state, dispatcherId)}</p>
                <p className="text-sm text-road-500">{state.users.find((u) => u.id === dispatcherId)?.phone}</p>
              </div>
            </div>
            {thread && (
              <Link to="/portal/messages" className="mt-4 block rounded-xl bg-road-50 p-3 text-sm hover:bg-road-100">
                <p className="text-xs font-semibold text-road-500">Latest · {thread.subject}</p>
                <p className="mt-0.5 line-clamp-2 text-navy-900">{thread.messages.at(-1)?.text}</p>
              </Link>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button to="/portal/messages" variant="primary" size="sm" icon={<MessageSquare className="size-4" />}>
                Message
              </Button>
              <a href="tel:+18005550199" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-road-300 bg-white text-sm font-semibold text-navy-900 hover:bg-road-50">
                <Phone className="size-4" /> Call
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ActionRow({ to, title, body, cta, tone }: { to: string; title: string; body: string; cta: string; tone: 'violet' | 'amber' | 'red' }) {
  const dot = { violet: 'bg-violet-500', amber: 'bg-amber-500', red: 'bg-red-500' }[tone]
  return (
    <li>
      <Link to={to} className="flex items-center gap-3 py-3 hover:bg-road-50/60">
        <span className={`size-2.5 shrink-0 rounded-full ${dot}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-navy-900">{title}</p>
          <p className="truncate text-xs text-road-500">{body}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-navy-700">
          {cta} <ArrowRight className="size-3.5" />
        </span>
      </Link>
    </li>
  )
}
