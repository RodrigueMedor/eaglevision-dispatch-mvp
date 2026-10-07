import { useState } from 'react'
import { Mail, MessageSquare, Send, Smartphone } from 'lucide-react'
import type { NotificationKind } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { createThread, markNotificationRead, markThreadRead, sendMessage, sendTestNotification } from '@/services/commands'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Form'
import { FilterBar, FilterSelect, PageHeader } from '@/components/ui/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { carrierName } from '@/services/selectors'
import { MessageCenter } from '@/features/shared/MessageCenter'
import { NOTIFICATION_META, NotificationList } from '@/features/shared/NotificationList'

/** Message templates for the six core dispatch notifications (proposal §5–7). */
const TEMPLATES: { kind: NotificationKind; sms: string; email: string }[] = [
  { kind: 'load-assigned', sms: 'Eagle Vision: New load {load} {origin}→{dest}, PU {pickup}. Review in your portal: {link}', email: 'Subject: New load assigned — {load}\n\nHi {name}, a new load has been assigned to {truck}…' },
  { kind: 'pickup-reminder', sms: 'Reminder: pickup for {load} at {facility} tomorrow {time}. Reply HELP for dispatch.', email: 'Subject: Pickup reminder — {load}\n\nYour pickup appointment is tomorrow at {time}…' },
  { kind: 'delivery-reminder', sms: 'Reminder: delivery for {load} at {facility} {time}. Upload POD after delivery.', email: 'Subject: Delivery reminder — {load}\n\nYour delivery appointment is scheduled for {time}…' },
  { kind: 'missing-pod', sms: 'Action needed: upload the signed POD for {load} so we can invoice. {link}', email: 'Subject: POD needed for {load}\n\nWe have not received the signed proof of delivery…' },
  { kind: 'document-expiring', sms: 'Your {document} expires on {date}. Upload the renewal: {link}', email: 'Subject: {document} expiring soon\n\nTo avoid dispatch holds, please upload…' },
  { kind: 'payment-received', sms: 'Payment received for {load}. Payout of {amount} is on the way.', email: 'Subject: Payment received — {load}\n\nGood news! The broker paid invoice {invoice}…' },
]

export function MessagesPage() {
  const { state, update } = useDemo()
  const actor = useStaffActor()
  const toast = useToast()
  const [tab, setTab] = useState('inbox')
  const [kindFilter, setKindFilter] = useState('')
  const [audience, setAudience] = useState('')
  const [testCarrier, setTestCarrier] = useState(state.carriers[0]?.id ?? '')

  const log = state.notifications.filter((n) => (!kindFilter || n.kind === kindFilter) && (!audience || n.audience === audience))
  const twilio = state.integrations.find((i) => i.id === 'twilio')
  const email = state.integrations.find((i) => i.id === 'email')

  return (
    <>
      <PageHeader title="Communication Center" description="Carrier conversations, SMS and email notifications, and message templates in one place." />
      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'inbox', label: 'Inbox', count: state.threads.filter((t) => t.unreadForStaff).length },
          { id: 'log', label: 'Notification log', count: state.notifications.length },
          { id: 'templates', label: 'Templates' },
          { id: 'channels', label: 'Channels' },
        ]}
      />

      {tab === 'inbox' && (
        <MessageCenter
          threads={state.threads}
          side="staff"
          actorName={actor.user.name}
          carriers={state.carriers}
          channels={['in-app', 'sms', 'email']}
          canSend={actor.can('messages.send')}
          onSend={(id, text, channel) => {
            update((s) => sendMessage(s, id, text, actor.user.name, actor.role, channel, 'staff'))
            if (channel !== 'in-app') toast({ title: `${channel === 'sms' ? 'SMS' : 'Email'} queued`, description: 'Simulated — no message is actually sent.', tone: 'info' })
          }}
          onCreate={(cid, subject, text, channel) => {
            const res = createThread(state, cid, subject, text, actor.user.name, actor.role, channel, 'staff')
            update((s) => ({ ...s, threads: [res.state.threads[0]!, ...s.threads] }))
            return res.id
          }}
          onRead={(id) => update((s) => markThreadRead(s, id, 'staff'))}
        />
      )}

      {tab === 'log' && (
        <Card padded={false}>
          <div className="p-4">
            <FilterBar>
              <FilterSelect label="Type" value={kindFilter} onChange={setKindFilter} options={Object.entries(NOTIFICATION_META).map(([value, m]) => ({ value, label: m.label }))} />
              <FilterSelect label="Audience" value={audience} onChange={setAudience} options={[{ value: 'carrier', label: 'Carriers' }, { value: 'staff', label: 'Staff' }]} />
            </FilterBar>
          </div>
          <NotificationList items={log} onOpen={(id) => update((s) => markNotificationRead(s, id))} />
        </Card>
      )}

      {tab === 'templates' && (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <Select label="Send test notifications to" value={testCarrier} onChange={(e) => setTestCarrier(e.target.value)} options={state.carriers.map((c) => ({ value: c.id, label: c.legalName }))} wrapperClassName="w-72" />
            <p className="pb-2 text-xs text-road-500">Tests appear in the carrier’s portal notifications.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {TEMPLATES.map((t) => {
              const meta = NOTIFICATION_META[t.kind]
              const Icon = meta.icon
              const channels = state.settings.notificationChannels[t.kind]
              return (
                <Card key={t.kind}>
                  <CardHeader
                    title={meta.label}
                    icon={<Icon className="size-4" />}
                    actions={
                      <Button
                        size="xs"
                        variant="outline"
                        icon={<Send className="size-3.5" />}
                        onClick={() => {
                          update((s) => sendTestNotification(s, { kind: t.kind, title: `${meta.label} (test)`, body: `Test message sent by ${actor.user.name}.`, audience: 'carrier', carrierId: testCarrier, link: '/portal/notifications' }))
                          toast({ title: 'Test notification sent', description: `${carrierName(state, testCarrier)} · ${channels.join(', ')} (simulated)` })
                        }}
                      >
                        Send test
                      </Button>
                    }
                  />
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {channels.map((c) => (
                      <Badge key={c} size="sm" tone={c === 'sms' ? 'danger' : c === 'email' ? 'info' : 'neutral'}>
                        {c}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="rounded-xl bg-road-50 p-3">
                      <p className="mb-1 flex items-center gap-1 font-semibold text-road-600"><Smartphone className="size-3.5" /> SMS</p>
                      <p className="font-mono text-navy-900">{t.sms}</p>
                    </div>
                    <div className="rounded-xl bg-road-50 p-3">
                      <p className="mb-1 flex items-center gap-1 font-semibold text-road-600"><Mail className="size-3.5" /> Email</p>
                      <p className="whitespace-pre-line font-mono text-navy-900">{t.email}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {tab === 'channels' && (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: MessageSquare, name: 'In-app', desc: 'Portal notifications and message threads.', status: 'connected' as const, provider: 'Built-in' },
            { icon: Smartphone, name: 'SMS', desc: 'Load assignments, reminders and missing-POD alerts.', status: twilio?.status ?? 'not-connected', provider: 'Twilio' },
            { icon: Mail, name: 'Email', desc: 'Verification, alerts, invoices and document reminders.', status: email?.status ?? 'not-connected', provider: 'Transactional email (SendGrid / SES)' },
          ].map(({ icon: Icon, name, desc, status, provider }) => (
            <Card key={name}>
              <Icon className="size-7 text-amber-600" />
              <h3 className="mt-3 font-display text-lg font-bold text-navy-900">{name}</h3>
              <p className="text-sm text-road-500">{desc}</p>
              <p className="mt-3 text-xs text-road-500">Provider: {provider}</p>
              <div className="mt-3">
                <StatusBadge kind="integration" value={status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
