/**
 * SAMPLE DATA — every company, person, phone number, DOT/MC number and VIN below
 * is fictional and generated for demonstration only.
 */
import type { Carrier, CarrierDocument, Driver, StaffUser, Truck } from '@/data/types'
import { daysFromNow, hoursAgo } from '@/lib/dates'

export function seedUsers(): StaffUser[] {
  return [
    { id: 'u1', name: 'Dana Whitfield', email: 'dana@eaglevisiondispatch.demo', role: 'super-admin', status: 'active', lastActiveAt: hoursAgo(0.2), phone: '(407) 555-0110' },
    { id: 'u2', name: 'Kevin Brooks', email: 'kevin@eaglevisiondispatch.demo', role: 'admin', status: 'active', lastActiveAt: hoursAgo(1.5), phone: '(407) 555-0111' },
    { id: 'u3', name: 'Maya Thompson', email: 'maya@eaglevisiondispatch.demo', role: 'dispatcher', status: 'active', lastActiveAt: hoursAgo(0.1), phone: '(407) 555-0112' },
    { id: 'u4', name: 'Andre Collins', email: 'andre@eaglevisiondispatch.demo', role: 'dispatcher', status: 'active', lastActiveAt: hoursAgo(0.6), phone: '(407) 555-0113' },
    { id: 'u5', name: 'Sofia Ramirez', email: 'sofia@eaglevisiondispatch.demo', role: 'dispatcher', status: 'active', lastActiveAt: hoursAgo(3), phone: '(407) 555-0114' },
    { id: 'u6', name: 'Priya Nair', email: 'priya@eaglevisiondispatch.demo', role: 'accounting', status: 'active', lastActiveAt: hoursAgo(5), phone: '(407) 555-0115' },
    { id: 'u7', name: 'Jordan Lee', email: 'jordan@eaglevisiondispatch.demo', role: 'support', status: 'active', lastActiveAt: hoursAgo(26), phone: '(407) 555-0116' },
    { id: 'u8', name: 'Chris Morgan', email: 'chris@eaglevisiondispatch.demo', role: 'dispatcher', status: 'invited', lastActiveAt: hoursAgo(72), phone: '(407) 555-0117' },
  ]
}

export function seedCarriers(): Carrier[] {
  return [
    {
      id: 'c1', legalName: 'Eagle Transport LLC', dba: 'Eagle Box Freight', dotNumber: '3849217', mcNumber: 'MC-1294830', einLast4: '4417',
      ownerName: 'Marcus Reed', email: 'marcus@eagletransport.demo', phone: '(407) 555-0142',
      address: { street: '1450 Commerce Park Dr', city: 'Orlando', state: 'FL', zip: '32819' },
      equipment: ['box-truck', 'dry-van'], status: 'active', joinedAt: daysFromNow(-210), dispatcherId: 'u3',
      preferredStates: ['FL', 'GA', 'SC', 'NC', 'AL'], radius: 'regional', rating: 4.8, onTimeRate: 97,
      insurance: { provider: 'Sample Mutual Insurance Co.', policyNumber: 'SMI-22-884120', autoLiability: 1_000_000, cargo: 100_000, expiresAt: daysFromNow(18) },
    },
    {
      id: 'c2', legalName: 'Sunshine Freight LLC', dotNumber: '3611054', mcNumber: 'MC-1188205', einLast4: '9021',
      ownerName: 'Tanya Brooks', email: 'dispatch@sunshinefreight.demo', phone: '(305) 555-0188',
      address: { street: '8800 NW 25th St', city: 'Miami', state: 'FL', zip: '33172' },
      equipment: ['reefer', 'dry-van'], status: 'active', joinedAt: daysFromNow(-330), dispatcherId: 'u4',
      preferredStates: ['FL', 'GA', 'TN'], radius: 'regional', rating: 4.6, onTimeRate: 94,
      insurance: { provider: 'Example Commercial Assurance', policyNumber: 'ECA-7731902', autoLiability: 1_000_000, cargo: 150_000, expiresAt: daysFromNow(140) },
    },
    {
      id: 'c3', legalName: 'BlueLine Logistics LLC', dotNumber: '3290418', mcNumber: 'MC-1047711', einLast4: '3368',
      ownerName: 'David Okafor', email: 'ops@bluelinelogistics.demo', phone: '(404) 555-0127',
      address: { street: '2200 Fulton Industrial Blvd', city: 'Atlanta', state: 'GA', zip: '30336' },
      equipment: ['dry-van', 'flatbed', 'step-deck'], status: 'active', joinedAt: daysFromNow(-420), dispatcherId: 'u3',
      preferredStates: ['GA', 'NC', 'SC', 'TN', 'AL', 'FL'], radius: 'otr', rating: 4.7, onTimeRate: 95,
      insurance: { provider: 'Sample Mutual Insurance Co.', policyNumber: 'SMI-21-552901', autoLiability: 1_000_000, cargo: 100_000, expiresAt: daysFromNow(210) },
    },
    {
      id: 'c4', legalName: 'RoadStar Transport LLC', dotNumber: '3977402', mcNumber: 'MC-1352276', einLast4: '7755',
      ownerName: 'Jesse Delgado', email: 'jesse@roadstartransport.demo', phone: '(214) 555-0163',
      address: { street: '4100 Irving Blvd', city: 'Dallas', state: 'TX', zip: '75247' },
      equipment: ['hotshot', 'flatbed'], status: 'active', joinedAt: daysFromNow(-95), dispatcherId: 'u5',
      preferredStates: ['TX', 'OK', 'LA', 'AR'], radius: 'regional', rating: 4.4, onTimeRate: 91,
      insurance: { provider: 'Example Commercial Assurance', policyNumber: 'ECA-8802117', autoLiability: 750_000, cargo: 100_000, expiresAt: daysFromNow(-4) },
    },
    {
      id: 'c5', legalName: 'Prairie Line Carriers LLC', dotNumber: '3504188', mcNumber: 'MC-1120943', einLast4: '1189',
      ownerName: 'Angela Novak', email: 'angela@prairieline.demo', phone: '(312) 555-0109',
      address: { street: '6000 W 73rd St', city: 'Chicago', state: 'IL', zip: '60638' },
      equipment: ['power-only', 'dry-van'], status: 'active', joinedAt: daysFromNow(-160), dispatcherId: 'u4',
      preferredStates: ['IL', 'IN', 'OH', 'MI', 'WI'], radius: 'regional', rating: 4.5, onTimeRate: 93,
      insurance: { provider: 'Sample Mutual Insurance Co.', policyNumber: 'SMI-23-114507', autoLiability: 1_000_000, cargo: 100_000, expiresAt: daysFromNow(95) },
    },
    {
      id: 'c6', legalName: 'Gulf Coast Haulers LLC', dotNumber: '4012935', mcNumber: 'MC-1401872', einLast4: '6620',
      ownerName: 'Brandon Hayes', email: 'brandon@gulfcoasthaulers.demo', phone: '(713) 555-0151',
      address: { street: '9200 Market St', city: 'Houston', state: 'TX', zip: '77029' },
      equipment: ['box-truck', 'straight-truck'], status: 'onboarding', joinedAt: daysFromNow(-6), dispatcherId: 'u5',
      preferredStates: ['TX', 'LA'], radius: 'local', rating: 4.2, onTimeRate: 100,
      insurance: { provider: 'Example Commercial Assurance', policyNumber: 'ECA-9013350', autoLiability: 1_000_000, cargo: 100_000, expiresAt: daysFromNow(330) },
    },
  ]
}

export function seedDrivers(): Driver[] {
  const d = (id: string, carrierId: string, name: string, phone: string, cdlClass: Driver['cdlClass'], licenseState: string, exp: number, status: Driver['status'], truckId?: string): Driver => ({
    id, carrierId, name, phone, email: `${name.split(' ')[0]!.toLowerCase()}@driver.demo`, cdlClass, licenseState,
    licenseExpiresAt: daysFromNow(exp), status, truckId, hiredAt: daysFromNow(-200 - exp / 10),
  })
  return [
    d('d1', 'c1', 'Luis Ortega', '(407) 555-0171', 'Non-CDL', 'FL', 420, 'on-load', 't1'),
    d('d2', 'c1', 'Terrence Hall', '(407) 555-0172', 'Non-CDL', 'FL', 25, 'on-load', 't2'),
    d('d3', 'c1', 'Marcus Reed', '(407) 555-0142', 'A', 'FL', 610, 'available', 't3'),
    d('d4', 'c1', 'Keisha Grant', '(407) 555-0174', 'B', 'FL', 300, 'off-duty'),
    d('d5', 'c2', 'Rafael Mendez', '(305) 555-0181', 'A', 'FL', 500, 'on-load', 't5'),
    d('d6', 'c2', 'Oksana Petrenko', '(305) 555-0182', 'A', 'FL', -10, 'off-duty', 't6'),
    d('d7', 'c3', 'Calvin Price', '(404) 555-0121', 'A', 'GA', 380, 'on-load', 't7'),
    d('d8', 'c3', 'Nina Alvarez', '(404) 555-0122', 'A', 'GA', 700, 'available', 't8'),
    d('d9', 'c3', 'Darnell Woods', '(404) 555-0123', 'A', 'GA', 210, 'on-load', 't9'),
    d('d10', 'c4', 'Jesse Delgado', '(214) 555-0163', 'A', 'TX', 450, 'on-load', 't10'),
    d('d11', 'c4', 'Cody Barnes', '(214) 555-0164', 'A', 'TX', 160, 'available', 't11'),
    d('d12', 'c5', 'Mark Kowalski', '(312) 555-0191', 'A', 'IL', 520, 'on-load', 't12'),
    d('d13', 'c6', 'Brandon Hayes', '(713) 555-0151', 'Non-CDL', 'TX', 640, 'available', 't13'),
  ]
}

export function seedTrucks(): Truck[] {
  const t = (
    id: string, carrierId: string, unitNumber: string, equipment: Truck['equipment'], year: number, make: string, model: string,
    dimensions: string, capacityLbs: number, status: Truck['status'], homeBase: string, driverId?: string,
  ): Truck => ({
    id, carrierId, unitNumber, equipment, year, make, model, dimensions, capacityLbs, status, homeBase, driverId,
    vin: `DEMO${id.toUpperCase().padStart(4, '0')}SAMPLE${year}`.slice(0, 17),
    odometer: 40_000 + (year % 7) * 31_000 + unitNumber.length * 1_234,
  })
  return [
    t('t1', 'c1', 'EVT-101', 'box-truck', 2022, 'Freightliner', 'M2 106', `26' × 102" × 102"`, 10_000, 'in-transit', 'Orlando, FL', 'd1'),
    t('t2', 'c1', 'EVT-102', 'box-truck', 2021, 'Isuzu', 'NRR', `24' × 96" × 96"`, 8_500, 'assigned', 'Orlando, FL', 'd2'),
    t('t3', 'c1', 'EVT-103', 'dry-van', 2020, 'Volvo', 'VNL 760', `53' × 102" × 110"`, 44_000, 'available', 'Orlando, FL', 'd3'),
    t('t4', 'c1', 'EVT-104', 'box-truck', 2019, 'Hino', '268A', `26' × 102" × 102"`, 10_000, 'maintenance', 'Orlando, FL'),
    t('t5', 'c2', 'SUN-21', 'reefer', 2023, 'Kenworth', 'T680', `53' Reefer`, 43_500, 'in-transit', 'Miami, FL', 'd5'),
    t('t6', 'c2', 'SUN-22', 'reefer', 2021, 'Peterbilt', '579', `53' Reefer`, 43_500, 'inactive', 'Miami, FL', 'd6'),
    t('t7', 'c3', 'BLL-07', 'dry-van', 2022, 'Freightliner', 'Cascadia', `53' × 102" × 110"`, 44_000, 'in-transit', 'Atlanta, GA', 'd7'),
    t('t8', 'c3', 'BLL-11', 'flatbed', 2020, 'International', 'LT625', `48' Flatbed`, 47_000, 'available', 'Atlanta, GA', 'd8'),
    t('t9', 'c3', 'BLL-14', 'step-deck', 2021, 'Mack', 'Anthem', `53' Step Deck`, 46_000, 'assigned', 'Atlanta, GA', 'd9'),
    t('t10', 'c4', 'RST-3', 'hotshot', 2023, 'Ram', '3500 + 40\' Gooseneck', `40' Gooseneck`, 16_500, 'in-transit', 'Dallas, TX', 'd10'),
    t('t11', 'c4', 'RST-5', 'flatbed', 2019, 'Kenworth', 'W900', `48' Flatbed`, 47_000, 'available', 'Dallas, TX', 'd11'),
    t('t12', 'c5', 'PLC-40', 'power-only', 2022, 'Volvo', 'VNR 640', 'Day cab tractor', 45_000, 'in-transit', 'Chicago, IL', 'd12'),
    t('t13', 'c6', 'GCH-1', 'box-truck', 2024, 'Isuzu', 'FTR', `26' × 102" × 102"`, 10_000, 'available', 'Houston, TX', 'd13'),
    t('t14', 'c6', 'GCH-2', 'straight-truck', 2020, 'Hino', 'L6', `22' Dock-high`, 9_000, 'available', 'Houston, TX'),
  ]
}

export function seedDocuments(): CarrierDocument[] {
  let n = 0
  const doc = (carrierId: string, type: CarrierDocument['type'], name: string, subject: string, uploaded: number, expires: number | undefined, review: CarrierDocument['review'] = 'approved', extra: Partial<CarrierDocument> = {}): CarrierDocument => ({
    id: `doc${++n}`, carrierId, type, name, subject, uploadedAt: daysFromNow(uploaded), expiresAt: expires === undefined ? undefined : daysFromNow(expires), review, ...extra,
  })
  return [
    // Eagle Transport LLC — the demo carrier-portal account
    doc('c1', 'w9', 'W-9 (2026)', 'Company', -210, undefined),
    doc('c1', 'coi', 'Certificate of Insurance', 'Company', -200, 18),
    doc('c1', 'mc-authority', 'MC Authority Letter', 'Company', -210, undefined),
    doc('c1', 'registration', 'Truck Registration', 'Truck EVT-101', -180, 160, 'approved', { truckId: 't1' }),
    doc('c1', 'registration', 'Truck Registration', 'Truck EVT-102', -180, 9, 'approved', { truckId: 't2' }),
    doc('c1', 'inspection', 'Annual DOT Inspection', 'Truck EVT-103', -330, -3, 'approved', { truckId: 't3' }),
    doc('c1', 'inspection', 'Annual DOT Inspection', 'Truck EVT-101', -40, 325, 'approved', { truckId: 't1' }),
    doc('c1', 'cdl', "Driver's License", 'Driver Luis Ortega', -150, 420, 'approved', { driverId: 'd1' }),
    doc('c1', 'cdl', "Driver's License", 'Driver Terrence Hall', -150, 25, 'approved', { driverId: 'd2' }),
    doc('c1', 'medical-card', 'DOT Medical Card', 'Driver Marcus Reed', -2, 700, 'pending', { driverId: 'd3' }),
    doc('c1', 'ifta', 'IFTA License', 'Company', -1, 85, 'pending'),
    // Other carriers
    doc('c2', 'w9', 'W-9 (2026)', 'Company', -330, undefined),
    doc('c2', 'coi', 'Certificate of Insurance', 'Company', -60, 140),
    doc('c2', 'cdl', 'CDL — Class A', 'Driver Oksana Petrenko', -400, -10, 'approved', { driverId: 'd6' }),
    doc('c2', 'inspection', 'Reefer Unit Service Record', 'Truck SUN-21', -20, 160, 'approved', { truckId: 't5' }),
    doc('c3', 'coi', 'Certificate of Insurance', 'Company', -150, 210),
    doc('c3', 'mc-authority', 'MC Authority Letter', 'Company', -420, undefined),
    doc('c3', 'cdl', 'CDL — Class A', 'Driver Darnell Woods', -100, 22, 'approved', { driverId: 'd9' }),
    doc('c4', 'coi', 'Certificate of Insurance', 'Company', -360, -4),
    doc('c4', 'w9', 'W-9 (2026)', 'Company', -95, undefined),
    doc('c4', 'registration', 'Trailer Registration', 'Truck RST-3', -3, 360, 'pending', { truckId: 't10' }),
    doc('c5', 'coi', 'Certificate of Insurance', 'Company', -270, 95),
    doc('c5', 'other', 'Trailer Interchange Agreement', 'Company', -160, 200),
    doc('c6', 'w9', 'W-9 (2026)', 'Company', -6, undefined, 'pending'),
    doc('c6', 'coi', 'Certificate of Insurance', 'Company', -6, 330, 'pending'),
    doc('c6', 'mc-authority', 'MC Authority Letter', 'Company', -6, undefined, 'pending'),
  ]
}
