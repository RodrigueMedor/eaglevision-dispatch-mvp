import { useMemo, useState } from 'react'
import { Check, Download, FileText, FolderOpen, Upload, X } from 'lucide-react'
import type { Carrier, CarrierDocument, CarrierDocumentType, DocumentStatus, Driver, Truck } from '@/data/types'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Alert, EmptyState } from '@/components/ui/Feedback'
import { FileDrop } from '@/components/ui/FileDrop'
import { Input, Select } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { FilterBar, FilterSelect, SearchInput } from '@/components/ui/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { documentStatus } from '@/services/selectors'
import { date, daysUntil } from '@/lib/format'
import { DOCUMENT_STATUS } from '@/lib/status'
import { cn } from '@/lib/cn'

export const DOC_TYPE_LABEL: Record<CarrierDocumentType, string> = {
  w9: 'W-9',
  coi: 'Certificate of Insurance',
  'mc-authority': 'MC Authority',
  cdl: 'Driver License / CDL',
  registration: 'Registration',
  inspection: 'Inspection',
  ifta: 'IFTA',
  'medical-card': 'Medical Card',
  other: 'Other',
}

interface DocumentCenterProps {
  documents: CarrierDocument[]
  warnDays: number
  mode: 'portal' | 'admin'
  carriers: Carrier[]
  trucks: Truck[]
  drivers: Driver[]
  /** carrier context for portal uploads */
  carrierId?: string
  canUpload: boolean
  canReview?: boolean
  onUpload: (doc: Omit<CarrierDocument, 'id' | 'uploadedAt' | 'review'>) => void
  onReview?: (id: string, review: CarrierDocument['review']) => void
}

export function DocumentCenter({ documents, warnDays, mode, carriers, trucks, drivers, carrierId, canUpload, canReview, onUpload, onReview }: DocumentCenterProps) {
  const toast = useToast()
  const [tab, setTab] = useState<'all' | DocumentStatus>('all')
  const [q, setQ] = useState('')
  const [carrierFilter, setCarrierFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)

  const withStatus = useMemo(() => documents.map((d) => ({ ...d, status: documentStatus(d, warnDays) })), [documents, warnDays])
  const counts = (s: DocumentStatus) => withStatus.filter((d) => d.status === s).length

  const rows = withStatus.filter(
    (d) =>
      (tab === 'all' || d.status === tab) &&
      (!carrierFilter || d.carrierId === carrierFilter) &&
      (!typeFilter || d.type === typeFilter) &&
      (!q || `${d.name} ${d.subject} ${carriers.find((c) => c.id === d.carrierId)?.legalName ?? ''}`.toLowerCase().includes(q.toLowerCase())),
  )

  const attention = withStatus.filter((d) => d.status === 'expired' || d.status === 'expiring').sort((a, b) => (a.expiresAt ?? '').localeCompare(b.expiresAt ?? ''))

  type Row = (typeof withStatus)[number]
  const columns: Column<Row>[] = [
    {
      key: 'name',
      header: 'Document',
      sortValue: (d) => d.name,
      render: (d) => (
        <div className="flex items-center gap-3">
          <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', d.status === 'expired' ? 'bg-red-50 text-red-600' : d.status === 'expiring' ? 'bg-amber-50 text-amber-700' : 'bg-navy-50 text-navy-700')}>
            <FileText className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{d.name}</p>
            {mode === 'admin' && <p className="truncate text-xs text-road-500">{carriers.find((c) => c.id === d.carrierId)?.legalName}</p>}
          </div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (d) => DOC_TYPE_LABEL[d.type], hideBelow: 'lg', sortValue: (d) => d.type },
    { key: 'subject', header: 'Truck / Driver', render: (d) => d.subject, sortValue: (d) => d.subject },
    { key: 'uploaded', header: 'Uploaded', render: (d) => date(d.uploadedAt), sortValue: (d) => d.uploadedAt, hideBelow: 'md' },
    {
      key: 'expires',
      header: 'Expires',
      sortValue: (d) => d.expiresAt ?? '9999',
      render: (d) =>
        d.expiresAt ? (
          <span className={cn(d.status === 'expired' && 'font-semibold text-red-600', d.status === 'expiring' && 'font-semibold text-amber-700')}>
            {date(d.expiresAt)}
            {(d.status === 'expired' || d.status === 'expiring') && <span className="block text-xs font-medium">{daysUntil(d.expiresAt) < 0 ? `${Math.abs(daysUntil(d.expiresAt))} days ago` : `in ${daysUntil(d.expiresAt)} days`}</span>}
          </span>
        ) : (
          <span className="text-road-400">No expiry</span>
        ),
    },
    { key: 'status', header: 'Status', render: (d) => <StatusBadge kind="document" value={d.status} />, sortValue: (d) => d.status },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      mobile: true,
      render: (d) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {canReview && d.review === 'pending' && onReview && (
            <>
              <Button size="xs" variant="success" icon={<Check className="size-3.5" />} onClick={() => { onReview(d.id, 'approved'); toast({ title: 'Document approved', description: d.name }) }}>
                Approve
              </Button>
              <Button size="xs" variant="outline" icon={<X className="size-3.5" />} onClick={() => { onReview(d.id, 'rejected'); toast({ title: 'Document rejected', description: 'Carrier notified to re-upload (simulated).', tone: 'warning' }) }}>
                Reject
              </Button>
            </>
          )}
          {d.review === 'rejected' && <Badge tone="danger" size="sm">Rejected</Badge>}
          <Button size="xs" variant="ghost" icon={<Download className="size-3.5" />} aria-label={`Download ${d.name}`} onClick={() => toast({ title: `Downloading ${d.name}`, description: 'Demo — no real file.', tone: 'info' })} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {attention.length > 0 && (
        <Alert
          tone={attention.some((d) => d.status === 'expired') ? 'danger' : 'warning'}
          title={`${attention.length} document${attention.length === 1 ? '' : 's'} need${attention.length === 1 ? 's' : ''} attention`}
          action={canUpload && <Button size="sm" variant="primary" icon={<Upload className="size-4" />} onClick={() => setUploadOpen(true)}>Upload renewal</Button>}
        >
          {attention
            .slice(0, 3)
            .map((d) => `${d.name} (${d.subject}) — ${d.status === 'expired' ? 'expired' : 'expires'} ${date(d.expiresAt)}`)
            .join(' · ')}
          {attention.length > 3 && ` · +${attention.length - 3} more`}
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(['valid', 'expiring', 'expired', 'pending'] as DocumentStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setTab(tab === s ? 'all' : s)}
            className={cn('rounded-xl border bg-white p-4 text-left transition-shadow hover:shadow-card', tab === s ? 'border-navy-900 ring-1 ring-navy-900' : 'border-road-200')}
          >
            <StatusBadge kind="document" value={s} />
            <p className="mt-2 font-display text-2xl font-bold text-navy-900">{counts(s)}</p>
          </button>
        ))}
      </div>

      <Card padded={false}>
        <div className="space-y-3 p-4">
          <Tabs
            value={tab}
            onChange={(v) => setTab(v as typeof tab)}
            tabs={[{ id: 'all', label: 'All', count: withStatus.length }, ...(['valid', 'expiring', 'expired', 'pending'] as DocumentStatus[]).map((s) => ({ id: s, label: DOCUMENT_STATUS[s].label, count: counts(s) }))]}
          />
          <FilterBar>
            <SearchInput value={q} onChange={setQ} placeholder="Search documents…" className="sm:w-72" />
            {mode === 'admin' && <FilterSelect label="Carrier" value={carrierFilter} onChange={setCarrierFilter} options={carriers.map((c) => ({ value: c.id, label: c.legalName }))} />}
            <FilterSelect label="Type" value={typeFilter} onChange={setTypeFilter} options={Object.entries(DOC_TYPE_LABEL).map(([value, label]) => ({ value, label }))} />
            {canUpload && (
              <Button className="sm:ml-auto" variant="accent" icon={<Upload className="size-4" />} onClick={() => setUploadOpen(true)}>
                Upload document
              </Button>
            )}
          </FilterBar>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(d) => d.id}
          initialSort={{ key: 'expires', dir: 'asc' }}
          mobileAside={(d) => <StatusBadge kind="document" value={d.status} size="sm" />}
          empty={<EmptyState icon={<FolderOpen className="size-7" />} title="No documents match" description="Try a different filter or upload a new document." />}
        />
      </Card>

      {uploadOpen && (
        <UploadDocumentModal
          onClose={() => setUploadOpen(false)}
          mode={mode}
          carriers={carriers}
          trucks={trucks}
          drivers={drivers}
          carrierId={carrierId}
          onSubmit={(doc) => {
            onUpload(doc)
            setUploadOpen(false)
            toast({ title: 'Document uploaded', description: `${doc.name} is pending review by dispatch.` })
          }}
        />
      )}
    </div>
  )
}

function UploadDocumentModal({ onClose, mode, carriers, trucks, drivers, carrierId, onSubmit }: { onClose: () => void; mode: 'portal' | 'admin'; carriers: Carrier[]; trucks: Truck[]; drivers: Driver[]; carrierId?: string; onSubmit: (doc: Omit<CarrierDocument, 'id' | 'uploadedAt' | 'review'>) => void }) {
  const [carrier, setCarrier] = useState(carrierId ?? carriers[0]?.id ?? '')
  const [type, setType] = useState<CarrierDocumentType>('coi')
  const [subject, setSubject] = useState('company')
  const [expires, setExpires] = useState('')
  const [file, setFile] = useState<string>()
  const [error, setError] = useState<string>()

  const carrierTrucks = trucks.filter((t) => t.carrierId === carrier)
  const carrierDrivers = drivers.filter((d) => d.carrierId === carrier)
  const subjects = [
    { value: 'company', label: 'Company' },
    ...carrierTrucks.map((t) => ({ value: `truck:${t.id}`, label: `Truck ${t.unitNumber}` })),
    ...carrierDrivers.map((d) => ({ value: `driver:${d.id}`, label: `Driver ${d.name}` })),
  ]

  const submit = () => {
    if (!file) return setError('Choose a file')
    const [kind, id] = subject.split(':')
    onSubmit({
      carrierId: carrier,
      type,
      name: DOC_TYPE_LABEL[type],
      subject: subjects.find((s) => s.value === subject)?.label ?? 'Company',
      truckId: kind === 'truck' ? id : undefined,
      driverId: kind === 'driver' ? id : undefined,
      expiresAt: expires ? new Date(expires).toISOString() : undefined,
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Upload document"
      description="New uploads are reviewed by the dispatch team before they are marked valid."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={submit}>
            Upload
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {mode === 'admin' && (
          <Select label="Carrier" value={carrier} onChange={(e) => { setCarrier(e.target.value); setSubject('company') }} options={carriers.map((c) => ({ value: c.id, label: c.legalName }))} wrapperClassName="sm:col-span-2" />
        )}
        <Select label="Document type" value={type} onChange={(e) => setType(e.target.value as CarrierDocumentType)} options={Object.entries(DOC_TYPE_LABEL).map(([value, label]) => ({ value, label }))} />
        <Select label="Applies to" value={subject} onChange={(e) => setSubject(e.target.value)} options={subjects} />
        <Input label="Expiration date" type="date" value={expires} onChange={(e) => setExpires(e.target.value)} hint="Leave blank if it does not expire" wrapperClassName="sm:col-span-2" />
        <div className="sm:col-span-2">
          <FileDrop label={DOC_TYPE_LABEL[type]} value={file} onChange={(f) => { setFile(f); setError(undefined) }} error={error} sampleName={`${DOC_TYPE_LABEL[type].replace(/\W+/g, '_')}_renewal.pdf`} />
        </div>
      </div>
    </Modal>
  )
}
