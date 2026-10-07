import { useDemo } from '@/store/DemoStore'
import { usePortalActor } from '@/store/hooks'
import { addCarrierDocument } from '@/services/commands'
import { PageHeader } from '@/components/ui/PageHeader'
import { DocumentCenter } from '@/features/shared/DocumentCenter'

export function PortalDocuments() {
  const { state, update } = useDemo()
  const actor = usePortalActor()
  const docs = state.documents.filter((d) => d.carrierId === actor.carrier.id && (actor.role === 'carrier' || d.driverId === actor.driver?.id))
  return (
    <>
      <PageHeader title="Document Center" description="Keep insurance, authority, truck and driver documents current. We’ll remind you before anything expires." />
      <DocumentCenter
        documents={docs}
        warnDays={state.settings.documentExpiryWarningDays}
        mode="portal"
        carriers={state.carriers}
        trucks={actor.role === 'carrier' ? state.trucks : []}
        drivers={actor.role === 'carrier' ? state.drivers : state.drivers.filter((d) => d.id === actor.driver?.id)}
        carrierId={actor.carrier.id}
        canUpload
        onUpload={(doc) => update((s) => addCarrierDocument(s, doc))}
      />
    </>
  )
}
