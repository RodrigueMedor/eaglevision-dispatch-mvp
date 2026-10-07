import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, BookmarkCheck, Eye, Handshake, Radio, UserPlus } from 'lucide-react'
import type { DemoState, LoadOpportunity } from '@/data/types'
import { useDemo } from '@/store/DemoStore'
import { useStaffActor } from '@/store/hooks'
import { assignOpportunity, negotiateOpportunity, nextLoadId, toggleSaveOpportunity } from '@/services/commands'
import { Button } from '@/components/ui/Button'
import { Card, DescriptionList } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Badge, SampleTag } from '@/components/ui/Badge'
import { Alert, EmptyState, Stars } from '@/components/ui/Feedback'
import { Input, Select } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { FilterBar, FilterSelect, PageHeader, SearchInput } from '@/components/ui/PageHeader'
import { useToast } from '@/components/ui/Toast'
import { EQUIPMENT, equipmentLabel } from '@/lib/equipment'
import { date, lbs, miles, money, ratePerMile } from '@/lib/format'

export function LoadBoardPage() {
  const { state, update } = useDemo()
  const actor = useStaffActor()
  const toast = useToast()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [equipment, setEquipment] = useState('')
  const [source, setSource] = useState('')
  const [minRpm, setMinRpm] = useState('')
  const [savedOnly, setSavedOnly] = useState(false)
  const [viewing, setViewing] = useState<LoadOpportunity | null>(null)
  const [assigning, setAssigning] = useState<LoadOpportunity | null>(null)
  const [negotiating, setNegotiating] = useState<LoadOpportunity | null>(null)

  const rows = state.opportunities.filter(
    (o) =>
      (!equipment || o.equipment === equipment) &&
      (!source || o.source === source) &&
      (!minRpm || o.rate / o.miles >= Number(minRpm)) &&
      (!savedOnly || o.saved) &&
      (!q || `${o.origin.city} ${o.origin.state} ${o.destination.city} ${o.destination.state} ${o.broker}`.toLowerCase().includes(q.toLowerCase())),
  )

  const columns: Column<LoadOpportunity>[] = [
    { key: 'lane', header: 'Origin → Destination', render: (o) => <div><p className="whitespace-nowrap font-semibold">{o.origin.city}, {o.origin.state} → {o.destination.city}, {o.destination.state}</p><p className="text-xs text-road-500">{o.id} · posted {o.postedMinutesAgo}m ago</p></div> },
    { key: 'pickup', header: 'Pickup', render: (o) => date(o.pickupDate), sortValue: (o) => o.pickupDate, hideBelow: 'md' },
    { key: 'equipment', header: 'Equipment', render: (o) => <Badge size="sm" tone={o.equipment === 'box-truck' ? 'warning' : 'neutral'}>{equipmentLabel(o.equipment)}</Badge>, sortValue: (o) => o.equipment },
    { key: 'miles', header: 'Miles', render: (o) => miles(o.miles), sortValue: (o) => o.miles, align: 'right', hideBelow: 'xl' },
    { key: 'weight', header: 'Weight', render: (o) => lbs(o.weightLbs), sortValue: (o) => o.weightLbs, align: 'right', hideBelow: 'xl' },
    { key: 'rate', header: 'Rate', render: (o) => <span className="font-semibold">{money(o.rate)}</span>, sortValue: (o) => o.rate, align: 'right' },
    { key: 'rpm', header: 'Rate/Mile', render: (o) => <span className={o.rate / o.miles >= 3 ? 'font-semibold text-emerald-700' : ''}>{ratePerMile(o.rate, o.miles)}</span>, sortValue: (o) => o.rate / o.miles, align: 'right' },
    { key: 'broker', header: 'Broker · Rating', sortValue: (o) => o.brokerRating, render: (o) => <div className="min-w-36"><p className="truncate">{o.broker}</p><p className="flex items-center gap-2 text-xs text-road-500"><Stars value={o.brokerRating} /> {o.daysToPay}-day pay</p></div> },
    { key: 'source', header: 'Source', render: (o) => <Badge size="sm" tone="info">{o.source} · demo</Badge>, hideBelow: 'xl' },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (o) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="xs" variant="ghost" icon={<Eye className="size-3.5" />} onClick={() => setViewing(o)} aria-label="View" title="View" />
          <Button
            size="xs"
            variant="ghost"
            icon={o.saved ? <BookmarkCheck className="size-3.5 text-amber-600" /> : <Bookmark className="size-3.5" />}
            aria-label={o.saved ? 'Unsave' : 'Save'}
            title={o.saved ? 'Saved' : 'Save'}
            onClick={() => {
              update((s) => toggleSaveOpportunity(s, o.id))
              toast({ title: o.saved ? 'Removed from saved' : 'Load saved', tone: 'info' })
            }}
          />
          <Button size="xs" variant="outline" icon={<Handshake className="size-3.5" />} onClick={() => setNegotiating(o)} disabled={!!o.assignedLoadId} title="Negotiate">
            <span className="hidden 2xl:inline">Negotiate</span>
          </Button>
          {o.assignedLoadId ? (
            <Button size="xs" variant="secondary" to={`/admin/loads/${o.assignedLoadId}`}>
              {o.assignedLoadId}
            </Button>
          ) : (
            <Button size="xs" variant="primary" icon={<UserPlus className="size-3.5" />} onClick={() => setAssigning(o)}>
              Assign
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Load Board"
        eyebrow={<SampleTag>Sample / demo load data</SampleTag>}
        description="Preview of a future DAT / Truckstop integration: search freight, negotiate and assign to carriers in one place."
        actions={<Button to="/admin/integrations" variant="outline" icon={<Radio className="size-4" />}>Integration status</Button>}
      />
      <Alert tone="demo" className="mb-5" title="SAMPLE / DEMO LOAD DATA — not live postings">
        DAT and Truckstop are shown as integration-ready only. Live load search requires authorized API credentials and commercial access from each provider. No data is scraped from any service.
      </Alert>
      <Card padded={false}>
        <div className="p-4">
          <FilterBar>
            <SearchInput value={q} onChange={setQ} placeholder="City, state or broker…" className="sm:w-64" />
            <FilterSelect label="Equipment" value={equipment} onChange={setEquipment} options={EQUIPMENT.map((e) => ({ value: e.type, label: e.label }))} />
            <FilterSelect label="Source" value={source} onChange={setSource} options={[{ value: 'DAT', label: 'DAT (demo)' }, { value: 'Truckstop', label: 'Truckstop (demo)' }]} />
            <FilterSelect label="Min $/mi" value={minRpm} onChange={setMinRpm} options={['2.00', '2.50', '3.00', '3.50'].map((v) => ({ value: v, label: `$${v}+` }))} />
            <Button size="sm" variant={savedOnly ? 'primary' : 'outline'} icon={<Bookmark className="size-4" />} onClick={() => setSavedOnly((v) => !v)}>
              Saved ({state.opportunities.filter((o) => o.saved).length})
            </Button>
          </FilterBar>
        </div>
        <DataTable
          dense
          columns={columns}
          rows={rows}
          rowKey={(o) => o.id}
          onRowClick={setViewing}
          initialSort={{ key: 'rpm', dir: 'desc' }}
          mobileTitle={(o) => <span>{o.origin.city} → {o.destination.city}</span>}
          mobileAside={(o) => <span className="text-sm font-bold">{money(o.rate)}</span>}
          empty={<EmptyState icon={<Radio className="size-7" />} title="No loads match" description="Adjust filters to see more sample loads." />}
        />
      </Card>

      {viewing && (
        <Modal
          open
          onClose={() => setViewing(null)}
          title={`${viewing.origin.city}, ${viewing.origin.state} → ${viewing.destination.city}, ${viewing.destination.state}`}
          description={`${viewing.id} · ${viewing.source} (demo data)`}
          footer={
            !viewing.assignedLoadId && (
              <>
                <Button variant="outline" icon={<Handshake className="size-4" />} onClick={() => { setNegotiating(viewing); setViewing(null) }}>
                  Negotiate
                </Button>
                <Button variant="accent" icon={<UserPlus className="size-4" />} onClick={() => { setAssigning(viewing); setViewing(null) }}>
                  Assign to carrier
                </Button>
              </>
            )
          }
        >
          <DescriptionList
            items={[
              { label: 'Pickup date', value: date(viewing.pickupDate) },
              { label: 'Equipment', value: equipmentLabel(viewing.equipment) },
              { label: 'Miles', value: miles(viewing.miles) },
              { label: 'Weight', value: lbs(viewing.weightLbs) },
              { label: 'Rate', value: money(viewing.rate) },
              { label: 'Rate / mile', value: ratePerMile(viewing.rate, viewing.miles) },
              { label: 'Broker', value: viewing.broker },
              { label: 'Broker rating', value: <Stars value={viewing.brokerRating} /> },
              { label: 'Days to pay', value: `${viewing.daysToPay} days` },
              { label: 'Posted', value: `${viewing.postedMinutesAgo} minutes ago` },
            ]}
          />
        </Modal>
      )}

      {negotiating && (
        <NegotiateModal
          opp={negotiating}
          onClose={() => setNegotiating(null)}
          onAgree={(rate) => {
            update((s) => negotiateOpportunity(s, negotiating.id, rate))
            toast({ title: `Rate agreed: ${money(rate)}`, description: `${ratePerMile(rate, negotiating.miles)} — ready to assign.` })
            setNegotiating(null)
          }}
        />
      )}

      {assigning && (
        <AssignOpportunityModal
          state={state}
          opp={assigning}
          onClose={() => setAssigning(null)}
          onAssign={(a) => {
            const loadId = nextLoadId(state)
            update((s) => assignOpportunity(s, assigning.id, a, actor.user.name).state)
            toast({ title: `Load ${loadId} created`, description: 'Sent to carrier for review.' })
            setAssigning(null)
            navigate(`/admin/loads/${loadId}`)
          }}
        />
      )}
    </>
  )

}

function AssignOpportunityModal({ state, opp, onClose, onAssign }: { state: DemoState; opp: LoadOpportunity; onClose: () => void; onAssign: (a: { carrierId: string; truckId?: string; driverId?: string }) => void }) {
  const matches = state.trucks.filter((t) => t.equipment === opp.equipment && state.carriers.find((c) => c.id === t.carrierId)?.status === 'active')
  const [truckId, setTruckId] = useState(matches.find((t) => t.status === 'available')?.id ?? matches[0]?.id ?? '')
  const truck = state.trucks.find((t) => t.id === truckId)
  return (
    <Modal
      open
      onClose={onClose}
      title="Assign to carrier"
      description={`${opp.origin.city} → ${opp.destination.city} · ${equipmentLabel(opp.equipment)} · ${money(opp.rate)}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" disabled={!truck} onClick={() => truck && onAssign({ carrierId: truck.carrierId, truckId: truck.id, driverId: truck.driverId })}>
            Create load & offer to carrier
          </Button>
        </>
      }
    >
      {matches.length === 0 ? (
        <Alert tone="warning">No {equipmentLabel(opp.equipment).toLowerCase()} trucks in the network yet.</Alert>
      ) : (
        <Select
          label="Truck"
          value={truckId}
          onChange={(e) => setTruckId(e.target.value)}
          options={matches.map((t) => ({ value: t.id, label: `${t.unitNumber} · ${state.carriers.find((c) => c.id === t.carrierId)?.legalName} · ${t.status}` }))}
        />
      )}
      <p className="mt-3 text-xs text-road-500">Creates a platform load with status “Review”. The carrier accepts or declines from their portal.</p>
    </Modal>
  )
}

function NegotiateModal({ opp, onClose, onAgree }: { opp: LoadOpportunity; onClose: () => void; onAgree: (rate: number) => void }) {
  const [ask, setAsk] = useState(String(Math.round(opp.rate * 1.1)))
  const [reply, setReply] = useState<{ rate: number; text: string } | null>(null)
  const askNum = Number(ask) || 0

  const send = () => {
    // Simulated broker response: accepts up to +6%, otherwise counters halfway.
    if (askNum <= opp.rate * 1.06) setReply({ rate: askNum, text: `Broker accepted ${money(askNum)}.` })
    else {
      const counter = Math.round((opp.rate + askNum) / 2 / 5) * 5
      setReply({ rate: counter, text: `Broker countered at ${money(counter)} (${ratePerMile(counter, opp.miles)}).` })
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Negotiate rate"
      description={`${opp.broker} · posted ${money(opp.rate)} (${ratePerMile(opp.rate, opp.miles)})`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {reply ? (
            <Button variant="success" onClick={() => onAgree(reply.rate)}>
              Accept {money(reply.rate)}
            </Button>
          ) : (
            <Button variant="accent" onClick={send} disabled={askNum <= 0}>
              Send counter-offer
            </Button>
          )}
        </>
      }
    >
      <Input label="Your counter-offer" type="number" leading="$" value={ask} onChange={(e) => { setAsk(e.target.value); setReply(null) }} hint={askNum ? `${ratePerMile(askNum, opp.miles)} · ${Math.round(((askNum - opp.rate) / opp.rate) * 100)}% vs. posted` : undefined} />
      {reply && <Alert tone="success" className="mt-4">{reply.text}</Alert>}
      <p className="mt-4 text-xs text-road-500">Simulated broker response for demo purposes. Production negotiation happens by phone/email or the load board’s booking API where available.</p>
    </Modal>
  )
}
