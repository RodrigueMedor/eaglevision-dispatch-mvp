import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowRightLeft, FileUp, Package, Pencil, RefreshCw, UserPlus } from 'lucide-react'
import type { LoadDocumentKind } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { addLoadDocument, addLoadNote, assignLoad, setLoadStatus, updateLoad } from '@/services/commands'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState } from '@/components/ui/Feedback'
import { useToast } from '@/components/ui/Toast'
import { LoadDetailView } from '@/features/shared/LoadDetailView'
import { LOAD_DOC_LABEL, UploadLoadDocModal } from '@/features/shared/UploadLoadDocModal'
import { LOAD_STATUS, nextLoadStatus } from '@/lib/status'
import { AssignModal, LoadFormModal, StatusModal } from '../loads/LoadModals'

const UPLOAD_KINDS: LoadDocumentKind[] = ['rate-con', 'bol', 'pod', 'lumper', 'other']

export function AdminLoadDetailPage() {
  const { id = '' } = useParams()
  const { state, update } = useDemo()
  const actor = useStaffActor()
  const toast = useToast()
  const [modal, setModal] = useState<'edit' | 'assign' | 'status' | 'ratecon' | null>(null)
  const load = state.loads.find((l) => l.id === id)

  if (!load) return <EmptyState icon={<Package className="size-7" />} title="Load not found" action={<Button to="/admin/loads">Back to loads</Button>} />

  const by = actor.user.name
  const canManage = actor.can('loads.manage')
  const next = nextLoadStatus(load.status)

  const upload = (kind: LoadDocumentKind, name: string) => {
    update((s) => addLoadDocument(s, load.id, kind, name, by))
    toast({ title: `${LOAD_DOC_LABEL[kind]} uploaded`, description: `Attached to ${load.id}. Stored in private object storage (simulated).` })
  }

  const actions = canManage ? (
    <>
      <Button variant="outline" icon={<Pencil className="size-4" />} onClick={() => setModal('edit')}>
        Edit
      </Button>
      <Button variant="outline" icon={<UserPlus className="size-4" />} onClick={() => setModal('assign')}>
        {load.carrierId ? 'Reassign' : 'Assign carrier'}
      </Button>
      <Button variant="outline" icon={<FileUp className="size-4" />} onClick={() => setModal('ratecon')}>
        Upload rate con
      </Button>
      {next && (
        <Button
          variant="accent"
          icon={<ArrowRightLeft className="size-4" />}
          onClick={() => {
            update((s) => setLoadStatus(s, load.id, next, by))
            toast({ title: `Status → ${LOAD_STATUS[next].label}`, description: `${load.id} updated. Carrier notified.` })
          }}
        >
          Mark {LOAD_STATUS[next].label}
        </Button>
      )}
      <Button variant="ghost" icon={<RefreshCw className="size-4" />} onClick={() => setModal('status')}>
        Update status
      </Button>
    </>
  ) : null

  const banner = !canManage ? (
    <Alert tone="info">Read-only view for {actor.roleLabel}. Dispatchers and admins can assign, edit and update status.</Alert>
  ) : load.status === 'opportunity' ? (
    <Alert tone="info" title="Open opportunity" action={<Button size="sm" onClick={() => setModal('assign')}>Assign carrier</Button>}>
      Match a carrier and truck to send this load for carrier review.
    </Alert>
  ) : load.status === 'delivered' ? (
    <Alert tone="warning" title="Waiting on POD">The carrier has been reminded by SMS. You can upload the POD on their behalf.</Alert>
  ) : null

  return (
    <>
      <Button to="/admin/loads" variant="ghost" size="sm" className="mb-3 -ml-2">
        ← Loads
      </Button>
      <LoadDetailView
        state={state}
        load={load}
        headerActions={actions}
        banner={banner}
        feePct={state.settings.dispatchFeePct}
        showFinance={actor.can('finance.view') || actor.can('loads.manage')}
        uploadKinds={canManage || actor.can('documents.review') ? UPLOAD_KINDS : []}
        onUpload={upload}
        onAddNote={canManage || actor.can('messages.send') ? (text) => { update((s) => addLoadNote(s, load.id, text, by)); toast({ title: 'Note added' }) } : undefined}
      />

      {modal === 'edit' && (
        <LoadFormModal
          state={state}
          load={load}
          onClose={() => setModal(null)}
          onSave={(input) => {
            update((s) => updateLoad(s, load.id, input))
            toast({ title: 'Load updated' })
            setModal(null)
          }}
        />
      )}
      {modal === 'assign' && (
        <AssignModal
          state={state}
          load={load}
          onClose={() => setModal(null)}
          onSave={(a) => {
            update((s) => assignLoad(s, load.id, a, by))
            toast({ title: 'Load assigned', description: 'Carrier notified in-app and by SMS (simulated).' })
            setModal(null)
          }}
        />
      )}
      {modal === 'status' && (
        <StatusModal
          load={load}
          onClose={() => setModal(null)}
          onSave={(status, note) => {
            update((s) => setLoadStatus(s, load.id, status, by, note))
            toast({ title: `Status → ${LOAD_STATUS[status].label}` })
            setModal(null)
          }}
        />
      )}
      {modal === 'ratecon' && <UploadLoadDocModal open onClose={() => setModal(null)} loadId={load.id} initialKind="rate-con" kinds={UPLOAD_KINDS} onUpload={upload} />}
    </>
  )
}
