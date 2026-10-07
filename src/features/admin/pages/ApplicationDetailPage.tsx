import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CircleCheck, ClipboardList, FileText, MessageSquareWarning, ShieldCheck, StickyNote, CircleX } from 'lucide-react'
import type { ApplicationStatus } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { setApplicationStatus } from '@/services/commands'
import { Card, CardHeader, DescriptionList } from '@/components/ui/Card'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox, Textarea } from '@/components/ui/Form'
import { ActivityFeed } from '@/components/ui/Timeline'
import { Alert, EmptyState } from '@/components/ui/Feedback'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { EquipmentGlyph } from '@/components/brand/EquipmentGlyph'
import { equipmentLabel } from '@/lib/equipment'
import { date, dateTime, money } from '@/lib/format'

type Decision = { status: ApplicationStatus; title: string; cta: string; placeholder: string; tone: 'success' | 'danger' | 'accent' }

const DECISIONS: Record<'approve' | 'reject' | 'info', Decision> = {
  approve: { status: 'approved', title: 'Approve carrier', cta: 'Approve & create account', placeholder: 'Optional note (e.g. authority verified, dispatch agreement sent)', tone: 'success' },
  reject: { status: 'rejected', title: 'Reject application', cta: 'Reject application', placeholder: 'Reason for rejection (shared with applicant)', tone: 'danger' },
  info: { status: 'info-required', title: 'Request additional information', cta: 'Send request', placeholder: 'What do you need from the carrier? (sent by email & SMS)', tone: 'accent' },
}

const CHECKS = ['DOT/MC authority active (FMCSA SAFER — integration coming soon)', 'Insurance meets minimums ($750k+ auto, $100k cargo)', 'W-9 matches legal name & EIN', 'Equipment matches stated operations']

export function ApplicationDetailPage() {
  const { id = '' } = useParams()
  const { state, update } = useDemo()
  const actor = useStaffActor()
  const toast = useToast()
  const [decision, setDecision] = useState<keyof typeof DECISIONS | null>(null)
  const [note, setNote] = useState('')
  const [checks, setChecks] = useState<boolean[]>(CHECKS.map(() => false))
  const app = state.applications.find((a) => a.id === id)

  if (!app) return <EmptyState icon={<ClipboardList className="size-7" />} title="Application not found" action={<Button to="/admin/applications">Back to applications</Button>} />

  const d = decision ? DECISIONS[decision] : null
  const closed = app.status === 'approved' || app.status === 'rejected'
  const missing = app.documents.filter((x) => x.status === 'missing')

  const decide = () => {
    if (!d) return
    if (decision !== 'approve' && !note.trim()) return toast({ title: 'Please add a note for the carrier', tone: 'warning' })
    update((s) => setApplicationStatus(s, app.id, d.status, actor.user.name, note.trim() || undefined))
    toast({
      title: decision === 'approve' ? 'Carrier approved' : decision === 'reject' ? 'Application rejected' : 'Information requested',
      description: decision === 'approve' ? `${app.company.legalName} added to Carriers (onboarding). Welcome email & SMS simulated.` : 'Carrier notified by email & SMS (simulated).',
      tone: decision === 'reject' ? 'warning' : 'success',
    })
    setDecision(null)
    setNote('')
  }

  return (
    <>
      <Button to="/admin/applications" variant="ghost" size="sm" className="mb-3 -ml-2">
        ← Applications
      </Button>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-navy-900 sm:text-[28px]">{app.company.legalName}</h1>
            <StatusBadge kind="application" value={app.status} />
          </div>
          <p className="text-sm text-road-500">
            {app.id} · Submitted {dateTime(app.submittedAt)}
          </p>
        </div>
        {!closed && (
          <div className="flex flex-wrap gap-2">
            <Button variant="success" icon={<CircleCheck className="size-4" />} onClick={() => setDecision('approve')}>
              Approve
            </Button>
            <Button variant="outline" icon={<MessageSquareWarning className="size-4" />} onClick={() => setDecision('info')}>
              Request Information
            </Button>
            <Button variant="danger" icon={<CircleX className="size-4" />} onClick={() => setDecision('reject')}>
              Reject
            </Button>
          </div>
        )}
      </div>

      {app.status === 'approved' && <Alert tone="success" className="mb-5" title="Approved">The carrier account was created and appears under Carriers with status Onboarding.</Alert>}
      {missing.length > 0 && !closed && <Alert tone="warning" className="mb-5" title={`${missing.length} required document(s) missing`}>{missing.map((m) => m.name).join(', ')}</Alert>}

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr] [&>*]:min-w-0">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Company" />
            <DescriptionList
              columns={3}
              items={[
                { label: 'Legal name', value: app.company.legalName },
                { label: 'DBA', value: app.company.dba || '—' },
                { label: 'USDOT', value: app.company.dotNumber },
                { label: 'MC', value: app.company.mcNumber },
                { label: 'EIN', value: app.company.ein },
                { label: 'Address', value: `${app.company.address.street}, ${app.company.address.city}, ${app.company.address.state} ${app.company.address.zip}` },
              ]}
            />
          </Card>
          <Card>
            <CardHeader title="Owner" />
            <DescriptionList
              columns={3}
              items={[
                { label: 'Name', value: `${app.owner.firstName} ${app.owner.lastName}` },
                { label: 'Email', value: app.owner.email },
                { label: 'Phone', value: app.owner.phone },
              ]}
            />
          </Card>
          <Card>
            <CardHeader title="Equipment" description={`${app.equipment.truckCount} truck(s)`} />
            <div className="mb-4 flex flex-wrap gap-2">
              {app.equipment.types.map((t) => (
                <div key={t} className="flex items-center gap-2 rounded-lg bg-road-50 px-3 py-2">
                  <span className="w-12">
                    <EquipmentGlyph type={t} />
                  </span>
                  <span className="text-sm font-semibold text-navy-900">{equipmentLabel(t)}</span>
                </div>
              ))}
            </div>
            {app.equipment.trucks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="text-xs uppercase text-road-500">
                    <tr>
                      {['Type', 'Year', 'Make / Model', 'VIN', 'Dimensions', 'Capacity'].map((h) => (
                        <th key={h} className="py-2 pr-3 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-road-100">
                    {app.equipment.trucks.map((t, i) => (
                      <tr key={i}>
                        <td className="py-2 pr-3">{equipmentLabel(t.equipment)}</td>
                        <td className="py-2 pr-3">{t.year}</td>
                        <td className="py-2 pr-3">
                          {t.make} {t.model}
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs">{t.vin || '—'}</td>
                        <td className="py-2 pr-3">{t.dimensions || '—'}</td>
                        <td className="py-2 pr-3">{t.capacityLbs ? `${Number(t.capacityLbs).toLocaleString()} lbs` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-road-500">Truck details not provided yet.</p>
            )}
          </Card>
          <Card>
            <CardHeader title="Operating preferences" />
            <DescriptionList
              columns={3}
              items={[
                { label: 'Radius', value: app.preferences.radius.map((r) => r.toUpperCase()).join(', ') },
                { label: 'Max distance', value: `${app.preferences.maxDistance} mi` },
                { label: 'Min rate', value: app.preferences.minRatePerMile ? `$${app.preferences.minRatePerMile.toFixed(2)}/mi` : '—' },
                { label: 'Availability', value: app.preferences.availability },
                { label: 'Preferred states', value: app.preferences.states.join(', ') },
                { label: 'Preferred lanes', value: app.preferences.lanes || '—' },
              ]}
            />
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Insurance" icon={<ShieldCheck className="size-4" />} />
            <DescriptionList
              columns={1}
              items={[
                { label: 'Provider', value: app.insurance.provider },
                { label: 'Policy #', value: app.insurance.policyNumber },
                { label: 'Auto liability', value: money(app.insurance.autoLiability) },
                { label: 'Cargo', value: money(app.insurance.cargo) },
                { label: 'Expires', value: date(app.insurance.expiresAt) },
              ]}
            />
          </Card>
          <Card>
            <CardHeader title="Documents" icon={<FileText className="size-4" />} />
            <ul className="space-y-2">
              {app.documents.map((doc) => (
                <li key={doc.type} className="flex items-center justify-between gap-2 rounded-lg bg-road-50 px-3 py-2 text-sm">
                  <span className="font-medium text-navy-900">{doc.name}</span>
                  {doc.status === 'received' ? <Badge tone="success" dot size="sm">Received</Badge> : <Badge tone="danger" dot size="sm">Missing</Badge>}
                </li>
              ))}
            </ul>
          </Card>
          {!closed && (
            <Card>
              <CardHeader title="Verification checklist" description="Internal review steps" />
              <div className="space-y-3">
                {CHECKS.map((c, i) => (
                  <Checkbox key={c} label={c} checked={checks[i]} onChange={(e) => setChecks((xs) => xs.map((x, j) => (j === i ? e.target.checked : x)))} />
                ))}
              </div>
            </Card>
          )}
          <Card>
            <CardHeader title="Review notes" icon={<StickyNote className="size-4" />} />
            {app.notes.length === 0 ? (
              <p className="text-sm text-road-500">No notes yet.</p>
            ) : (
              <ActivityFeed items={app.notes.map((n) => ({ id: n.id, title: n.by, meta: dateTime(n.at), body: n.text, icon: <StickyNote className="size-4" /> }))} />
            )}
          </Card>
        </div>
      </div>

      {d && (
        <Modal
          open
          onClose={() => setDecision(null)}
          title={d.title}
          description={app.company.legalName}
          footer={
            <>
              <Button variant="outline" onClick={() => setDecision(null)}>
                Cancel
              </Button>
              <Button variant={d.tone} onClick={decide}>
                {d.cta}
              </Button>
            </>
          }
        >
          {decision === 'approve' && checks.some((c) => !c) && (
            <Alert tone="warning" className="mb-4">
              {checks.filter((c) => !c).length} checklist item(s) not yet confirmed.
            </Alert>
          )}
          <Textarea label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={d.placeholder} rows={4} />
        </Modal>
      )}
    </>
  )
}
