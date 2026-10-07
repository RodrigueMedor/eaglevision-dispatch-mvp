import { useDemo } from '@/store/DemoStore'
import { usePortalActor } from '@/store/hooks'
import { createThread, markThreadRead, sendMessage } from '@/services/commands'
import { PageHeader } from '@/components/ui/PageHeader'
import { MessageCenter } from '@/features/shared/MessageCenter'

export function PortalMessages() {
  const { state, update } = useDemo()
  const actor = usePortalActor()
  const threads = state.threads.filter((t) => t.carrierId === actor.carrier.id && (actor.role === 'carrier' || !t.loadId || state.loads.find((l) => l.id === t.loadId)?.driverId === actor.driver?.id))
  return (
    <>
      <PageHeader title="Messages" description="Talk to your dispatcher. Load conversations keep everything about a shipment in one place." className="mb-4" />
      <MessageCenter
        threads={threads}
        side="carrier"
        actorName={actor.name}
        carriers={state.carriers}
        carrierId={actor.carrier.id}
        channels={['in-app']}
        canSend
        onSend={(id, text, channel) => update((s) => sendMessage(s, id, text, actor.name, actor.role, channel, 'carrier'))}
        onCreate={(cid, subject, text, channel) => {
          const res = createThread(state, cid, subject, text, actor.name, actor.role, channel, 'carrier')
          update((s) => ({ ...s, threads: [res.state.threads[0]!, ...s.threads] }))
          return res.id
        }}
        onRead={(id) => update((s) => markThreadRead(s, id, 'carrier'))}
      />
    </>
  )
}
