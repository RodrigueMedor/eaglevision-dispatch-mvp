import { useState } from 'react'
import type { Carrier, Driver, EquipmentType, Truck } from '@/data/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Form'
import { EquipmentGlyph } from '@/components/brand/EquipmentGlyph'
import { EQUIPMENT } from '@/lib/equipment'
import { TRUCK_STATUS } from '@/lib/status'
import { US_STATES } from '@/lib/states'
import { uid } from '@/lib/id'
import { daysFromNow } from '@/lib/dates'

type Errors = Record<string, string>

export function TruckFormModal({ truck, carriers, carrierId, drivers, onClose, onSave }: { truck?: Truck; carriers?: Carrier[]; carrierId?: string; drivers: Driver[]; onClose: () => void; onSave: (t: Truck) => void }) {
  const [v, setV] = useState({
    carrierId: truck?.carrierId ?? carrierId ?? carriers?.[0]?.id ?? '',
    unitNumber: truck?.unitNumber ?? '',
    equipment: truck?.equipment ?? ('box-truck' as EquipmentType),
    year: String(truck?.year ?? ''),
    make: truck?.make ?? '',
    model: truck?.model ?? '',
    vin: truck?.vin ?? '',
    dimensions: truck?.dimensions ?? '',
    capacityLbs: String(truck?.capacityLbs ?? ''),
    status: truck?.status ?? ('available' as Truck['status']),
    driverId: truck?.driverId ?? '',
    homeBase: truck?.homeBase ?? '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }))
  const carrierDrivers = drivers.filter((d) => d.carrierId === v.carrierId)

  const save = () => {
    const e: Errors = {}
    if (!v.unitNumber.trim()) e.unitNumber = 'Required'
    if (!/^(19|20)\d{2}$/.test(v.year)) e.year = 'Enter a 4-digit year'
    if (!v.make.trim()) e.make = 'Required'
    if (!v.model.trim()) e.model = 'Required'
    if (v.vin && v.vin.length !== 17) e.vin = 'VIN must be 17 characters'
    if (!(Number(v.capacityLbs) > 0)) e.capacityLbs = 'Enter capacity in lbs'
    setErrors(e)
    if (Object.keys(e).length) return
    onSave({
      id: truck?.id ?? uid('t'),
      carrierId: v.carrierId,
      unitNumber: v.unitNumber.trim(),
      equipment: v.equipment,
      year: Number(v.year),
      make: v.make.trim(),
      model: v.model.trim(),
      vin: v.vin || 'VIN PENDING',
      dimensions: v.dimensions,
      capacityLbs: Number(v.capacityLbs),
      status: v.status,
      driverId: v.driverId || undefined,
      homeBase: v.homeBase,
      odometer: truck?.odometer ?? 0,
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={truck ? `Edit truck ${truck.unitNumber}` : 'Add truck'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={save}>
            {truck ? 'Save changes' : 'Add truck'}
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-xl bg-road-50 p-4">
        <EquipmentGlyph type={v.equipment} className="mx-auto max-w-xs" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {carriers && <Select label="Carrier" value={v.carrierId} onChange={set('carrierId')} options={carriers.map((c) => ({ value: c.id, label: c.legalName }))} wrapperClassName="sm:col-span-3" />}
        <Input label="Truck / unit #" required value={v.unitNumber} onChange={set('unitNumber')} error={errors.unitNumber} placeholder="EVT-105" />
        <Select label="Equipment type" value={v.equipment} onChange={set('equipment')} options={EQUIPMENT.map((e) => ({ value: e.type, label: e.label }))} />
        <Select label="Status" value={v.status} onChange={set('status')} options={Object.entries(TRUCK_STATUS).map(([value, m]) => ({ value, label: m.label }))} />
        <Input label="Year" required value={v.year} onChange={set('year')} error={errors.year} inputMode="numeric" maxLength={4} />
        <Input label="Make" required value={v.make} onChange={set('make')} error={errors.make} />
        <Input label="Model" required value={v.model} onChange={set('model')} error={errors.model} />
        <Input label="VIN" value={v.vin} onChange={(e) => setV((x) => ({ ...x, vin: e.target.value.toUpperCase() }))} error={errors.vin} maxLength={17} wrapperClassName="sm:col-span-2" placeholder="17 characters" />
        <Input label="Capacity (lbs)" required value={v.capacityLbs} onChange={set('capacityLbs')} error={errors.capacityLbs} inputMode="numeric" />
        <Input label="Dimensions" value={v.dimensions} onChange={set('dimensions')} placeholder={`26' × 102" × 102"`} />
        <Input label="Home base" value={v.homeBase} onChange={set('homeBase')} placeholder="Orlando, FL" />
        <Select label="Assigned driver" value={v.driverId} onChange={set('driverId')} placeholder="Unassigned" options={carrierDrivers.map((d) => ({ value: d.id, label: d.name }))} />
      </div>
    </Modal>
  )
}

export function DriverFormModal({ driver, carriers, carrierId, trucks, onClose, onSave }: { driver?: Driver; carriers?: Carrier[]; carrierId?: string; trucks: Truck[]; onClose: () => void; onSave: (d: Driver) => void }) {
  const [v, setV] = useState({
    carrierId: driver?.carrierId ?? carrierId ?? carriers?.[0]?.id ?? '',
    name: driver?.name ?? '',
    phone: driver?.phone ?? '',
    email: driver?.email ?? '',
    cdlClass: driver?.cdlClass ?? ('Non-CDL' as Driver['cdlClass']),
    licenseState: driver?.licenseState ?? 'FL',
    licenseExpiresAt: (driver?.licenseExpiresAt ?? daysFromNow(365)).slice(0, 10),
    truckId: driver?.truckId ?? '',
    status: driver?.status ?? ('available' as Driver['status']),
  })
  const [errors, setErrors] = useState<Errors>({})
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }))

  const save = () => {
    const e: Errors = {}
    if (!v.name.trim()) e.name = 'Required'
    if (v.phone.replace(/\D/g, '').length !== 10) e.phone = '10-digit phone'
    if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Valid email required'
    setErrors(e)
    if (Object.keys(e).length) return
    onSave({
      id: driver?.id ?? uid('d'),
      carrierId: v.carrierId,
      name: v.name.trim(),
      phone: v.phone,
      email: v.email,
      cdlClass: v.cdlClass,
      licenseState: v.licenseState,
      licenseExpiresAt: new Date(v.licenseExpiresAt).toISOString(),
      status: v.status,
      truckId: v.truckId || undefined,
      hiredAt: driver?.hiredAt ?? new Date().toISOString(),
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={driver ? `Edit ${driver.name}` : 'Add driver'}
      description="Drivers get limited portal access to their assigned loads (invite simulated)."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={save}>
            {driver ? 'Save changes' : 'Add & invite driver'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {carriers && <Select label="Carrier" value={v.carrierId} onChange={set('carrierId')} options={carriers.map((c) => ({ value: c.id, label: c.legalName }))} wrapperClassName="sm:col-span-2" />}
        <Input label="Full name" required value={v.name} onChange={set('name')} error={errors.name} wrapperClassName="sm:col-span-2" />
        <Input label="Mobile phone" required value={v.phone} onChange={set('phone')} error={errors.phone} type="tel" />
        <Input label="Email" required value={v.email} onChange={set('email')} error={errors.email} type="email" />
        <Select label="License class" value={v.cdlClass} onChange={set('cdlClass')} options={['A', 'B', 'Non-CDL'].map((c) => ({ value: c, label: c === 'Non-CDL' ? 'Non-CDL' : `CDL Class ${c}` }))} />
        <Select label="License state" value={v.licenseState} onChange={set('licenseState')} options={US_STATES.map((s) => ({ value: s, label: s }))} />
        <Input label="License expires" type="date" value={v.licenseExpiresAt} onChange={set('licenseExpiresAt')} />
        <Select label="Assigned truck" value={v.truckId} onChange={set('truckId')} placeholder="None" options={trucks.filter((t) => t.carrierId === v.carrierId).map((t) => ({ value: t.id, label: t.unitNumber }))} />
      </div>
    </Modal>
  )
}
