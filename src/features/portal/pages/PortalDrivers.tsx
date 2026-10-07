import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import type { Driver } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { usePortalActor } from '@/store/hooks'
import { upsertDriver } from '@/services/commands'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Feedback'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/components/ui/Toast'
import { DriverFormModal } from '@/features/shared/FleetForms'
import { driverColumns } from '@/features/shared/driverColumns'

export function PortalDrivers() {
  const { state, update } = useDemo()
  const actor = usePortalActor()
  const toast = useToast()
  const [editing, setEditing] = useState<Driver | 'new' | null>(null)
  const drivers = state.drivers.filter((d) => d.carrierId === actor.carrier.id)

  return (
    <>
      <PageHeader
        title="Drivers"
        description="Drivers get limited portal access to their own loads, documents and messages."
        actions={
          <Button variant="accent" icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
            Add driver
          </Button>
        }
      />
      <Card padded={false}>
        <DataTable
          columns={driverColumns(state, setEditing)}
          rows={drivers}
          rowKey={(d) => d.id}
          mobileAside={(d) => <StatusBadge kind="driver" value={d.status} size="sm" />}
          empty={<EmptyState icon={<Users className="size-7" />} title="No drivers yet" action={<Button onClick={() => setEditing('new')}>Add driver</Button>} />}
        />
      </Card>
      {editing && (
        <DriverFormModal
          driver={editing === 'new' ? undefined : editing}
          carrierId={actor.carrier.id}
          trucks={state.trucks}
          onClose={() => setEditing(null)}
          onSave={(d) => {
            update((s) => upsertDriver(s, d))
            toast({ title: editing === 'new' ? 'Driver added' : 'Driver updated', description: editing === 'new' ? `Portal invite sent to ${d.phone} by SMS (simulated).` : d.name })
            setEditing(null)
          }}
        />
      )}
    </>
  )
}
