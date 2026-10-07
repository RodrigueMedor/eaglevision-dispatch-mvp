import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import type { Driver } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { upsertDriver } from '@/services/commands'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Feedback'
import { FilterBar, FilterSelect, PageHeader, SearchInput } from '@/components/ui/PageHeader'
import { useToast } from '@/components/ui/Toast'
import { DRIVER_STATUS } from '@/lib/status'
import { DriverFormModal } from '@/features/shared/FleetForms'
import { driverColumns } from '@/features/shared/driverColumns'

export function DriversPage() {
  const { state, update } = useDemo()
  const actor = useStaffActor()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [carrier, setCarrier] = useState('')
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState<Driver | 'new' | null>(null)
  const canManage = actor.can('carriers.manage')
  const rows = state.drivers.filter((d) => (!carrier || d.carrierId === carrier) && (!status || d.status === status) && (!q || `${d.name} ${d.phone} ${d.email}`.toLowerCase().includes(q.toLowerCase())))

  return (
    <>
      <PageHeader
        title="Drivers"
        description="All drivers across carriers, with license status and current assignment."
        actions={canManage && <Button variant="accent" icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>Add driver</Button>}
      />
      <Card padded={false}>
        <div className="p-4">
          <FilterBar>
            <SearchInput value={q} onChange={setQ} placeholder="Search drivers…" className="sm:w-72" />
            <FilterSelect label="Carrier" value={carrier} onChange={setCarrier} options={state.carriers.map((c) => ({ value: c.id, label: c.legalName }))} />
            <FilterSelect label="Status" value={status} onChange={setStatus} options={Object.entries(DRIVER_STATUS).map(([value, m]) => ({ value, label: m.label }))} />
          </FilterBar>
        </div>
        <DataTable
          columns={driverColumns(state, canManage ? setEditing : undefined, true)}
          rows={rows}
          rowKey={(d) => d.id}
          mobileAside={(d) => <StatusBadge kind="driver" value={d.status} size="sm" />}
          empty={<EmptyState icon={<Users className="size-7" />} title="No drivers match" />}
        />
      </Card>
      {editing && (
        <DriverFormModal
          driver={editing === 'new' ? undefined : editing}
          carriers={state.carriers}
          trucks={state.trucks}
          onClose={() => setEditing(null)}
          onSave={(d) => {
            update((s) => upsertDriver(s, d))
            toast({ title: editing === 'new' ? 'Driver added' : 'Driver updated', description: d.name })
            setEditing(null)
          }}
        />
      )}
    </>
  )
}
