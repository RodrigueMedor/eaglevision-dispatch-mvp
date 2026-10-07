import { useState } from 'react'
import { BellRing, CircleCheck, Receipt, Send } from 'lucide-react'
import type { Invoice, InvoiceStatus } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { markInvoicePaid, sendInvoice, updateInvoiceFee } from '@/services/commands'
import { invoiceTotals } from '@/services/selectors'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, StatCard } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Feedback'
import { Input } from '@/components/ui/Form'
import { FilterBar, FilterSelect, PageHeader, SearchInput } from '@/components/ui/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { money } from '@/lib/format'
import { INVOICE_STATUS } from '@/lib/status'
import { FeeBreakdownList } from '@/features/shared/LoadBits'
import { InvoiceDetailModal, invoiceColumns } from '@/features/shared/finance'

export function InvoicesPage() {
  const { state, update } = useDemo()
  const actor = useStaffActor()
  const toast = useToast()
  const [tab, setTab] = useState<'all' | InvoiceStatus>('all')
  const [q, setQ] = useState('')
  const [carrier, setCarrier] = useState('')
  const [open, setOpen] = useState<Invoice | null>(null)
  const [example, setExample] = useState({ gross: '2500', pct: String(state.settings.dispatchFeePct) })
  const canManage = actor.can('finance.manage')
  const by = actor.user.name

  const rows = state.invoices.filter((i) => (tab === 'all' || i.status === tab) && (!carrier || i.carrierId === carrier) && (!q || `${i.id} ${i.loadId} ${i.brokerName}`.toLowerCase().includes(q.toLowerCase())))
  const sum = (s: InvoiceStatus[]) => invoiceTotals(state.invoices.filter((i) => s.includes(i.status)))

  const actions = (i: Invoice) =>
    !canManage ? null : i.status === 'pending' ? (
      <Button size="xs" variant="primary" icon={<Send className="size-3.5" />} onClick={() => { update((s) => sendInvoice(s, i.id, by)); toast({ title: `${i.id} sent to ${i.brokerName}`, description: 'Emailed with rate con, BOL & POD attached (simulated).' }) }}>
        Send
      </Button>
    ) : i.status === 'invoiced' || i.status === 'overdue' ? (
      <div className="flex justify-end gap-1">
        {i.status === 'overdue' && (
          <Button size="xs" variant="ghost" icon={<BellRing className="size-3.5" />} onClick={() => toast({ title: 'Payment reminder sent', description: `${i.brokerName} reminded by email (simulated).`, tone: 'info' })}>
            Remind
          </Button>
        )}
        <Button size="xs" variant="success" icon={<CircleCheck className="size-3.5" />} onClick={() => { update((s) => markInvoicePaid(s, i.id, by)); toast({ title: `${i.id} marked paid`, description: 'Dispatch fee collected, carrier payout processing.' }) }}>
          Mark paid
        </Button>
      </div>
    ) : null

  return (
    <>
      <PageHeader title="Invoices" description="Broker invoices and dispatch fees per load. Fee percentages are configurable sample values." />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pending (ready to send)" value={money(sum(['pending']).gross)} hint={`${state.invoices.filter((i) => i.status === 'pending').length} invoices`} icon={<Receipt className="size-5" />} />
        <StatCard label="Invoiced (awaiting payment)" value={money(sum(['invoiced']).gross)} icon={<Send className="size-5" />} tone="blue" />
        <StatCard label="Overdue" value={money(sum(['overdue']).gross)} icon={<BellRing className="size-5" />} tone="red" />
        <StatCard label="Dispatch fees collected" value={money(sum(['paid']).fees)} icon={<CircleCheck className="size-5" />} tone="green" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px] [&>*]:min-w-0">
        <Card padded={false}>
          <div className="space-y-3 p-4">
            <Tabs value={tab} onChange={(v) => setTab(v as typeof tab)} tabs={[{ id: 'all', label: 'All', count: state.invoices.length }, ...(Object.keys(INVOICE_STATUS) as InvoiceStatus[]).map((s) => ({ id: s, label: INVOICE_STATUS[s].label, count: state.invoices.filter((i) => i.status === s).length }))]} />
            <FilterBar>
              <SearchInput value={q} onChange={setQ} placeholder="Invoice, load or broker…" className="sm:w-64" />
              <FilterSelect label="Carrier" value={carrier} onChange={setCarrier} options={state.carriers.map((c) => ({ value: c.id, label: c.legalName }))} />
            </FilterBar>
          </div>
          <DataTable
            dense
            columns={invoiceColumns(state, { showCarrier: true, actions })}
            rows={rows}
            rowKey={(i) => i.id}
            onRowClick={setOpen}
            initialSort={{ key: 'issued', dir: 'desc' }}
            mobileAside={(i) => <StatusBadge kind="invoice" value={i.status} size="sm" />}
            empty={<EmptyState icon={<Receipt className="size-7" />} title="No invoices" />}
          />
        </Card>
        <Card className="h-fit">
          <CardHeader title="Dispatch fee calculator" description="Configurable sample numbers" />
          <div className="mb-4 grid grid-cols-2 gap-3">
            <Input label="Gross rate" type="number" leading="$" value={example.gross} onChange={(e) => setExample({ ...example, gross: e.target.value })} />
            <Input label="Fee %" type="number" step="0.5" value={example.pct} onChange={(e) => setExample({ ...example, pct: e.target.value })} />
          </div>
          <FeeBreakdownList gross={Number(example.gross) || 0} feePct={Number(example.pct) || 0} />
        </Card>
      </div>
      {open && (
        <InvoiceDetailModal
          invoice={state.invoices.find((i) => i.id === open.id) ?? open}
          state={state}
          onClose={() => setOpen(null)}
          footer={
            canManage &&
            open.status !== 'paid' && (
              <FeeEditor
                pct={open.feePct}
                onSave={(pct) => {
                  update((s) => updateInvoiceFee(s, open.id, pct))
                  setOpen({ ...open, feePct: pct })
                  toast({ title: `Fee set to ${pct}% on ${open.id}` })
                }}
              />
            )
          }
        />
      )}
    </>
  )
}

function FeeEditor({ pct, onSave }: { pct: number; onSave: (pct: number) => void }) {
  const [v, setV] = useState(String(pct))
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-road-600" htmlFor="fee-edit">
        Fee %
      </label>
      <input id="fee-edit" type="number" step="0.5" min={0} max={30} value={v} onChange={(e) => setV(e.target.value)} className="h-10 w-20 rounded-lg border border-road-300 px-2 text-sm" />
      <Button variant="primary" onClick={() => onSave(Number(v) || 0)}>
        Apply
      </Button>
    </div>
  )
}
