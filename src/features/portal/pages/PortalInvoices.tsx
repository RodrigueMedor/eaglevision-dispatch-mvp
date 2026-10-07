import { Receipt } from 'lucide-react'
import { useDemo } from '@/store/DemoStore'
import { usePortalActor } from '@/store/hooks'
import { invoiceTotals } from '@/services/selectors'
import { Card, StatCard } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import { Alert, EmptyState } from '@/components/ui/Feedback'
import { PageHeader } from '@/components/ui/PageHeader'
import { money } from '@/lib/format'
import { InvoiceDetailModal, invoiceColumns, useInvoiceModal } from '@/features/shared/finance'

export function PortalInvoices() {
  const { state } = useDemo()
  const actor = usePortalActor()
  const [open, setOpen] = useInvoiceModal()
  const invoices = state.invoices.filter((i) => i.carrierId === actor.carrier.id)
  const all = invoiceTotals(invoices)
  const outstanding = invoiceTotals(invoices.filter((i) => i.status !== 'paid'))

  return (
    <>
      <PageHeader title="Invoices" description="Broker invoices for your loads, with the dispatch fee and your net on every line." />
      <Alert tone="demo" className="mb-5" title="Sample fee values">
        Dispatch fee shown at a sample {state.settings.dispatchFeePct}% — configurable by the client. Example: $2,500 gross → $75 fee → $2,425 carrier net.
      </Alert>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Gross invoiced" value={money(all.gross)} icon={<Receipt className="size-5" />} />
        <StatCard label="Dispatch fees" value={money(all.fees)} icon={<Receipt className="size-5" />} tone="violet" />
        <StatCard label="Carrier net" value={money(all.net)} icon={<Receipt className="size-5" />} tone="green" />
        <StatCard label="Outstanding net" value={money(outstanding.net)} icon={<Receipt className="size-5" />} tone="amber" />
      </div>
      <Card padded={false}>
        <DataTable
          columns={invoiceColumns(state)}
          rows={invoices}
          rowKey={(i) => i.id}
          onRowClick={setOpen}
          initialSort={{ key: 'issued', dir: 'desc' }}
          mobileAside={(i) => <StatusBadge kind="invoice" value={i.status} size="sm" />}
          empty={<EmptyState icon={<Receipt className="size-7" />} title="No invoices yet" description="Invoices are created when a POD is received." />}
        />
      </Card>
      {open && <InvoiceDetailModal invoice={open} state={state} onClose={() => setOpen(null)} />}
    </>
  )
}
