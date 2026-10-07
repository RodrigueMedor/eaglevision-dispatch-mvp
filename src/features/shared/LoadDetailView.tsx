import { useState, type ReactNode } from 'react'
import { CircleDot, Download, FileText, MessageSquareText, StickyNote, Upload } from 'lucide-react'
import type { DemoState, Load, LoadDocumentKind } from '@/data/types'
import { Card, CardHeader, DescriptionList } from '@/components/ui/Card'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Form'
import { ActivityFeed, Timeline, type TimelineStep } from '@/components/ui/Timeline'
import { Stars } from '@/components/ui/Feedback'
import { useToast } from '@/components/ui/Toast'
import { carrierName, driverName, truckUnit, userName } from '@/services/selectors'
import { equipmentLabel } from '@/lib/equipment'
import { dateTime, lbs, miles, money, ratePerMile, relative } from '@/lib/format'
import { LOAD_STATUS, LOAD_TIMELINE, loadStep } from '@/lib/status'
import { FeeBreakdownList, MapPreview, RouteLine, StopCard } from './LoadBits'
import { LOAD_DOC_LABEL, UploadLoadDocModal } from './UploadLoadDocModal'

export function loadTimelineSteps(load: Load): TimelineStep[] {
  const step = loadStep(load.status)
  return LOAD_TIMELINE.map((t) => {
    const reached = step >= loadStep(t.reachedAt) && (t.key !== 'rate-con' || load.documents.some((d) => d.kind === 'rate-con') || step > loadStep('approved'))
    const event = load.events.find((e) => e.status === t.reachedAt)
    return { key: t.key, label: t.label, state: reached ? 'done' : 'upcoming', meta: reached && event ? relative(event.at) : undefined } as TimelineStep
  }).map((s, i, arr) => (s.state === 'upcoming' && (i === 0 || arr[i - 1]!.state === 'done') ? { ...s, state: 'current' } : s))
}

interface LoadDetailViewProps {
  state: DemoState
  load: Load
  /** buttons rendered in the page header */
  headerActions?: ReactNode
  /** banner area under the header (contextual next step) */
  banner?: ReactNode
  showBrokerContact?: boolean
  showFinance?: boolean
  feePct: number
  uploadKinds: LoadDocumentKind[]
  onUpload: (kind: LoadDocumentKind, name: string) => void
  onAddNote?: (text: string) => void
}

/** Load detail used by both the carrier portal and the dispatcher back office. */
export function LoadDetailView({ state, load, headerActions, banner, showBrokerContact = true, showFinance = true, feePct, uploadKinds, onUpload, onAddNote }: LoadDetailViewProps) {
  const toast = useToast()
  const [uploadKind, setUploadKind] = useState<LoadDocumentKind | null>(null)
  const [note, setNote] = useState('')

  const activity = [
    ...load.events.map((e) => ({ id: e.id, at: e.at, title: <>Status → <StatusBadge kind="load" value={e.status} size="sm" /></>, meta: `${e.by} · ${dateTime(e.at)}`, body: e.note, icon: <CircleDot className="size-4" /> })),
    ...load.notes.map((n) => ({ id: n.id, at: n.at, title: 'Note added', meta: `${n.by} · ${dateTime(n.at)}`, body: n.text, icon: <StickyNote className="size-4" /> })),
    ...load.documents.map((d) => ({ id: d.id, at: d.uploadedAt, title: `${LOAD_DOC_LABEL[d.kind]} uploaded`, meta: `${d.uploadedBy} · ${dateTime(d.uploadedAt)}`, body: undefined, icon: <FileText className="size-4" /> })),
  ].sort((a, b) => b.at.localeCompare(a.at))

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-navy-900 sm:text-[28px]">Load {load.id}</h1>
            <StatusBadge kind="load" value={load.status} />
            {load.source !== 'manual' && <Badge tone="warning">Source: {load.source}</Badge>}
          </div>
          <RouteLine load={load} className="mt-1 text-lg" />
          <p className="mt-1 text-sm text-road-500">{LOAD_STATUS[load.status].description}</p>
        </div>
        {headerActions && <div className="flex flex-wrap gap-2">{headerActions}</div>}
      </div>

      {banner}

      <Card>
        <CardHeader title="Load progress" description="Load Assigned → Rate Confirmation → Dispatched → Pickup → In Transit → Delivered → POD → Completed" />
        <Timeline steps={loadTimelineSteps(load)} />
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr] [&>*]:min-w-0">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Route & appointments" />
            <div className="grid gap-5 md:grid-cols-2 [&>*]:min-w-0">
              <div className="space-y-5">
                <StopCard kind="Pickup" stop={load.pickup} />
                <StopCard kind="Delivery" stop={load.delivery} />
              </div>
              <MapPreview load={load} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Shipment details" />
            <DescriptionList
              columns={3}
              items={[
                { label: 'Equipment', value: equipmentLabel(load.equipment) },
                { label: 'Miles', value: miles(load.miles) },
                { label: 'Rate', value: money(load.rate) },
                { label: 'Rate per mile', value: ratePerMile(load.rate, load.miles) },
                { label: 'Weight', value: lbs(load.weightLbs) },
                { label: 'Commodity', value: load.commodity },
                { label: 'Reference / PO', value: load.reference },
                { label: 'Pickup', value: dateTime(load.pickup.appointment) },
                { label: 'Delivery', value: dateTime(load.delivery.appointment) },
              ]}
            />
          </Card>

          <Card>
            <CardHeader
              title="Documents"
              description="Rate confirmation, BOL, POD and receipts"
              actions={
                uploadKinds.length > 0 && (
                  <Button size="sm" variant="outline" icon={<Upload className="size-4" />} onClick={() => setUploadKind(uploadKinds[0]!)}>
                    Upload
                  </Button>
                )
              }
            />
            {load.documents.length === 0 ? (
              <p className="rounded-xl bg-road-50 px-4 py-6 text-center text-sm text-road-500">No documents yet. The rate confirmation appears here once the load is approved.</p>
            ) : (
              <ul className="divide-y divide-road-100 rounded-xl border border-road-200">
                {load.documents.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 px-3 py-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy-900">{LOAD_DOC_LABEL[d.kind]}</p>
                      <p className="truncate text-xs text-road-500">
                        {d.name} · {d.uploadedBy} · {relative(d.uploadedAt)}
                      </p>
                    </div>
                    <Button size="xs" variant="ghost" icon={<Download className="size-3.5" />} onClick={() => toast({ title: `Downloading ${d.name}`, description: 'Demo — production uses a signed, expiring storage URL.', tone: 'info' })}>
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {uploadKinds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {uploadKinds.map((k) => (
                  <Button key={k} size="xs" variant="secondary" icon={<Upload className="size-3.5" />} onClick={() => setUploadKind(k)}>
                    {k === 'rate-con' ? 'Rate Con' : k.toUpperCase()}
                  </Button>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Activity & notes" description="Audit trail of every status change, upload and note" />
            {onAddNote && (
              <form
                className="mb-5 flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!note.trim()) return
                  onAddNote(note.trim())
                  setNote('')
                }}
              >
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note (e.g. detention approved, lumper paid)…" rows={2} aria-label="Note" />
                <div className="flex justify-end">
                  <Button size="sm" type="submit" icon={<MessageSquareText className="size-4" />} disabled={!note.trim()}>
                    Add note
                  </Button>
                </div>
              </form>
            )}
            <ActivityFeed items={activity} />
          </Card>
        </div>

        <div className="space-y-5">
          {showFinance && (
            <Card>
              <CardHeader title="Rate & dispatch fee" />
              <FeeBreakdownList gross={load.rate} feePct={state.invoices.find((i) => i.loadId === load.id)?.feePct ?? feePct} />
            </Card>
          )}
          <Card>
            <CardHeader title="Assignment" />
            <DescriptionList
              columns={1}
              items={[
                { label: 'Carrier', value: carrierName(state, load.carrierId) },
                { label: 'Truck', value: load.truckId ? `${truckUnit(state, load.truckId)} · ${equipmentLabel(load.equipment)}` : 'Not assigned' },
                { label: 'Driver', value: load.driverId ? driverName(state, load.driverId) : 'Not assigned' },
                { label: 'Dispatcher', value: load.dispatcherId ? userName(state, load.dispatcherId) : '—' },
              ]}
            />
          </Card>
          <Card>
            <CardHeader title="Broker" />
            <p className="font-semibold text-navy-900">{load.broker.name}</p>
            <p className="text-sm text-road-500">{load.broker.mcNumber}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Stars value={load.broker.rating} />
              <Badge size="sm">Pays in ~{load.broker.daysToPay} days</Badge>
            </div>
            {showBrokerContact ? (
              <DescriptionList
                className="mt-4"
                columns={1}
                items={[
                  { label: 'Contact', value: load.broker.contact },
                  { label: 'Phone', value: load.broker.phone },
                  { label: 'Email', value: load.broker.email },
                ]}
              />
            ) : (
              <p className="mt-3 rounded-lg bg-road-50 p-3 text-xs text-road-500">Broker contact details are managed by your dispatcher.</p>
            )}
          </Card>
        </div>
      </div>

      {uploadKind && <UploadLoadDocModal open onClose={() => setUploadKind(null)} loadId={load.id} initialKind={uploadKind} kinds={uploadKinds} onUpload={onUpload} />}
    </div>
  )
}
