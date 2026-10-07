import type { ReactNode } from 'react'
import { Pencil, Plus, Trash } from 'lucide-react'
import type { EquipmentType, OperatingRadius } from '@/data/types'
import { EquipmentGlyph } from '@/components/brand/EquipmentGlyph'
import { Checkbox, ChoiceCard, Input, Select, Textarea } from '@/components/ui/Form'
import { FileDrop } from '@/components/ui/FileDrop'
import { Badge } from '@/components/ui/Badge'
import { EQUIPMENT, equipmentLabel } from '@/lib/equipment'
import { REGIONS, US_STATES } from '@/lib/states'
import { cn } from '@/lib/cn'
import { DOCUMENTS, emptyTruck, equipmentNames, type Errors, type OnboardingForm } from './form'

export interface StepProps {
  form: OnboardingForm
  errors: Errors
  patch: <K extends keyof OnboardingForm>(section: K, value: Partial<OnboardingForm[K]>) => void
}

const stateOptions = US_STATES.map((s) => ({ value: s, label: s }))

function StepIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-xl font-bold text-navy-900 sm:text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-road-500">{description}</p>
    </div>
  )
}

export function AccountStep({ form, errors, patch }: StepProps) {
  const a = form.account
  const set = (k: keyof typeof a) => (e: { target: { value: string } }) => patch('account', { [k]: e.target.value })
  return (
    <>
      <StepIntro title="Create your account" description="This is the login for your carrier portal. We’ll verify your email before activation." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="First name" required value={a.firstName} onChange={set('firstName')} error={errors['account.firstName']} autoComplete="given-name" />
        <Input label="Last name" required value={a.lastName} onChange={set('lastName')} error={errors['account.lastName']} autoComplete="family-name" />
        <Input label="Email" type="email" required value={a.email} onChange={set('email')} error={errors['account.email']} autoComplete="email" />
        <Input label="Mobile phone" type="tel" required value={a.phone} onChange={set('phone')} error={errors['account.phone']} placeholder="(555) 555-0123" hint="Used for load SMS notifications" autoComplete="tel" />
        <Input label="Password" type="password" required value={a.password} onChange={set('password')} error={errors['account.password']} hint="8+ characters with letters and numbers" autoComplete="new-password" />
        <Input label="Confirm password" type="password" required value={a.confirm} onChange={set('confirm')} error={errors['account.confirm']} autoComplete="new-password" />
      </div>
    </>
  )
}

export function CompanyStep({ form, errors, patch }: StepProps) {
  const c = form.company
  const set = (k: keyof typeof c) => (e: { target: { value: string } }) => patch('company', { [k]: e.target.value })
  return (
    <>
      <StepIntro title="Company information" description="Your legal business details as registered with FMCSA. Authority will be verified during review." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Legal company name" required value={c.legalName} onChange={set('legalName')} error={errors['company.legalName']} wrapperClassName="sm:col-span-2" />
        <Input label="DBA (doing business as)" value={c.dba} onChange={set('dba')} hint="Optional" wrapperClassName="sm:col-span-2" />
        <Input label="USDOT number" required value={c.dotNumber} onChange={set('dotNumber')} error={errors['company.dotNumber']} inputMode="numeric" placeholder="1234567" />
        <Input label="MC number" value={c.mcNumber} onChange={set('mcNumber')} error={errors['company.mcNumber']} placeholder="MC-123456" hint="Where applicable" />
        <Input label="EIN" required value={c.ein} onChange={set('ein')} error={errors['company.ein']} placeholder="12-3456789" hint="Stored encrypted — only the last 4 digits are shown to staff" />
        <div className="hidden sm:block" />
        <Input label="Street address" required value={c.street} onChange={set('street')} error={errors['company.street']} wrapperClassName="sm:col-span-2" autoComplete="street-address" />
        <Input label="City" required value={c.city} onChange={set('city')} error={errors['company.city']} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="State" required value={c.state} onChange={set('state')} error={errors['company.state']} placeholder="—" options={stateOptions} />
          <Input label="ZIP" required value={c.zip} onChange={set('zip')} error={errors['company.zip']} inputMode="numeric" maxLength={5} />
        </div>
      </div>
    </>
  )
}

export function EquipmentStep({ form, errors, patch }: StepProps) {
  const eq = form.equipment
  const toggle = (t: EquipmentType) => patch('equipment', { types: eq.types.includes(t) ? eq.types.filter((x) => x !== t) : [...eq.types, t] })
  const setTruck = (i: number, k: keyof (typeof eq.trucks)[number], v: string) => patch('equipment', { trucks: eq.trucks.map((t, j) => (j === i ? { ...t, [k]: v } : t)) })
  const typeOptions = (eq.types.length ? eq.types : EQUIPMENT.map((e) => e.type)).map((t) => ({ value: t, label: equipmentLabel(t) }))

  return (
    <>
      <StepIntro title="Your equipment" description="Select every equipment type you operate and add details for your trucks." />
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-navy-800">
          Equipment types <span className="text-red-600">*</span>
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {EQUIPMENT.map((e) => (
            <ChoiceCard key={e.type} selected={eq.types.includes(e.type)} onClick={() => toggle(e.type)} title={e.label} description={e.short} icon={<span className="block w-14"><EquipmentGlyph type={e.type} /></span>} className={cn(e.featured && 'sm:col-span-2')} />
          ))}
        </div>
        {errors['equipment.types'] && <p className="mt-2 text-xs font-medium text-red-600">{errors['equipment.types']}</p>}
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Input label="Number of trucks" type="number" min={1} required value={eq.truckCount} onChange={(e) => patch('equipment', { truckCount: e.target.value })} error={errors['equipment.truckCount']} />
      </div>

      <div className="mt-6 space-y-4">
        {eq.trucks.map((t, i) => (
          <div key={i} className="rounded-xl border border-road-200 bg-road-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-navy-900">Truck {i + 1}</p>
              {eq.trucks.length > 1 && (
                <button type="button" onClick={() => patch('equipment', { trucks: eq.trucks.filter((_, j) => j !== i) })} className="inline-flex items-center gap-1 text-xs font-medium text-road-500 hover:text-red-600">
                  <Trash className="size-3.5" /> Remove
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Select label="Equipment" value={t.equipment} onChange={(e) => setTruck(i, 'equipment', e.target.value)} options={typeOptions} />
              <Input label="Year" required value={t.year} onChange={(e) => setTruck(i, 'year', e.target.value)} error={errors[`trucks.${i}.year`]} inputMode="numeric" maxLength={4} placeholder="2022" />
              <Input label="Make" required value={t.make} onChange={(e) => setTruck(i, 'make', e.target.value)} error={errors[`trucks.${i}.make`]} placeholder="Isuzu" />
              <Input label="Model" required value={t.model} onChange={(e) => setTruck(i, 'model', e.target.value)} error={errors[`trucks.${i}.model`]} placeholder="NRR" />
              <Input label="VIN" value={t.vin} onChange={(e) => setTruck(i, 'vin', e.target.value.toUpperCase())} placeholder="17 characters" maxLength={17} hint="Optional for now" />
              <Input label="Dimensions" value={t.dimensions} onChange={(e) => setTruck(i, 'dimensions', e.target.value)} placeholder={`26' × 102" × 102"`} />
              <Input label="Weight capacity (lbs)" value={t.capacityLbs} onChange={(e) => setTruck(i, 'capacityLbs', e.target.value)} inputMode="numeric" placeholder="10000" />
            </div>
          </div>
        ))}
        {eq.trucks.length < 5 && (
          <button
            type="button"
            onClick={() => patch('equipment', { trucks: [...eq.trucks, emptyTruck(eq.types[0])] })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-road-300 py-3 text-sm font-semibold text-navy-700 hover:border-navy-400 hover:bg-road-50"
          >
            <Plus className="size-4" /> Add another truck
          </button>
        )}
      </div>
    </>
  )
}

export function PreferencesStep({ form, errors, patch }: StepProps) {
  const p = form.preferences
  const toggleState = (s: string) => patch('preferences', { states: p.states.includes(s) ? p.states.filter((x) => x !== s) : [...p.states, s] })
  const toggleRadius = (r: OperatingRadius) => patch('preferences', { radius: p.radius.includes(r) ? p.radius.filter((x) => x !== r) : [...p.radius, r] })
  return (
    <>
      <StepIntro title="Operating preferences" description="Tell us where and how you like to run. Your dispatcher uses this to match loads." />
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-navy-800">
          Operating radius <span className="text-red-600">*</span>
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {(
            [
              ['local', 'Local', 'Home daily · under 150 mi'],
              ['regional', 'Regional', 'Home weekly · 150–600 mi'],
              ['otr', 'OTR', 'Over the road · 600+ mi'],
            ] as const
          ).map(([v, t, d]) => (
            <ChoiceCard key={v} selected={p.radius.includes(v)} onClick={() => toggleRadius(v)} title={t} description={d} />
          ))}
        </div>
        {errors['preferences.radius'] && <p className="mt-2 text-xs font-medium text-red-600">{errors['preferences.radius']}</p>}
      </fieldset>

      <fieldset className="mt-6">
        <legend className="mb-2 flex w-full flex-wrap items-center justify-between gap-2 text-sm font-medium text-navy-800">
          <span>
            Preferred states <span className="text-red-600">*</span> <span className="font-normal text-road-500">({p.states.length} selected)</span>
          </span>
          <span className="flex flex-wrap gap-1.5">
            {Object.entries(REGIONS).map(([region, states]) => (
              <button key={region} type="button" onClick={() => patch('preferences', { states: Array.from(new Set([...p.states, ...states])) })} className="rounded-md bg-navy-50 px-2 py-1 text-xs font-semibold text-navy-700 hover:bg-navy-100">
                + {region}
              </button>
            ))}
            {p.states.length > 0 && (
              <button type="button" onClick={() => patch('preferences', { states: [] })} className="rounded-md px-2 py-1 text-xs font-semibold text-road-500 hover:text-red-600">
                Clear
              </button>
            )}
          </span>
        </legend>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10">
          {US_STATES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={p.states.includes(s)}
              onClick={() => toggleState(s)}
              className={cn('rounded-md py-1.5 text-xs font-semibold transition-colors', p.states.includes(s) ? 'bg-navy-900 text-white' : 'bg-road-100 text-road-600 hover:bg-road-200')}
            >
              {s}
            </button>
          ))}
        </div>
        {errors['preferences.states'] && <p className="mt-2 text-xs font-medium text-red-600">{errors['preferences.states']}</p>}
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Input label="Maximum distance per load (mi)" type="number" required value={p.maxDistance} onChange={(e) => patch('preferences', { maxDistance: e.target.value })} error={errors['preferences.maxDistance']} />
        <Input label="Preferred minimum rate" value={p.minRatePerMile} onChange={(e) => patch('preferences', { minRatePerMile: e.target.value })} error={errors['preferences.minRatePerMile']} leading="$" placeholder="2.25" hint="Per mile" />
        <Input label="Availability" value={p.availability} onChange={(e) => patch('preferences', { availability: e.target.value })} placeholder="Mon–Fri" />
      </div>
      <Textarea label="Preferred lanes" value={p.lanes} onChange={(e) => patch('preferences', { lanes: e.target.value })} placeholder="e.g. Orlando ↔ Atlanta, Jacksonville → Charlotte" wrapperClassName="mt-4" rows={3} />
    </>
  )
}

export function DocumentsStep({ form, errors, patch }: StepProps) {
  const ins = form.insurance
  return (
    <>
      <StepIntro title="Upload documents" description="Upload clear PDFs or photos. Documents are stored securely and only visible to authorized staff." />
      <div className="space-y-3">
        {DOCUMENTS.map((d) => (
          <FileDrop
            key={d.key}
            label={d.label}
            description={d.description}
            required={d.required}
            value={form.documents[d.key]}
            error={errors[`documents.${d.key}`]}
            sampleName={`${d.label.replace(/\W+/g, '_')}_sample.pdf`}
            onChange={(name) => patch('documents', { [d.key]: name })}
          />
        ))}
      </div>
      <h3 className="mt-8 text-sm font-semibold text-navy-900">Insurance details</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <Input label="Insurance provider" required value={ins.provider} onChange={(e) => patch('insurance', { provider: e.target.value })} error={errors['insurance.provider']} />
        <Input label="Policy number" required value={ins.policyNumber} onChange={(e) => patch('insurance', { policyNumber: e.target.value })} error={errors['insurance.policyNumber']} />
        <Input label="Expiration date" type="date" required value={ins.expiresAt} onChange={(e) => patch('insurance', { expiresAt: e.target.value })} error={errors['insurance.expiresAt']} />
      </div>
    </>
  )
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-road-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-road-500">{title}</h3>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:text-amber-700">
          <Pencil className="size-3.5" /> Edit
        </button>
      </div>
      <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">{children}</div>
    </div>
  )
}

const Row = ({ k, v }: { k: string; v: ReactNode }) => (
  <p className="min-w-0">
    <span className="text-road-500">{k}: </span>
    <span className="font-medium text-navy-900">{v || '—'}</span>
  </p>
)

export function ReviewStep({ form, errors, goTo, onAgree }: Omit<StepProps, 'patch'> & { goTo: (step: number) => void; onAgree: (v: boolean) => void }) {
  const { account: a, company: c, equipment: eq, preferences: p, insurance: ins } = form
  return (
    <>
      <StepIntro title="Review & submit" description="Check your application summary. You can edit any section before submitting." />
      <div className="space-y-3">
        <ReviewBlock title="Account" onEdit={() => goTo(0)}>
          <Row k="Name" v={`${a.firstName} ${a.lastName}`} />
          <Row k="Email" v={a.email} />
          <Row k="Phone" v={a.phone} />
        </ReviewBlock>
        <ReviewBlock title="Company" onEdit={() => goTo(1)}>
          <Row k="Legal name" v={c.legalName} />
          <Row k="DBA" v={c.dba} />
          <Row k="USDOT" v={c.dotNumber} />
          <Row k="MC" v={c.mcNumber} />
          <Row k="EIN" v={c.ein ? `••-•••${c.ein.replace(/\D/g, '').slice(-4)}` : ''} />
          <Row k="Address" v={`${c.street}, ${c.city}, ${c.state} ${c.zip}`} />
        </ReviewBlock>
        <ReviewBlock title="Equipment" onEdit={() => goTo(2)}>
          <Row k="Types" v={equipmentNames(eq.types)} />
          <Row k="Trucks" v={eq.truckCount} />
          {eq.trucks.map((t, i) => (
            <Row key={i} k={`Truck ${i + 1}`} v={`${t.year} ${t.make} ${t.model} · ${equipmentLabel(t.equipment)}${t.dimensions ? ` · ${t.dimensions}` : ''}`} />
          ))}
        </ReviewBlock>
        <ReviewBlock title="Preferences" onEdit={() => goTo(3)}>
          <Row k="Radius" v={p.radius.map((r) => r.toUpperCase()).join(', ')} />
          <Row k="States" v={p.states.join(', ')} />
          <Row k="Max distance" v={`${p.maxDistance} mi`} />
          <Row k="Min rate" v={p.minRatePerMile ? `$${p.minRatePerMile}/mi` : ''} />
          <Row k="Availability" v={p.availability} />
          <Row k="Lanes" v={p.lanes} />
        </ReviewBlock>
        <ReviewBlock title="Documents & insurance" onEdit={() => goTo(4)}>
          {DOCUMENTS.map((d) => (
            <p key={d.key} className="flex items-center justify-between gap-2">
              <span className="text-road-500">{d.label}</span>
              {form.documents[d.key] ? <Badge tone="success" dot size="sm">Uploaded</Badge> : <Badge tone={d.required ? 'danger' : 'neutral'} size="sm">{d.required ? 'Missing' : 'Not provided'}</Badge>}
            </p>
          ))}
          <Row k="Insurance" v={`${ins.provider} · ${ins.policyNumber}`} />
          <Row k="Expires" v={ins.expiresAt} />
        </ReviewBlock>
      </div>
      <div className="mt-5 rounded-xl bg-road-50 p-4">
        <Checkbox
          checked={form.agree}
          onChange={(e) => onAgree(e.target.checked)}
          label="I confirm this information is accurate"
          description="I authorize Eagle Vision Dispatch to verify my authority and insurance and to contact me by email and SMS about my application."
        />
        {errors.agree && <p className="mt-2 pl-8 text-xs font-medium text-red-600">{errors.agree}</p>}
      </div>
    </>
  )
}
