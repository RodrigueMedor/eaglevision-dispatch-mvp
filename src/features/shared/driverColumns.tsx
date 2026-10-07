import { Pencil } from 'lucide-react'
import type { DemoState, Driver } from '@/data/types'
import { truckUnit } from '@/services/selectors'
import { Button } from '@/components/ui/Button'
import type { Column } from '@/components/ui/DataTable'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Feedback'
import { date, daysUntil } from '@/lib/format'

export function driverColumns(state: DemoState, onEdit?: (d: Driver) => void, showCarrier = false): Column<Driver>[] {
  return [
    {
      key: 'name',
      header: 'Driver',
      sortValue: (d) => d.name,
      render: (d) => (
        <div className="flex items-center gap-3">
          <Avatar name={d.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{d.name}</p>
            <p className="truncate text-xs text-road-500">{showCarrier ? state.carriers.find((c) => c.id === d.carrierId)?.legalName : d.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (d) => d.phone, hideBelow: 'md' },
    { key: 'license', header: 'License', render: (d) => `${d.cdlClass === 'Non-CDL' ? 'Non-CDL' : `CDL-${d.cdlClass}`} · ${d.licenseState}` },
    {
      key: 'expires',
      header: 'License Expires',
      sortValue: (d) => d.licenseExpiresAt,
      render: (d) => {
        const days = daysUntil(d.licenseExpiresAt)
        return (
          <span className="flex flex-wrap items-center gap-2">
            {date(d.licenseExpiresAt)}
            {days < 0 ? <Badge tone="danger" size="sm">Expired</Badge> : days <= 30 ? <Badge tone="warning" size="sm">{days}d</Badge> : null}
          </span>
        )
      },
    },
    { key: 'truck', header: 'Truck', render: (d) => truckUnit(state, d.truckId) },
    { key: 'status', header: 'Status', render: (d) => <StatusBadge kind="driver" value={d.status} size="sm" />, sortValue: (d) => d.status },
    ...(onEdit
      ? [
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right' as const,
            render: (d: Driver) => (
              <Button size="xs" variant="ghost" icon={<Pencil className="size-3.5" />} onClick={() => onEdit(d)}>
                Edit
              </Button>
            ),
          },
        ]
      : []),
  ]
}
