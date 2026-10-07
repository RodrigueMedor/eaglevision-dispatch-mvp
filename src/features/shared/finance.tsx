import { useState, type ReactNode } from 'react'
import { Download, Receipt } from 'lucide-react'
import type { DemoState, Invoice, Payment } from '@/data/types'
import type { Column } from '@/components/ui/DataTable'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DescriptionList } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { carrierName } from '@/services/selectors'
import { feeBreakdown } from '@/lib/fees'
import { date, moneyCents } from '@/lib/format'
import { FeeBreakdownList } from './LoadBits'

export const PAYMENT_KIND_LABEL: Record<Payment['kind'], string> = {
  'broker-payment': 'Broker payment',
  'dispatch-fee': 'Dispatch fee',
  'carrier-payout': 'Carrier payout',
}

export function invoiceColumns(state: DemoState, opts: { showCarrier?: boolean; actions?: (inv: Invoice) => ReactNode } = {}): Column<Invoice>[] {
  return [
    { key: 'id', header: 'Invoice #', render: (i) => <span className="font-semibold">{i.id}</span>, sortValue: (i) => i.id },
    { key: 'load', header: 'Load', render: (i) => i.loadId, sortValue: (i) => i.loadId },
    ...(opts.showCarrier ? [{ key: 'carrier', header: 'Carrier', render: (i: Invoice) => carrierName(state, i.carrierId), sortValue: (i: Invoice) => carrierName(state, i.carrierId), hideBelow: 'lg' as const }] : []),
    { key: 'broker', header: 'Broker', render: (i) => i.brokerName, hideBelow: 'xl' },
    { key: 'issued', header: 'Issued', render: (i) => date(i.issuedAt), sortValue: (i) => i.issuedAt, hideBelow: 'md' },
    { key: 'due', header: 'Due', render: (i) => <span className={i.status === 'overdue' ? 'font-semibold text-red-600' : ''}>{date(i.dueAt)}</span>, sortValue: (i) => i.dueAt },
    { key: 'gross', header: 'Gross', render: (i) => moneyCents(i.grossRate), sortValue: (i) => i.grossRate, align: 'right' },
    { key: 'fee', header: 'Fee', render: (i) => <span className="text-road-600">{moneyCents(feeBreakdown(i.grossRate, i.feePct).fee)} <span className="text-xs">({i.feePct}%)</span></span>, align: 'right', hideBelow: 'md' },
    { key: 'net', header: 'Carrier Net', render: (i) => <span className="font-semibold">{moneyCents(feeBreakdown(i.grossRate, i.feePct).net)}</span>, align: 'right' },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge kind="invoice" value={i.status} size="sm" />, sortValue: (i) => i.status },
    ...(opts.actions ? [{ key: 'actions', header: <span className="sr-only">Actions</span>, align: 'right' as const, render: (i: Invoice) => <div onClick={(e) => e.stopPropagation()}>{opts.actions!(i)}</div> }] : []),
  ]
}

export function paymentColumns(state: DemoState, showCarrier = false): Column<Payment>[] {
  return [
    { key: 'date', header: 'Date', render: (p) => date(p.date), sortValue: (p) => p.date },
    { key: 'ref', header: 'Reference', render: (p) => <span className="font-mono text-xs">{p.reference}</span> },
    { key: 'invoice', header: 'Invoice', render: (p) => p.invoiceId, hideBelow: 'md' },
    ...(showCarrier ? [{ key: 'carrier', header: 'Carrier', render: (p: Payment) => carrierName(state, p.carrierId), hideBelow: 'lg' as const }] : []),
    { key: 'kind', header: 'Type', render: (p) => <Badge tone={p.kind === 'dispatch-fee' ? 'violet' : p.kind === 'carrier-payout' ? 'success' : 'info'} size="sm">{PAYMENT_KIND_LABEL[p.kind]}</Badge>, sortValue: (p) => p.kind },
    { key: 'method', header: 'Method', render: (p) => p.method, hideBelow: 'lg' },
    { key: 'amount', header: 'Amount', render: (p) => <span className="font-semibold">{moneyCents(p.amount)}</span>, sortValue: (p) => p.amount, align: 'right' },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge kind="payment" value={p.status} size="sm" />, sortValue: (p) => p.status },
  ]
}

export function InvoiceDetailModal({ invoice, state, onClose, footer }: { invoice: Invoice; state: DemoState; onClose: () => void; footer?: ReactNode }) {
  const toast = useToast()
  const load = state.loads.find((l) => l.id === invoice.loadId)
  const payments = state.payments.filter((p) => p.invoiceId === invoice.id)
  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`Invoice ${invoice.id}`}
      description={`${invoice.loadId} · ${carrierName(state, invoice.carrierId)}`}
      footer={
        <>
          <Button variant="outline" icon={<Download className="size-4" />} onClick={() => toast({ title: `Downloading ${invoice.id}.pdf`, description: 'Demo — no real file.', tone: 'info' })}>
            Download PDF
          </Button>
          {footer}
        </>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Receipt className="size-5 text-amber-600" />
            <StatusBadge kind="invoice" value={invoice.status} />
          </div>
          <DescriptionList
            columns={1}
            items={[
              { label: 'Bill to (broker)', value: invoice.brokerName },
              { label: 'Lane', value: load ? `${load.pickup.city}, ${load.pickup.state} → ${load.delivery.city}, ${load.delivery.state}` : '—' },
              { label: 'Issued', value: date(invoice.issuedAt) },
              { label: 'Due', value: date(invoice.dueAt) },
              { label: 'Paid', value: invoice.paidAt ? date(invoice.paidAt) : '—' },
            ]}
          />
        </div>
        <div>
          <FeeBreakdownList gross={invoice.grossRate} feePct={invoice.feePct} />
          {payments.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-navy-900">Payments</p>
              <ul className="space-y-1.5 text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg bg-road-50 px-3 py-2">
                    <span>{PAYMENT_KIND_LABEL[p.kind]}</span>
                    <span className="flex items-center gap-2 font-semibold">
                      {moneyCents(p.amount)} <StatusBadge kind="payment" value={p.status} size="sm" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

/** Small hook for the "open invoice" modal pattern. */
export function useInvoiceModal() {
  return useState<Invoice | null>(null)
}
