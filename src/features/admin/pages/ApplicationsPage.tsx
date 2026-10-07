import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import type { ApplicationStatus, CarrierApplication } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Feedback'
import { FilterBar, PageHeader, SearchInput } from '@/components/ui/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { userName } from '@/services/selectors'
import { equipmentLabel } from '@/lib/equipment'
import { relative } from '@/lib/format'
import { APPLICATION_STATUS } from '@/lib/status'

const ORDER: ApplicationStatus[] = ['submitted', 'under-review', 'info-required', 'approved', 'rejected', 'draft']

export function ApplicationsPage() {
  const { state } = useDemo()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'all' | ApplicationStatus>('all')
  const [q, setQ] = useState('')
  const apps = state.applications
  const rows = apps.filter((a) => (tab === 'all' || a.status === tab) && (!q || `${a.id} ${a.company.legalName} ${a.company.dotNumber} ${a.company.mcNumber}`.toLowerCase().includes(q.toLowerCase())))

  const columns: Column<CarrierApplication>[] = [
    {
      key: 'company',
      header: 'Company',
      sortValue: (a) => a.company.legalName,
      render: (a) => (
        <div>
          <p className="font-semibold">{a.company.legalName}</p>
          <p className="text-xs text-road-500">
            {a.id} · {a.owner.firstName} {a.owner.lastName}
          </p>
        </div>
      ),
    },
    { key: 'dot', header: 'DOT / MC', render: (a) => <span className="text-xs">DOT {a.company.dotNumber}<br />{a.company.mcNumber}</span>, hideBelow: 'md' },
    {
      key: 'equipment',
      header: 'Equipment',
      render: (a) => (
        <div className="flex flex-wrap gap-1">
          {a.equipment.types.map((t) => (
            <Badge key={t} size="sm" tone={t === 'box-truck' ? 'warning' : 'neutral'}>
              {equipmentLabel(t)}
            </Badge>
          ))}
        </div>
      ),
    },
    { key: 'trucks', header: 'Trucks', render: (a) => a.equipment.truckCount, sortValue: (a) => a.equipment.truckCount, hideBelow: 'lg', align: 'right' },
    { key: 'docs', header: 'Documents', render: (a) => { const missing = a.documents.filter((d) => d.status === 'missing').length; return missing ? <Badge tone="warning" size="sm">{missing} missing</Badge> : <Badge tone="success" size="sm">Complete</Badge> }, hideBelow: 'md' },
    { key: 'reviewer', header: 'Reviewer', render: (a) => (a.reviewerId ? userName(state, a.reviewerId) : <span className="text-road-400">Unassigned</span>), hideBelow: 'xl' },
    { key: 'submitted', header: 'Submitted', render: (a) => relative(a.submittedAt), sortValue: (a) => a.submittedAt },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge kind="application" value={a.status} size="sm" />, sortValue: (a) => ORDER.indexOf(a.status) },
  ]

  return (
    <>
      <PageHeader title="Carrier Applications" description="Review onboarding applications, verify authority and insurance, and approve carriers." />
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ORDER.map((s) => (
          <button key={s} type="button" onClick={() => setTab(tab === s ? 'all' : s)} className={`rounded-xl border bg-white p-3 text-left ${tab === s ? 'border-navy-900 ring-1 ring-navy-900' : 'border-road-200'}`}>
            <StatusBadge kind="application" value={s} size="sm" />
            <p className="mt-1.5 font-display text-xl font-bold text-navy-900">{apps.filter((a) => a.status === s).length}</p>
          </button>
        ))}
      </div>
      <Card padded={false}>
        <div className="space-y-3 p-4">
          <Tabs value={tab} onChange={(v) => setTab(v as typeof tab)} tabs={[{ id: 'all', label: 'All', count: apps.length }, ...ORDER.map((s) => ({ id: s, label: APPLICATION_STATUS[s].label }))]} />
          <FilterBar>
            <SearchInput value={q} onChange={setQ} placeholder="Search company, DOT or MC…" className="sm:w-80" />
          </FilterBar>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(a) => a.id}
          onRowClick={(a) => navigate(`/admin/applications/${a.id}`)}
          initialSort={{ key: 'status', dir: 'asc' }}
          mobileAside={(a) => <StatusBadge kind="application" value={a.status} size="sm" />}
          empty={<EmptyState icon={<ClipboardList className="size-7" />} title="No applications" />}
        />
      </Card>
    </>
  )
}
