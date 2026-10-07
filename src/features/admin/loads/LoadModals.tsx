import { useState } from 'react'
import type { DemoState, Load, LoadStatus, StopLocation } from '@/data/types'
import { BROKERS } from '@/data/seed/loads'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Form'
import { Alert } from '@/components/ui/Feedback'
import { dispatchers } from '@/services/selectors'
import type { LoadInput } from '@/services/commands'
import { EQUIPMENT, equipmentLabel } from '@/lib/equipment'
import { US_STATES } from '@/lib/states'
import { LOAD_FLOW, LOAD_STATUS } from '@/lib/status'
import { ratePerMile } from '@/lib/format'

type Errors = Record<string, string>

const toLocal = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` }
}

interface StopDraft {
  facility: string
  street: string
  city: string
  state: string
  zip: string
  date: string
  time: string
}

const stopDraft = (s?: StopLocation, offsetDays = 1): StopDraft => {
  const iso = s?.appointment ?? new Date(Date.now() + offsetDays * 86_400_000).toISOString()
  const { date, time } = toLocal(iso)
  return { facility: s?.facility ?? '', street: s?.street ?? '', city: s?.city ?? '', state: s?.state ?? '', zip: s?.zip ?? '', date, time: s ? time : '08:00' }
}

const stopFrom = (d: StopDraft, prev?: StopLocation): StopLocation => {
  const appointment = new Date(`${d.date}T${d.time || '08:00'}`).toISOString()
  const h = Number(d.time.split(':')[0] ?? 8)
  const f = (x: number) => `${((x + 11) % 12) + 1}:00 ${x < 12 || x === 24 ? 'AM' : 'PM'}`
  return { facility: d.facility, street: d.street, city: d.city, state: d.state, zip: d.zip, appointment, window: `${f(h)} – ${f((h + 2) % 24)}`, contact: prev?.contact ?? 'Shipping/Receiving', phone: prev?.phone ?? '(800) 555-0101' }
}

/** Create / edit a load. */
export function LoadFormModal({ state, load, onClose, onSave }: { state: DemoState; load?: Load; onClose: () => void; onSave: (input: LoadInput) => void }) {
  const [v, setV] = useState({
    equipment: load?.equipment ?? 'box-truck',
    carrierId: load?.carrierId ?? '',
    truckId: load?.truckId ?? '',
    driverId: load?.driverId ?? '',
    dispatcherId: load?.dispatcherId ?? state.session.staffUserId,
    broker: load?.broker.name ?? BROKERS[0]!.name,
    miles: String(load?.miles ?? ''),
    rate: String(load?.rate ?? ''),
    weightLbs: String(load?.weightLbs ?? ''),
    commodity: load?.commodity ?? '',
    reference: load?.reference ?? '',
  })
  const [pickup, setPickup] = useState(stopDraft(load?.pickup, 1))
  const [delivery, setDelivery] = useState(stopDraft(load?.delivery, 2))
  const [errors, setErrors] = useState<Errors>({})
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value, ...(k === 'carrierId' ? { truckId: '', driverId: '' } : {}) }))

  const save = () => {
    const e: Errors = {}
    if (!pickup.city.trim()) e['pickup.city'] = 'Required'
    if (!pickup.state) e['pickup.state'] = 'Required'
    if (!delivery.city.trim()) e['delivery.city'] = 'Required'
    if (!delivery.state) e['delivery.state'] = 'Required'
    if (!pickup.date) e['pickup.date'] = 'Required'
    if (!delivery.date) e['delivery.date'] = 'Required'
    if (pickup.date && delivery.date && new Date(`${delivery.date}T${delivery.time}`) <= new Date(`${pickup.date}T${pickup.time}`)) e['delivery.date'] = 'Delivery must be after pickup'
    if (!(Number(v.miles) > 0)) e.miles = 'Enter miles'
    if (!(Number(v.rate) > 0)) e.rate = 'Enter rate'
    if (!(Number(v.weightLbs) > 0)) e.weightLbs = 'Enter weight'
    if (!v.commodity.trim()) e.commodity = 'Required'
    setErrors(e)
    if (Object.keys(e).length) return
    const broker = BROKERS.find((b) => b.name === v.broker) ?? BROKERS[0]!
    onSave({
      equipment: v.equipment as Load['equipment'],
      carrierId: v.carrierId || undefined,
      truckId: v.truckId || undefined,
      driverId: v.driverId || undefined,
      dispatcherId: v.dispatcherId || undefined,
      broker,
      pickup: stopFrom({ ...pickup, facility: pickup.facility || 'Shipper' }, load?.pickup),
      delivery: stopFrom({ ...delivery, facility: delivery.facility || 'Receiver' }, load?.delivery),
      miles: Number(v.miles),
      rate: Number(v.rate),
      weightLbs: Number(v.weightLbs),
      commodity: v.commodity,
      reference: v.reference || `PO-${Math.floor(Math.random() * 900000 + 100000)}`,
      source: load?.source ?? 'manual',
    })
  }

  const stopFields = (label: 'pickup' | 'delivery', d: StopDraft, setD: (x: StopDraft) => void) => (
    <fieldset className="rounded-xl border border-road-200 p-4">
      <legend className="px-1 text-sm font-semibold text-navy-900">{label === 'pickup' ? 'Pickup' : 'Delivery'}</legend>
      <div className="grid gap-3 sm:grid-cols-4">
        <Input label="Facility" value={d.facility} onChange={(e) => setD({ ...d, facility: e.target.value })} wrapperClassName="sm:col-span-2" />
        <Input label="Street" value={d.street} onChange={(e) => setD({ ...d, street: e.target.value })} wrapperClassName="sm:col-span-2" />
        <Input label="City" required value={d.city} onChange={(e) => setD({ ...d, city: e.target.value })} error={errors[`${label}.city`]} wrapperClassName="sm:col-span-2" />
        <Select label="State" required value={d.state} onChange={(e) => setD({ ...d, state: e.target.value })} error={errors[`${label}.state`]} placeholder="—" options={US_STATES.map((s) => ({ value: s, label: s }))} />
        <Input label="ZIP" value={d.zip} onChange={(e) => setD({ ...d, zip: e.target.value })} maxLength={5} />
        <Input label="Appointment date" required type="date" value={d.date} onChange={(e) => setD({ ...d, date: e.target.value })} error={errors[`${label}.date`]} wrapperClassName="sm:col-span-2" />
        <Input label="Time" type="time" value={d.time} onChange={(e) => setD({ ...d, time: e.target.value })} wrapperClassName="sm:col-span-2" />
      </div>
    </fieldset>
  )

  const carrierTrucks = state.trucks.filter((t) => t.carrierId === v.carrierId)
  const carrierDrivers = state.drivers.filter((d) => d.carrierId === v.carrierId)

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={load ? `Edit load ${load.id}` : 'Create load'}
      description="Manual entry — in production, loads can also be imported from approved load-board integrations."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={save}>
            {load ? 'Save changes' : 'Create load'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <Select label="Equipment" value={v.equipment} onChange={set('equipment')} options={EQUIPMENT.map((e) => ({ value: e.type, label: e.label }))} />
          <Select label="Broker" value={v.broker} onChange={set('broker')} options={BROKERS.map((b) => ({ value: b.name, label: b.name }))} wrapperClassName="sm:col-span-2" />
          <Select label="Dispatcher" value={v.dispatcherId} onChange={set('dispatcherId')} options={dispatchers(state).map((u) => ({ value: u.id, label: u.name }))} />
        </div>
        {stopFields('pickup', pickup, setPickup)}
        {stopFields('delivery', delivery, setDelivery)}
        <div className="grid gap-3 sm:grid-cols-4">
          <Input label="Miles" required type="number" value={v.miles} onChange={set('miles')} error={errors.miles} />
          <Input label="Rate" required type="number" leading="$" value={v.rate} onChange={set('rate')} error={errors.rate} hint={v.rate && v.miles ? ratePerMile(Number(v.rate), Number(v.miles)) : undefined} />
          <Input label="Weight (lbs)" required type="number" value={v.weightLbs} onChange={set('weightLbs')} error={errors.weightLbs} />
          <Input label="Reference / PO" value={v.reference} onChange={set('reference')} />
          <Input label="Commodity" required value={v.commodity} onChange={set('commodity')} error={errors.commodity} wrapperClassName="sm:col-span-4" />
        </div>
        <fieldset className="rounded-xl border border-dashed border-road-300 p-4">
          <legend className="px-1 text-sm font-semibold text-navy-900">Assignment (optional)</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <Select label="Carrier" value={v.carrierId} onChange={set('carrierId')} placeholder="Unassigned" options={state.carriers.filter((c) => c.status !== 'inactive').map((c) => ({ value: c.id, label: c.legalName }))} />
            <Select label="Truck" value={v.truckId} onChange={set('truckId')} placeholder="—" options={carrierTrucks.map((t) => ({ value: t.id, label: `${t.unitNumber} · ${equipmentLabel(t.equipment)} · ${t.status}` }))} disabled={!v.carrierId} />
            <Select label="Driver" value={v.driverId} onChange={set('driverId')} placeholder="—" options={carrierDrivers.map((d) => ({ value: d.id, label: d.name }))} disabled={!v.carrierId} />
          </div>
        </fieldset>
      </div>
    </Modal>
  )
}

/** Assign carrier / truck / driver — trucks are ranked by equipment match and availability. */
export function AssignModal({ state, load, onClose, onSave }: { state: DemoState; load: Load; onClose: () => void; onSave: (a: { carrierId: string; truckId?: string; driverId?: string }) => void }) {
  const [carrierId, setCarrierId] = useState(load.carrierId ?? '')
  const [truckId, setTruckId] = useState(load.truckId ?? '')
  const [driverId, setDriverId] = useState(load.driverId ?? '')
  const [error, setError] = useState('')

  const suggestions = state.trucks
    .filter((t) => t.equipment === load.equipment && t.status === 'available')
    .map((t) => ({ truck: t, carrier: state.carriers.find((c) => c.id === t.carrierId)! }))
    .filter((x) => x.carrier && x.carrier.status === 'active')

  const pick = (cid: string, tid?: string) => {
    setCarrierId(cid)
    setTruckId(tid ?? '')
    setDriverId(state.trucks.find((t) => t.id === tid)?.driverId ?? '')
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`Assign ${load.id}`}
      description={`${equipmentLabel(load.equipment)} · ${load.pickup.city}, ${load.pickup.state} → ${load.delivery.city}, ${load.delivery.state}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={() => {
              if (!carrierId) return setError('Select a carrier')
              onSave({ carrierId, truckId: truckId || undefined, driverId: driverId || undefined })
            }}
          >
            Assign
          </Button>
        </>
      }
    >
      {suggestions.length > 0 ? (
        <div className="mb-5">
          <p className="mb-2 text-sm font-semibold text-navy-900">Suggested matches · available {equipmentLabel(load.equipment).toLowerCase()} equipment</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggestions.map(({ truck, carrier }) => (
              <button
                key={truck.id}
                type="button"
                onClick={() => pick(carrier.id, truck.id)}
                className={`rounded-xl border p-3 text-left text-sm transition-colors ${truckId === truck.id ? 'border-navy-900 bg-navy-50 ring-1 ring-navy-900' : 'border-road-200 hover:border-road-400'}`}
              >
                <p className="font-semibold text-navy-900">
                  {truck.unitNumber} · {carrier.legalName}
                </p>
                <p className="text-xs text-road-500">
                  {truck.homeBase} · {state.drivers.find((d) => d.id === truck.driverId)?.name ?? 'No driver'} · prefers {carrier.preferredStates.slice(0, 4).join(', ')}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <Alert tone="info" className="mb-5">
          No available {equipmentLabel(load.equipment).toLowerCase()} trucks right now — you can still assign manually. Automated load matching is a planned enhancement.
        </Alert>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <Select label="Carrier" value={carrierId} onChange={(e) => pick(e.target.value)} error={error} placeholder="Select carrier" options={state.carriers.filter((c) => c.status !== 'inactive').map((c) => ({ value: c.id, label: c.legalName }))} />
        <Select label="Truck" value={truckId} onChange={(e) => pick(carrierId, e.target.value)} placeholder="—" disabled={!carrierId} options={state.trucks.filter((t) => t.carrierId === carrierId).map((t) => ({ value: t.id, label: `${t.unitNumber} · ${equipmentLabel(t.equipment)} · ${t.status}` }))} />
        <Select label="Driver" value={driverId} onChange={(e) => setDriverId(e.target.value)} placeholder="—" disabled={!carrierId} options={state.drivers.filter((d) => d.carrierId === carrierId).map((d) => ({ value: d.id, label: d.name }))} />
      </div>
    </Modal>
  )
}

export function StatusModal({ load, onClose, onSave }: { load: Load; onClose: () => void; onSave: (status: LoadStatus, note?: string) => void }) {
  const next = LOAD_FLOW[LOAD_FLOW.indexOf(load.status) + 1]
  const [status, setStatus] = useState<LoadStatus>(next ?? load.status)
  const [note, setNote] = useState('')
  return (
    <Modal
      open
      onClose={onClose}
      title={`Update status · ${load.id}`}
      description={`Current: ${LOAD_STATUS[load.status].label}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={() => onSave(status, note.trim() || undefined)} disabled={status === load.status}>
            Update status
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select label="New status" value={status} onChange={(e) => setStatus(e.target.value as LoadStatus)} options={LOAD_FLOW.map((s) => ({ value: s, label: `${LOAD_STATUS[s].label} — ${LOAD_STATUS[s].description}` }))} />
        <Textarea label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="e.g. Driver checked in at 8:42 AM" />
        <p className="text-xs text-road-500">The carrier is notified in-app (and by SMS/email per notification settings).</p>
      </div>
    </Modal>
  )
}
