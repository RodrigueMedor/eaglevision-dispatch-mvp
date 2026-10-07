import { useState } from 'react'
import { Building, KeyRound, MapPin, Save, ShieldCheck, User } from 'lucide-react'
import type { OperatingRadius } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { usePortalActor } from '@/store/hooks'
import { updateCarrier } from '@/services/commands'
import { Card, CardHeader, DescriptionList } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Toggle } from '@/components/ui/Form'
import { Avatar } from '@/components/ui/Feedback'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/components/ui/Toast'
import { equipmentLabel } from '@/lib/equipment'
import { date, money } from '@/lib/format'
import { US_STATES } from '@/lib/states'
import { cn } from '@/lib/cn'

export function PortalProfile() {
  const { state, update } = useDemo()
  const actor = usePortalActor()
  const toast = useToast()
  const c = actor.carrier
  const [contact, setContact] = useState({ email: c.email, phone: c.phone })
  const [prefs, setPrefs] = useState({ states: c.preferredStates, radius: c.radius })
  const [mfa, setMfa] = useState(true)
  const isDriver = actor.role === 'driver'

  return (
    <>
      <PageHeader title="Profile" description={isDriver ? 'Your driver profile and account security.' : 'Company profile, operating preferences and account security.'} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px] [&>*]:min-w-0">
        <div className="space-y-5">
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar name={actor.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-bold text-navy-900">{actor.name}</p>
                <p className="text-sm text-road-500">
                  {actor.roleLabel} · {c.legalName}
                </p>
              </div>
              <StatusBadge kind="carrier" value={c.status} />
            </div>
          </Card>

          {isDriver && actor.driver ? (
            <Card>
              <CardHeader title="Driver details" icon={<User className="size-4" />} />
              <DescriptionList
                items={[
                  { label: 'Phone', value: actor.driver.phone },
                  { label: 'Email', value: actor.driver.email },
                  { label: 'License', value: `${actor.driver.cdlClass} · ${actor.driver.licenseState}` },
                  { label: 'License expires', value: date(actor.driver.licenseExpiresAt) },
                ]}
              />
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader title="Company" icon={<Building className="size-4" />} description="Legal details are verified by dispatch — contact support to change them." />
                <DescriptionList
                  columns={3}
                  items={[
                    { label: 'Legal name', value: c.legalName },
                    { label: 'DBA', value: c.dba ?? '—' },
                    { label: 'USDOT', value: c.dotNumber },
                    { label: 'MC', value: c.mcNumber },
                    { label: 'EIN', value: `••-•••${c.einLast4}` },
                    { label: 'Member since', value: date(c.joinedAt) },
                    { label: 'Address', value: `${c.address.street}, ${c.address.city}, ${c.address.state} ${c.address.zip}` },
                    { label: 'Equipment', value: c.equipment.map(equipmentLabel).join(', ') },
                    { label: 'Insurance', value: `${c.insurance.provider} · ${money(c.insurance.autoLiability)} auto / ${money(c.insurance.cargo)} cargo` },
                  ]}
                />
              </Card>
              <Card>
                <CardHeader title="Contact" icon={<User className="size-4" />} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Owner" value={c.ownerName} disabled />
                  <Input label="Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                  <Input label="Phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                </div>
              </Card>
              <Card>
                <CardHeader title="Operating preferences" icon={<MapPin className="size-4" />} description="Your dispatcher uses these to match loads." />
                <Select
                  label="Operating radius"
                  value={prefs.radius}
                  onChange={(e) => setPrefs({ ...prefs, radius: e.target.value as OperatingRadius })}
                  options={[
                    { value: 'local', label: 'Local' },
                    { value: 'regional', label: 'Regional' },
                    { value: 'otr', label: 'OTR' },
                  ]}
                  wrapperClassName="max-w-xs"
                />
                <p className="mb-2 mt-4 text-sm font-medium text-navy-800">Preferred states</p>
                <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10">
                  {US_STATES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={prefs.states.includes(s)}
                      onClick={() => setPrefs({ ...prefs, states: prefs.states.includes(s) ? prefs.states.filter((x) => x !== s) : [...prefs.states, s] })}
                      className={cn('rounded-md py-1.5 text-xs font-semibold', prefs.states.includes(s) ? 'bg-navy-900 text-white' : 'bg-road-100 text-road-600 hover:bg-road-200')}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Card>
              <div className="flex justify-end">
                <Button
                  variant="accent"
                  icon={<Save className="size-4" />}
                  onClick={() => {
                    update((s) => updateCarrier(s, c.id, { email: contact.email, phone: contact.phone, preferredStates: prefs.states, radius: prefs.radius }))
                    toast({ title: 'Profile saved', description: 'Your dispatcher will see the updated preferences.' })
                  }}
                >
                  Save changes
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Security" icon={<ShieldCheck className="size-4" />} />
            <div className="space-y-4">
              <Toggle checked={mfa} onChange={setMfa} label="Two-factor authentication" description="Code by SMS when signing in on a new device" />
              <Button variant="outline" size="sm" block icon={<KeyRound className="size-4" />} onClick={() => toast({ title: 'Password reset email sent', description: 'Simulated — production uses secure, expiring reset links.', tone: 'info' })}>
                Change password
              </Button>
            </div>
          </Card>
          <Card>
            <CardHeader title="Sessions" />
            <ul className="space-y-3 text-sm">
              {[
                ['iPhone · Safari', 'Orlando, FL · now', true],
                ['Windows · Chrome', 'Orlando, FL · 2 days ago', false],
              ].map(([d, m, current]) => (
                <li key={String(d)} className="flex items-center justify-between gap-2">
                  <span>
                    <span className="block font-medium text-navy-900">{d}</span>
                    <span className="text-xs text-road-500">{m}</span>
                  </span>
                  {current ? <Badge tone="success" size="sm">This device</Badge> : <Button size="xs" variant="ghost" onClick={() => toast({ title: 'Session signed out', tone: 'info' })}>Sign out</Button>}
                </li>
              ))}
            </ul>
          </Card>
          <p className="text-xs text-road-500">Demo account data · {state.settings.companyName} prototype</p>
        </div>
      </div>
    </>
  )
}
