import { useState } from 'react'
import { Bell, Building, Percent, Save, ShieldCheck } from 'lucide-react'
import type { Channel, NotificationKind, PlatformSettings } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { updateSettings } from '@/services/commands'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input, Toggle } from '@/components/ui/Form'
import { Alert } from '@/components/ui/Feedback'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/components/ui/Toast'
import { FeeBreakdownList } from '@/features/shared/LoadBits'
import { NOTIFICATION_META } from '@/features/shared/NotificationList'

const CHANNELS: Channel[] = ['in-app', 'sms', 'email']

export function SettingsPage() {
  const { state, update } = useDemo()
  const toast = useToast()
  const [s, setS] = useState<PlatformSettings>(state.settings)
  const dirty = JSON.stringify(s) !== JSON.stringify(state.settings)

  const toggleChannel = (kind: NotificationKind, ch: Channel) =>
    setS((x) => {
      const cur = x.notificationChannels[kind]
      return { ...x, notificationChannels: { ...x.notificationChannels, [kind]: cur.includes(ch) ? cur.filter((c) => c !== ch) : [...cur, ch] } }
    })

  const save = () => {
    update((st) => updateSettings(st, s))
    toast({ title: 'Settings saved', description: 'Fee changes apply to new invoices; the public pricing page updates immediately.' })
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Platform-wide configuration. Changes here flow through the whole prototype."
        actions={<Button variant="accent" icon={<Save className="size-4" />} onClick={save} disabled={!dirty}>Save changes</Button>}
      />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Dispatch fee" icon={<Percent className="size-4" />} description="Default percentage applied to new invoices" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Input label="Default dispatch fee (%)" type="number" step="0.5" min={0} max={30} value={s.dispatchFeePct} onChange={(e) => setS({ ...s, dispatchFeePct: Number(e.target.value) })} />
              <Alert tone="demo" className="mt-3">Sample value only — not actual customer pricing.</Alert>
            </div>
            <FeeBreakdownList gross={2500} feePct={s.dispatchFeePct || 0} compact />
          </div>
        </Card>
        <Card>
          <CardHeader title="Company" icon={<Building className="size-4" />} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Company name" value={s.companyName} onChange={(e) => setS({ ...s, companyName: e.target.value })} wrapperClassName="sm:col-span-2" />
            <Input label="Support email" value={s.supportEmail} onChange={(e) => setS({ ...s, supportEmail: e.target.value })} />
            <Input label="Support phone" value={s.supportPhone} onChange={(e) => setS({ ...s, supportPhone: e.target.value })} />
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Notification rules" icon={<Bell className="size-4" />} description="Which channels each event uses. SMS via Twilio, email via the transactional provider." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-road-500">
                  <th className="py-2 text-left font-semibold">Event</th>
                  {CHANNELS.map((c) => (
                    <th key={c} className="py-2 text-center font-semibold">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-road-100">
                {(Object.keys(s.notificationChannels) as NotificationKind[]).map((k) => (
                  <tr key={k}>
                    <td className="py-2.5 font-medium text-navy-900">{NOTIFICATION_META[k].label}</td>
                    {CHANNELS.map((c) => (
                      <td key={c} className="py-2.5">
                        <div className="flex justify-center">
                          <Toggle checked={s.notificationChannels[k].includes(c)} onChange={() => toggleChannel(k, c)} disabled={c === 'in-app'} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardHeader title="Compliance" description="Document expiration alerts" />
          <Input label="Warn carriers this many days before expiry" type="number" min={1} max={120} value={s.documentExpiryWarningDays} onChange={(e) => setS({ ...s, documentExpiryWarningDays: Number(e.target.value) || 30 })} />
        </Card>
        <Card>
          <CardHeader title="Security" icon={<ShieldCheck className="size-4" />} />
          <div className="space-y-4">
            <Toggle checked={s.requireMfaForStaff} onChange={(v) => setS({ ...s, requireMfaForStaff: v })} label="Require MFA for staff" description="Admins, dispatchers and accounting must use two-factor sign-in" />
            <Toggle checked label="Audit logging" description="Record every administrative and status change (always on)" disabled onChange={() => undefined} />
          </div>
        </Card>
      </div>
    </>
  )
}
