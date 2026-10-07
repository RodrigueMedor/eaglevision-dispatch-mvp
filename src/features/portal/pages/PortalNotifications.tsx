import { useState } from 'react'
import { CheckCheck } from 'lucide-react'
import type { NotificationKind } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { usePortalActor } from '@/store/hooks'
import { markNotificationRead, markNotificationsRead } from '@/services/commands'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Toggle } from '@/components/ui/Form'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { NOTIFICATION_META, NotificationList } from '@/features/shared/NotificationList'

const PREF_KINDS: NotificationKind[] = ['load-assigned', 'pickup-reminder', 'delivery-reminder', 'missing-pod', 'document-expiring', 'payment-received']

export function PortalNotifications() {
  const { state, update } = useDemo()
  const actor = usePortalActor()
  const toast = useToast()
  const [tab, setTab] = useState('all')
  const [prefs, setPrefs] = useState<Record<string, { sms: boolean; email: boolean }>>(() =>
    Object.fromEntries(PREF_KINDS.map((k) => [k, { sms: state.settings.notificationChannels[k].includes('sms'), email: state.settings.notificationChannels[k].includes('email') }])),
  )
  const items = state.notifications.filter((n) => n.audience === 'carrier' && n.carrierId === actor.carrier.id)
  const shown = tab === 'unread' ? items.filter((n) => !n.read) : items

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Load, document and payment alerts. Delivered in-app, by SMS and by email."
        actions={
          <Button variant="outline" icon={<CheckCheck className="size-4" />} onClick={() => update((s) => markNotificationsRead(s, 'carrier', actor.carrier.id))}>
            Mark all read
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px] [&>*]:min-w-0">
        <Card padded={false}>
          <div className="px-4 pt-3">
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={[
                { id: 'all', label: 'All', count: items.length },
                { id: 'unread', label: 'Unread', count: items.filter((n) => !n.read).length },
              ]}
            />
          </div>
          <NotificationList items={shown} onOpen={(id) => update((s) => markNotificationRead(s, id))} />
        </Card>
        <Card className="h-fit">
          <CardHeader title="Notification preferences" description="In-app alerts are always on." />
          <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-x-4 text-[11px] font-semibold uppercase tracking-wider text-road-500">
            <span />
            <span>SMS</span>
            <span>Email</span>
          </div>
          <ul className="space-y-3">
            {PREF_KINDS.map((k) => (
              <li key={k} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4">
                <span className="text-sm font-medium text-navy-900">{NOTIFICATION_META[k].label}</span>
                <Toggle checked={prefs[k]!.sms} onChange={(v) => setPrefs((p) => ({ ...p, [k]: { ...p[k]!, sms: v } }))} />
                <Toggle checked={prefs[k]!.email} onChange={(v) => setPrefs((p) => ({ ...p, [k]: { ...p[k]!, email: v } }))} />
              </li>
            ))}
          </ul>
          <Button size="sm" className="mt-5" block onClick={() => toast({ title: 'Preferences saved', description: 'SMS via Twilio · email via transactional provider (simulated).' })}>
            Save preferences
          </Button>
        </Card>
      </div>
    </>
  )
}
