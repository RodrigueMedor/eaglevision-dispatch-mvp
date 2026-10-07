import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { addCarrierDocument, reviewDocument } from '@/services/commands'
import { PageHeader } from '@/components/ui/PageHeader'
import { DocumentCenter } from '@/features/shared/DocumentCenter'

export function DocumentsPage() {
  const { state, update } = useDemo()
  const actor = useStaffActor()
  return (
    <>
      <PageHeader title="Documents" description="Review uploads and track expirations across all carriers. Expiring documents trigger automatic email reminders." />
      <DocumentCenter
        documents={state.documents}
        warnDays={state.settings.documentExpiryWarningDays}
        mode="admin"
        carriers={state.carriers}
        trucks={state.trucks}
        drivers={state.drivers}
        canUpload
        canReview={actor.can('documents.review')}
        onUpload={(doc) => update((s) => addCarrierDocument(s, doc))}
        onReview={(id, review) => update((s) => reviewDocument(s, id, review))}
      />
    </>
  )
}
