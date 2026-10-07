import { useState } from 'react'
import { ExternalLink, KeyRound, Plug, ShieldCheck } from 'lucide-react'
import type { Integration } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { setIntegrationStatus } from '@/services/commands'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Feedback'
import { Input } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'

export function IntegrationsPage() {
  const { state, update } = useDemo()
  const actor = useStaffActor()
  const toast = useToast()
  const [cat, setCat] = useState('all')
  const [configuring, setConfiguring] = useState<Integration | null>(null)
  const categories = Array.from(new Set(state.integrations.map((i) => i.category)))
  const rows = state.integrations.filter((i) => cat === 'all' || i.category === cat)
  const canManage = actor.can('integrations.manage')

  return (
    <>
      <PageHeader title="Integrations" description="Third-party services the platform is designed to connect to. Availability depends on each provider’s API program and commercial agreement." />
      <Alert tone="demo" className="mb-5" title="Integration-ready, not live">
        Connections are simulated. DAT and Truckstop require authorized API credentials and commercial access — the Load Board uses sample data only and nothing is scraped.
        {!canManage && ' Only Super Admins can change integration credentials.'}
      </Alert>
      <Tabs className="mb-5" value={cat} onChange={setCat} tabs={[{ id: 'all', label: 'All', count: state.integrations.length }, ...categories.map((c) => ({ id: c, label: c }))]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((i) => (
          <Card key={i.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl font-display text-lg font-bold text-white" style={{ background: i.brandColor }} aria-hidden>
                  {i.name[0]}
                </span>
                <div>
                  <h3 className="font-display font-bold text-navy-900">{i.name}</h3>
                  <p className="text-xs text-road-500">{i.category}</p>
                </div>
              </div>
              <StatusBadge kind="integration" value={i.status} size="sm" />
            </div>
            <p className="mt-3 text-sm text-road-600">{i.description}</p>
            <ul className="mt-3 flex-1 space-y-1 text-sm text-navy-900">
              {i.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" /> {f}
                </li>
              ))}
            </ul>
            {i.note && <p className="mt-3 rounded-lg bg-road-50 p-2.5 text-xs text-road-600">{i.note}</p>}
            <div className="mt-4 flex gap-2">
              {i.status === 'connected' ? (
                <>
                  <Button size="sm" variant="outline" disabled={!canManage} onClick={() => setConfiguring(i)}>Configure</Button>
                  <Button size="sm" variant="ghost" disabled={!canManage} onClick={() => { update((s) => setIntegrationStatus(s, i.id, 'not-connected')); toast({ title: `${i.name} disconnected`, tone: 'info' }) }}>Disconnect</Button>
                </>
              ) : i.status === 'coming-soon' ? (
                <Button size="sm" variant="secondary" onClick={() => toast({ title: `${i.name} added to roadmap`, description: 'Planned for a future phase.', tone: 'info' })}>Notify me</Button>
              ) : (
                <Button size="sm" variant="primary" icon={i.status === 'requires-api' ? <KeyRound className="size-4" /> : <Plug className="size-4" />} disabled={!canManage} onClick={() => setConfiguring(i)}>
                  {i.status === 'requires-api' ? 'Request API access' : 'Connect'}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <ShieldCheck className="size-10 shrink-0 text-amber-600" />
          <div className="text-sm text-road-600">
            <p className="font-semibold text-navy-900">How integrations will work in production</p>
            The Spring Boot backend owns every third-party connection. API keys are stored in a secrets manager (never in the browser), calls are rate-limited and logged, and webhooks (e.g. Twilio delivery receipts, Stripe payments, DocuSign completions) update records automatically.
          </div>
        </div>
      </Card>

      {configuring && (
        <Modal
          open
          onClose={() => setConfiguring(null)}
          title={`${configuring.status === 'requires-api' ? 'Request API access' : configuring.status === 'connected' ? 'Configure' : 'Connect'} · ${configuring.name}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setConfiguring(null)}>Cancel</Button>
              <Button
                variant="accent"
                onClick={() => {
                  if (configuring.status === 'not-connected') update((s) => setIntegrationStatus(s, configuring.id, 'connected'))
                  toast({
                    title: configuring.status === 'requires-api' ? 'Access request recorded' : `${configuring.name} ${configuring.status === 'connected' ? 'settings saved' : 'connected (demo)'}`,
                    description: configuring.status === 'requires-api' ? 'Next step: commercial agreement and API credentials from the provider.' : 'Demo mode — no external calls are made.',
                  })
                  setConfiguring(null)
                }}
              >
                {configuring.status === 'requires-api' ? 'Submit request' : 'Save'}
              </Button>
            </>
          }
        >
          {configuring.status === 'requires-api' ? (
            <div className="space-y-3 text-sm text-road-600">
              <p>{configuring.note}</p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Client signs the provider’s data / API agreement</li>
                <li>Provider issues API credentials for the production environment</li>
                <li>Credentials are stored server-side; load search and import are enabled</li>
              </ol>
              <a className="inline-flex items-center gap-1 font-semibold text-navy-700" href="#" onClick={(e) => e.preventDefault()}>
                Provider developer program <ExternalLink className="size-3.5" />
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <Input label="API key / Account SID" placeholder="Stored securely on the server — demo only" />
              <Input label="Webhook URL" value={`https://api.eaglevisiondispatch.demo/webhooks/${configuring.id}`} readOnly />
              <p className="text-xs text-road-500">Do not enter real credentials in this prototype.</p>
            </div>
          )}
        </Modal>
      )}
    </>
  )
}
