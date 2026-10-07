import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CircleCheck, Download, MessageSquare, Package, Play, Truck, Upload, X } from 'lucide-react'
import type { LoadDocumentKind, LoadStatus } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { usePortalActor } from '@/store/hooks'
import { addLoadDocument, declineLoad, setLoadStatus } from '@/services/commands'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState } from '@/components/ui/Feedback'
import { useToast } from '@/components/ui/Toast'
import { LoadDetailView } from '@/features/shared/LoadDetailView'
import { LOAD_DOC_LABEL, UploadLoadDocModal } from '@/features/shared/UploadLoadDocModal'

const NEXT_ACTION: Partial<Record<LoadStatus, { to: LoadStatus; label: string; icon: typeof Play; note: string }>> = {
  dispatched: { to: 'pickup', label: 'Confirm pickup', icon: Package, note: 'Driver confirmed pickup' },
  pickup: { to: 'in-transit', label: 'Start trip', icon: Play, note: 'Departed shipper' },
  'in-transit': { to: 'delivered', label: 'Mark delivered', icon: CircleCheck, note: 'Delivered — awaiting POD' },
}

const UPLOAD_KINDS: LoadDocumentKind[] = ['pod', 'bol', 'lumper', 'other']

export function PortalLoadDetail() {
  const { id = '' } = useParams()
  const { state, update } = useDemo()
  const actor = usePortalActor()
  const toast = useToast()
  const [podOpen, setPodOpen] = useState(false)
  const load = state.loads.find((l) => l.id === id && l.carrierId === actor.carrier.id && (actor.role === 'carrier' || l.driverId === actor.driver?.id))

  if (!load) {
    return <EmptyState icon={<Package className="size-7" />} title="Load not found" description="This load is not assigned to your account." action={<Button to="/portal/loads">Back to loads</Button>} />
  }

  const by = actor.name
  const next = NEXT_ACTION[load.status]
  const rateCon = load.documents.find((d) => d.kind === 'rate-con')

  const upload = (kind: LoadDocumentKind, name: string) => {
    update((s) => addLoadDocument(s, load.id, kind, name, by))
    toast({ title: `${LOAD_DOC_LABEL[kind]} uploaded`, description: kind === 'pod' ? 'Load marked POD Received — accounting notified.' : `Attached to ${load.id}.` })
  }

  const actions = (
    <>
      {load.status === 'review' && actor.role === 'carrier' && (
        <>
          <Button
            variant="success"
            icon={<CircleCheck className="size-4" />}
            onClick={() => {
              update((s) => setLoadStatus(s, load.id, 'approved', by, 'Load accepted by carrier'))
              toast({ title: 'Load accepted', description: 'Your dispatcher will send the rate confirmation and dispatch sheet.' })
            }}
          >
            Accept load
          </Button>
          <Button
            variant="outline"
            icon={<X className="size-4" />}
            onClick={() => {
              update((s) => declineLoad(s, load.id, by))
              toast({ title: 'Load declined', description: 'Your dispatcher has been notified.', tone: 'info' })
            }}
          >
            Decline
          </Button>
        </>
      )}
      {next && (
        <Button
          variant="primary"
          icon={<next.icon className="size-4" />}
          onClick={() => {
            update((s) => setLoadStatus(s, load.id, next.to, by, next.note))
            toast({ title: `Status updated: ${next.label}`, description: 'Dispatch and the broker are notified automatically.' })
          }}
        >
          {next.label}
        </Button>
      )}
      {(load.status === 'delivered' || load.status === 'in-transit') && (
        <Button variant="accent" icon={<Upload className="size-4" />} onClick={() => setPodOpen(true)}>
          Upload POD
        </Button>
      )}
      {rateCon && (
        <Button variant="outline" icon={<Download className="size-4" />} onClick={() => toast({ title: `Downloading ${rateCon.name}`, description: 'Demo — no real file.', tone: 'info' })}>
          Rate Confirmation
        </Button>
      )}
      <Button to="/portal/messages" variant="ghost" icon={<MessageSquare className="size-4" />}>
        Message dispatch
      </Button>
    </>
  )

  const banner =
    load.status === 'review' ? (
      <Alert tone="info" title="Load offer — your approval is needed">
        Your dispatcher matched this load to your truck. Review the rate and appointments, then accept or decline. Nothing is booked without your OK.
      </Alert>
    ) : load.status === 'approved' ? (
      <Alert tone="info" title="Accepted — waiting for dispatch">Your dispatcher is confirming the rate confirmation with the broker and will send the dispatch sheet.</Alert>
    ) : load.status === 'delivered' ? (
      <Alert tone="warning" title="POD needed" action={<Button size="sm" variant="primary" icon={<Upload className="size-4" />} onClick={() => setPodOpen(true)}>Upload POD</Button>}>
        Upload the signed proof of delivery so we can invoice the broker and get you paid.
      </Alert>
    ) : load.status === 'dispatched' ? (
      <Alert tone="info" title="You’re dispatched" action={<span className="inline-flex items-center gap-1 text-xs font-semibold"><Truck className="size-4" /> Upload BOL at pickup</span>}>
        Head to {load.pickup.facility}. Upload the BOL once loaded to confirm pickup automatically.
      </Alert>
    ) : null

  return (
    <>
      <Button to="/portal/loads" variant="ghost" size="sm" className="mb-3 -ml-2">
        ← All loads
      </Button>
      <LoadDetailView
        state={state}
        load={load}
        headerActions={actions}
        banner={banner}
        feePct={state.settings.dispatchFeePct}
        showFinance={actor.can('finance.view')}
        showBrokerContact={actor.role === 'carrier'}
        uploadKinds={UPLOAD_KINDS}
        onUpload={upload}
      />
      {podOpen && <UploadLoadDocModal open onClose={() => setPodOpen(false)} loadId={load.id} initialKind="pod" kinds={UPLOAD_KINDS} onUpload={upload} />}
    </>
  )
}
