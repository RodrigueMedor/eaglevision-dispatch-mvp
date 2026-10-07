import { useState } from 'react'
import { Check, Minus, UserPlus } from 'lucide-react'
import type { StaffRole, StaffUser } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { upsertUser } from '@/services/commands'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Avatar, EmptyState } from '@/components/ui/Feedback'
import { Input, Select } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/components/ui/Toast'
import { ROLE_DESCRIPTION, ROLE_LABEL, STAFF_PERMISSIONS, type Permission } from '@/lib/permissions'
import { relative } from '@/lib/format'
import { uid } from '@/lib/id'
import { nowIso } from '@/lib/dates'

const STAFF_ROLES: StaffRole[] = ['super-admin', 'admin', 'dispatcher', 'accounting', 'support']

const MATRIX: { label: string; permission?: Permission; carrier: boolean; driver: boolean }[] = [
  { label: 'Review carrier applications', permission: 'applications.review', carrier: false, driver: false },
  { label: 'Manage carriers, trucks & drivers', permission: 'carriers.manage', carrier: true, driver: false },
  { label: 'View loads', permission: 'loads.view', carrier: true, driver: true },
  { label: 'Create / assign / update loads', permission: 'loads.manage', carrier: false, driver: false },
  { label: 'Dispatch board', permission: 'dispatch.board', carrier: false, driver: false },
  { label: 'Load board (DAT / Truckstop)', permission: 'loadboard.use', carrier: false, driver: false },
  { label: 'Review documents', permission: 'documents.review', carrier: false, driver: false },
  { label: 'Upload BOL / POD', carrier: true, driver: true },
  { label: 'View invoices & payments', permission: 'finance.view', carrier: true, driver: false },
  { label: 'Manage invoices & payments', permission: 'finance.manage', carrier: false, driver: false },
  { label: 'Send messages', permission: 'messages.send', carrier: true, driver: true },
  { label: 'Reports', permission: 'reports.view', carrier: false, driver: false },
  { label: 'Users & roles', permission: 'users.manage', carrier: false, driver: false },
  { label: 'Settings', permission: 'settings.manage', carrier: false, driver: false },
  { label: 'Integrations & API keys', permission: 'integrations.manage', carrier: false, driver: false },
]

const Mark = ({ on }: { on: boolean }) => (on ? <Check className="mx-auto size-4 text-emerald-600" aria-label="Allowed" /> : <Minus className="mx-auto size-4 text-road-300" aria-label="Not allowed" />)

export function UsersPage() {
  const { state, update } = useDemo()
  const toast = useToast()
  const [inviting, setInviting] = useState(false)

  return (
    <>
      <PageHeader
        title="Users & Roles"
        description="Role-based access control for staff, carriers and drivers (proposal §11)."
        actions={<Button variant="accent" icon={<UserPlus className="size-4" />} onClick={() => setInviting(true)}>Invite user</Button>}
      />
      <Card padded={false} className="mb-6">
        <DataTable
          rows={state.users}
          rowKey={(u) => u.id}
          columns={[
            { key: 'name', header: 'User', sortValue: (u) => u.name, render: (u) => <div className="flex items-center gap-3"><Avatar name={u.name} size="sm" /><div><p className="font-semibold">{u.name}</p><p className="text-xs text-road-500">{u.email}</p></div></div> },
            {
              key: 'role',
              header: 'Role',
              sortValue: (u) => u.role,
              render: (u) => (
                <select
                  aria-label={`Role for ${u.name}`}
                  value={u.role}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    update((s) => upsertUser(s, { ...u, role: e.target.value as StaffRole }))
                    toast({ title: `${u.name} is now ${ROLE_LABEL[e.target.value as StaffRole]}` })
                  }}
                  className="h-8 rounded-md border border-road-200 bg-white px-2 text-sm"
                >
                  {STAFF_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              ),
            },
            { key: 'phone', header: 'Phone', render: (u) => u.phone, hideBelow: 'lg' },
            { key: 'mfa', header: 'MFA', render: () => (state.settings.requireMfaForStaff ? <Badge tone="success" size="sm">Enforced</Badge> : <Badge size="sm">Optional</Badge>), hideBelow: 'md' },
            { key: 'active', header: 'Last active', render: (u) => relative(u.lastActiveAt), sortValue: (u) => u.lastActiveAt, hideBelow: 'md' },
            { key: 'status', header: 'Status', render: (u) => <Badge tone={u.status === 'active' ? 'success' : u.status === 'invited' ? 'info' : 'neutral'} dot size="sm">{u.status}</Badge> },
          ]}
          empty={<EmptyState icon={<UserPlus className="size-7" />} title="No users" />}
        />
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader title="Role permissions" description="What each role can see and do. Switch roles in the prototype bar to experience the difference." />
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-y border-road-200 bg-road-50 text-xs uppercase tracking-wide text-road-500">
                <th className="px-4 py-3 text-left font-semibold">Capability</th>
                {STAFF_ROLES.map((r) => (
                  <th key={r} className="px-2 py-3 text-center font-semibold" title={ROLE_DESCRIPTION[r]}>
                    {ROLE_LABEL[r]}
                  </th>
                ))}
                <th className="px-2 py-3 text-center font-semibold">Carrier</th>
                <th className="px-2 py-3 text-center font-semibold">Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-road-100">
              {MATRIX.map((m) => (
                <tr key={m.label}>
                  <td className="px-4 py-2.5 font-medium text-navy-900">{m.label}</td>
                  {STAFF_ROLES.map((r) => (
                    <td key={r} className="px-2 py-2.5">
                      <Mark on={m.permission ? STAFF_PERMISSIONS[r].includes(m.permission) : r !== 'accounting'} />
                    </td>
                  ))}
                  <td className="px-2 py-2.5"><Mark on={m.carrier} /></td>
                  <td className="px-2 py-2.5"><Mark on={m.driver} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="p-4 text-xs text-road-500">Carrier and driver access is scoped to their own company and assigned loads. Production enforcement: Spring Security with JWT sessions, MFA-ready, and audit logging of admin actions.</p>
      </Card>

      {inviting && (
        <InviteModal
          onClose={() => setInviting(false)}
          onInvite={(u) => {
            update((s) => upsertUser(s, u))
            toast({ title: `Invitation sent to ${u.email}`, description: 'Email invite with secure setup link (simulated).' })
            setInviting(false)
          }}
        />
      )}
    </>
  )
}

function InviteModal({ onClose, onInvite }: { onClose: () => void; onInvite: (u: StaffUser) => void }) {
  const [v, setV] = useState({ name: '', email: '', role: 'dispatcher' as StaffRole })
  const [err, setErr] = useState<Record<string, string>>({})
  return (
    <Modal
      open
      onClose={onClose}
      title="Invite staff user"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="accent"
            onClick={() => {
              const e: Record<string, string> = {}
              if (!v.name.trim()) e.name = 'Required'
              if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Valid email required'
              setErr(e)
              if (Object.keys(e).length) return
              onInvite({ id: uid('u'), name: v.name.trim(), email: v.email, role: v.role, status: 'invited', lastActiveAt: nowIso(), phone: '—' })
            }}
          >
            Send invite
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Full name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={err.name} />
        <Input label="Email" type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} error={err.email} />
        <Select label="Role" value={v.role} onChange={(e) => setV({ ...v, role: e.target.value as StaffRole })} options={STAFF_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} hint={ROLE_DESCRIPTION[v.role]} />
      </div>
    </Modal>
  )
}
