/**
 * SAMPLE DATA — fictional loads, brokers and facilities for demonstration only.
 */
import type { Broker, EquipmentType, Load, LoadDocument, LoadEvent, LoadStatus, StopLocation } from '@/data/types'
import { daysFromNow } from '@/lib/dates'
import { LOAD_FLOW, loadStep } from '@/lib/status'

export const BROKERS: Broker[] = [
  { name: 'Summit Freight Brokerage', mcNumber: 'MC-884213', contact: 'Rachel Kim', phone: '(678) 555-0190', email: 'loads@summitfreight.demo', rating: 4.7, daysToPay: 21 },
  { name: 'Keystone Logistics Group', mcNumber: 'MC-702119', contact: 'Tom Becker', phone: '(312) 555-0144', email: 'carriers@keystonelg.demo', rating: 4.5, daysToPay: 30 },
  { name: 'Harborline Brokerage', mcNumber: 'MC-951046', contact: 'Alicia Monroe', phone: '(904) 555-0118', email: 'ops@harborline.demo', rating: 4.8, daysToPay: 15 },
  { name: 'TrueNorth Freight', mcNumber: 'MC-640377', contact: 'Ben Carter', phone: '(469) 555-0136', email: 'dispatch@truenorthfreight.demo', rating: 4.2, daysToPay: 35 },
  { name: 'Crescent Logistics', mcNumber: 'MC-815520', contact: 'Imani Shaw', phone: '(504) 555-0172', email: 'book@crescentlogistics.demo', rating: 4.6, daysToPay: 25 },
  { name: 'Redline Transport Brokers', mcNumber: 'MC-577304', contact: 'Victor Hale', phone: '(615) 555-0159', email: 'loads@redlinetb.demo', rating: 3.9, daysToPay: 45 },
]

interface Place {
  facility: string
  street: string
  city: string
  state: string
  zip: string
}

const P = {
  orlando: { facility: 'Sunbelt Distribution Center', street: '7200 Presidents Dr', city: 'Orlando', state: 'FL', zip: '32809' },
  atlanta: { facility: 'Peachtree Retail DC', street: '3500 Southside Industrial Pkwy', city: 'Atlanta', state: 'GA', zip: '30354' },
  miami: { facility: 'Port Miami Cold Storage', street: '1200 NW 72nd Ave', city: 'Miami', state: 'FL', zip: '33126' },
  jacksonville: { facility: 'First Coast Warehouse', street: '5800 Imeson Rd', city: 'Jacksonville', state: 'FL', zip: '32219' },
  charlotte: { facility: 'Queen City Logistics Hub', street: '4100 Westinghouse Blvd', city: 'Charlotte', state: 'NC', zip: '28273' },
  dallas: { facility: 'Trinity Industrial Park', street: '2500 Mockingbird Ln', city: 'Dallas', state: 'TX', zip: '75235' },
  houston: { facility: 'Bayou City Fulfillment', street: '8900 Wallisville Rd', city: 'Houston', state: 'TX', zip: '77029' },
  chicago: { facility: 'Lakeshore Cross-Dock', street: '4800 S Kilbourn Ave', city: 'Chicago', state: 'IL', zip: '60632' },
  indianapolis: { facility: 'Crossroads Distribution', street: '6200 W Minnesota St', city: 'Indianapolis', state: 'IN', zip: '46241' },
  tampa: { facility: 'Gulfside Produce Terminal', street: '4400 E Adamo Dr', city: 'Tampa', state: 'FL', zip: '33605' },
  savannah: { facility: 'Coastal Empire Port DC', street: '100 Grange Rd', city: 'Savannah', state: 'GA', zip: '31407' },
  sanAntonio: { facility: 'Alamo Supply Yard', street: '1800 SE Military Dr', city: 'San Antonio', state: 'TX', zip: '78214' },
  nashville: { facility: 'Music City Warehouse', street: '700 Massman Dr', city: 'Nashville', state: 'TN', zip: '37210' },
  memphis: { facility: 'River Bluff Distribution', street: '3900 Air Park St', city: 'Memphis', state: 'TN', zip: '38118' },
  columbus: { facility: 'Buckeye Fulfillment', street: '2600 Rohr Rd', city: 'Columbus', state: 'OH', zip: '43137' },
  okc: { facility: 'Sooner Steel Supply', street: '1500 SE 29th St', city: 'Oklahoma City', state: 'OK', zip: '73129' },
  birmingham: { facility: 'Magic City Metals', street: '3300 Finley Blvd', city: 'Birmingham', state: 'AL', zip: '35234' },
  raleigh: { facility: 'Triangle Building Supply', street: '2100 Garner Rd', city: 'Raleigh', state: 'NC', zip: '27610' },
  neworleans: { facility: 'Crescent Port Terminal', street: '5000 Florida Ave', city: 'New Orleans', state: 'LA', zip: '70117' },
  detroit: { facility: 'Motor City Parts DC', street: '12000 Oakland Pkwy', city: 'Detroit', state: 'MI', zip: '48203' },
} satisfies Record<string, Place>

interface Spec {
  n: number
  status: LoadStatus
  equipment: EquipmentType
  from: Place
  to: Place
  miles: number
  rate: number
  /** pickup appointment offset in days from today */
  pickupDay: number
  transitDays?: number
  broker: number
  carrierId?: string
  truckId?: string
  driverId?: string
  dispatcherId?: string
  weightLbs: number
  commodity: string
  source?: Load['source']
}

const stop = (p: Place, iso: string, contact: string, phone: string): StopLocation => {
  const h = new Date(iso).getHours()
  const end = (h + 2) % 24
  const fmt = (x: number) => `${((x + 11) % 12) + 1}:00 ${x < 12 ? 'AM' : 'PM'}`
  return { ...p, appointment: iso, window: `${fmt(h)} – ${fmt(end)}`, contact, phone }
}

function buildEvents(status: LoadStatus, pickupIso: string, deliveryIso: string, dispatcher: string, driver: string): LoadEvent[] {
  const pickup = new Date(pickupIso).getTime()
  const delivery = new Date(deliveryIso).getTime()
  const h = 3_600_000
  const at: Record<LoadStatus, number> = {
    opportunity: pickup - 72 * h,
    review: pickup - 60 * h,
    approved: pickup - 48 * h,
    dispatched: pickup - 20 * h,
    pickup: pickup + 0.5 * h,
    'in-transit': pickup + 2 * h,
    delivered: delivery + 1 * h,
    'pod-received': delivery + 4 * h,
    invoiced: delivery + 26 * h,
    completed: delivery + 20 * 24 * h,
  }
  const by: Record<LoadStatus, string> = {
    opportunity: `${dispatcher} (load board)`,
    review: dispatcher,
    approved: 'Carrier',
    dispatched: dispatcher,
    pickup: driver,
    'in-transit': driver,
    delivered: driver,
    'pod-received': driver,
    invoiced: 'Accounting',
    completed: 'Accounting',
  }
  const now = Date.now()
  return LOAD_FLOW.slice(0, loadStep(status) + 1).map((s, i) => ({
    id: `ev_${s}_${i}`,
    status: s,
    at: new Date(Math.min(at[s], now - (10 - i) * 600_000)).toISOString(),
    by: by[s],
  }))
}

function buildDocs(status: LoadStatus, id: string, events: LoadEvent[]): LoadDocument[] {
  const step = loadStep(status)
  const when = (s: LoadStatus) => events.find((e) => e.status === s)?.at ?? new Date().toISOString()
  const docs: LoadDocument[] = []
  if (step >= loadStep('approved')) docs.push({ id: `${id}-rc`, kind: 'rate-con', name: `RateCon_${id}.pdf`, uploadedAt: when('approved'), uploadedBy: 'Dispatch' })
  if (step >= loadStep('pickup')) docs.push({ id: `${id}-bol`, kind: 'bol', name: `BOL_${id}.pdf`, uploadedAt: when('pickup'), uploadedBy: 'Driver' })
  if (step >= loadStep('pod-received')) docs.push({ id: `${id}-pod`, kind: 'pod', name: `POD_${id}_signed.pdf`, uploadedAt: when('pod-received'), uploadedBy: 'Driver' })
  return docs
}

const DISPATCHER_NAMES: Record<string, string> = { u3: 'Maya Thompson', u4: 'Andre Collins', u5: 'Sofia Ramirez' }
const DRIVER_NAMES: Record<string, string> = {
  d1: 'Luis Ortega', d2: 'Terrence Hall', d3: 'Marcus Reed', d5: 'Rafael Mendez', d7: 'Calvin Price', d8: 'Nina Alvarez',
  d9: 'Darnell Woods', d10: 'Jesse Delgado', d11: 'Cody Barnes', d12: 'Mark Kowalski', d13: 'Brandon Hayes',
}

function makeLoad(s: Spec): Load {
  const id = `EVD-${24100 + s.n}`
  const pickupIso = daysFromNow(s.pickupDay, 8 + (s.n % 5))
  const deliveryIso = daysFromNow(s.pickupDay + (s.transitDays ?? 1), 9 + (s.n % 6))
  const dispatcher = DISPATCHER_NAMES[s.dispatcherId ?? 'u3'] ?? 'Dispatch'
  const driver = (s.driverId && DRIVER_NAMES[s.driverId]) || 'Driver'
  const events = buildEvents(s.status, pickupIso, deliveryIso, dispatcher, driver)
  const broker = BROKERS[s.broker % BROKERS.length]!
  return {
    id,
    status: s.status,
    equipment: s.equipment,
    carrierId: s.carrierId,
    truckId: s.truckId,
    driverId: s.driverId,
    dispatcherId: s.dispatcherId,
    broker,
    pickup: stop(s.from, pickupIso, 'Shipping Office', '(800) 555-0101'),
    delivery: stop(s.to, deliveryIso, 'Receiving Desk', '(800) 555-0102'),
    miles: s.miles,
    rate: s.rate,
    weightLbs: s.weightLbs,
    commodity: s.commodity,
    reference: `PO-${(731_000 + s.n * 137).toString()}`,
    source: s.source ?? 'manual',
    createdAt: events[0]!.at,
    events,
    documents: buildDocs(s.status, id, events),
    notes:
      s.n % 3 === 0
        ? [{ id: `${id}-n1`, at: events[0]!.at, by: dispatcher, text: 'Broker confirmed no touch freight. Driver must call 1 hr before arrival.' }]
        : [],
  }
}

export function seedLoads(): Load[] {
  const specs: Spec[] = [
    // Eagle Transport LLC (portal carrier)
    { n: 1, status: 'in-transit', equipment: 'box-truck', from: P.orlando, to: P.atlanta, miles: 440, rate: 1250, pickupDay: 0, broker: 0, carrierId: 'c1', truckId: 't1', driverId: 'd1', dispatcherId: 'u3', weightLbs: 8200, commodity: 'Retail pallets (14 pallets)' },
    { n: 2, status: 'dispatched', equipment: 'box-truck', from: P.miami, to: P.jacksonville, miles: 345, rate: 980, pickupDay: 1, broker: 2, carrierId: 'c1', truckId: 't2', driverId: 'd2', dispatcherId: 'u3', weightLbs: 6400, commodity: 'Furniture — liftgate required' },
    { n: 3, status: 'approved', equipment: 'dry-van', from: P.atlanta, to: P.charlotte, miles: 245, rate: 850, pickupDay: 2, broker: 1, carrierId: 'c1', truckId: 't3', driverId: 'd3', dispatcherId: 'u3', weightLbs: 32000, commodity: 'Paper products' },
    { n: 4, status: 'pod-received', equipment: 'box-truck', from: P.tampa, to: P.orlando, miles: 85, rate: 425, pickupDay: -2, broker: 2, carrierId: 'c1', truckId: 't1', driverId: 'd1', dispatcherId: 'u3', weightLbs: 5200, commodity: 'Appliances' },
    { n: 5, status: 'invoiced', equipment: 'box-truck', from: P.jacksonville, to: P.savannah, miles: 140, rate: 560, pickupDay: -6, broker: 0, carrierId: 'c1', truckId: 't2', driverId: 'd2', dispatcherId: 'u3', weightLbs: 7100, commodity: 'E-commerce parcels' },
    { n: 6, status: 'completed', equipment: 'box-truck', from: P.orlando, to: P.miami, miles: 235, rate: 780, pickupDay: -24, broker: 4, carrierId: 'c1', truckId: 't1', driverId: 'd1', dispatcherId: 'u3', weightLbs: 6800, commodity: 'Trade show exhibits' },
    { n: 7, status: 'completed', equipment: 'dry-van', from: P.savannah, to: P.atlanta, miles: 250, rate: 900, pickupDay: -27, broker: 1, carrierId: 'c1', truckId: 't3', driverId: 'd3', dispatcherId: 'u3', weightLbs: 38000, commodity: 'Imported consumer goods' },
    { n: 8, status: 'delivered', equipment: 'box-truck', from: P.atlanta, to: P.orlando, miles: 440, rate: 1180, pickupDay: -1, broker: 3, carrierId: 'c1', truckId: 't2', driverId: 'd2', dispatcherId: 'u3', weightLbs: 7600, commodity: 'Retail fixtures' },
    // Sunshine Freight LLC
    { n: 9, status: 'in-transit', equipment: 'reefer', from: P.miami, to: P.atlanta, miles: 665, rate: 2350, pickupDay: -1, transitDays: 2, broker: 2, carrierId: 'c2', truckId: 't5', driverId: 'd5', dispatcherId: 'u4', weightLbs: 41000, commodity: 'Fresh produce @ 34°F' },
    { n: 10, status: 'completed', equipment: 'reefer', from: P.tampa, to: P.nashville, miles: 760, rate: 2500, pickupDay: -21, transitDays: 2, broker: 0, carrierId: 'c2', truckId: 't5', driverId: 'd5', dispatcherId: 'u4', weightLbs: 40000, commodity: 'Frozen seafood @ -10°F' },
    { n: 11, status: 'invoiced', equipment: 'reefer', from: P.miami, to: P.orlando, miles: 235, rate: 950, pickupDay: -40, broker: 5, carrierId: 'c2', truckId: 't5', driverId: 'd5', dispatcherId: 'u4', weightLbs: 36000, commodity: 'Dairy @ 36°F' },
    // BlueLine Logistics LLC
    { n: 12, status: 'pickup', equipment: 'dry-van', from: P.atlanta, to: P.charlotte, miles: 245, rate: 875, pickupDay: 0, broker: 1, carrierId: 'c3', truckId: 't7', driverId: 'd7', dispatcherId: 'u3', weightLbs: 30000, commodity: 'Beverages' },
    { n: 13, status: 'approved', equipment: 'step-deck', from: P.birmingham, to: P.raleigh, miles: 560, rate: 2150, pickupDay: 1, transitDays: 2, broker: 4, carrierId: 'c3', truckId: 't9', driverId: 'd9', dispatcherId: 'u3', weightLbs: 39000, commodity: 'Construction machinery' },
    { n: 14, status: 'invoiced', equipment: 'flatbed', from: P.birmingham, to: P.atlanta, miles: 147, rate: 725, pickupDay: -9, broker: 3, carrierId: 'c3', truckId: 't8', driverId: 'd8', dispatcherId: 'u3', weightLbs: 44000, commodity: 'Steel coils — tarp required' },
    { n: 15, status: 'completed', equipment: 'dry-van', from: P.charlotte, to: P.atlanta, miles: 245, rate: 820, pickupDay: -15, broker: 1, carrierId: 'c3', truckId: 't7', driverId: 'd7', dispatcherId: 'u3', weightLbs: 29000, commodity: 'Packaging materials' },
    // RoadStar Transport LLC
    { n: 16, status: 'in-transit', equipment: 'hotshot', from: P.dallas, to: P.houston, miles: 240, rate: 690, pickupDay: 0, broker: 3, carrierId: 'c4', truckId: 't10', driverId: 'd10', dispatcherId: 'u5', weightLbs: 12000, commodity: 'Oilfield pipe fittings' },
    { n: 17, status: 'review', equipment: 'flatbed', from: P.dallas, to: P.okc, miles: 205, rate: 780, pickupDay: 2, broker: 3, carrierId: 'c4', truckId: 't11', driverId: 'd11', dispatcherId: 'u5', weightLbs: 42000, commodity: 'Lumber bundles' },
    { n: 18, status: 'pod-received', equipment: 'hotshot', from: P.houston, to: P.sanAntonio, miles: 200, rate: 590, pickupDay: -3, broker: 4, carrierId: 'c4', truckId: 't10', driverId: 'd10', dispatcherId: 'u5', weightLbs: 9500, commodity: 'Expedited pump parts' },
    // Prairie Line Carriers LLC
    { n: 19, status: 'in-transit', equipment: 'power-only', from: P.chicago, to: P.indianapolis, miles: 180, rate: 640, pickupDay: 0, broker: 1, carrierId: 'c5', truckId: 't12', driverId: 'd12', dispatcherId: 'u4', weightLbs: 38000, commodity: 'Drop trailer — consumer goods' },
    { n: 20, status: 'delivered', equipment: 'power-only', from: P.indianapolis, to: P.columbus, miles: 175, rate: 610, pickupDay: -1, broker: 1, carrierId: 'c5', truckId: 't12', driverId: 'd12', dispatcherId: 'u4', weightLbs: 35000, commodity: 'Pre-loaded trailer' },
    { n: 21, status: 'completed', equipment: 'power-only', from: P.chicago, to: P.detroit, miles: 285, rate: 920, pickupDay: -12, broker: 0, carrierId: 'c5', truckId: 't12', driverId: 'd12', dispatcherId: 'u4', weightLbs: 37000, commodity: 'Auto parts trailer' },
    // Unassigned opportunities / reviews
    { n: 22, status: 'opportunity', equipment: 'box-truck', from: P.dallas, to: P.houston, miles: 240, rate: 720, pickupDay: 1, broker: 4, dispatcherId: 'u5', weightLbs: 7000, commodity: 'Retail pallets', source: 'DAT (demo)' },
    { n: 23, status: 'opportunity', equipment: 'reefer', from: P.memphis, to: P.nashville, miles: 210, rate: 820, pickupDay: 2, broker: 0, dispatcherId: 'u4', weightLbs: 38000, commodity: 'Frozen foods', source: 'Truckstop (demo)' },
    { n: 24, status: 'review', equipment: 'dry-van', from: P.jacksonville, to: P.charlotte, miles: 380, rate: 1100, pickupDay: 3, broker: 2, carrierId: 'c1', truckId: 't3', dispatcherId: 'u3', weightLbs: 34000, commodity: 'Bottled water' },
    { n: 25, status: 'opportunity', equipment: 'flatbed', from: P.houston, to: P.neworleans, miles: 350, rate: 1150, pickupDay: 2, broker: 4, dispatcherId: 'u5', weightLbs: 45000, commodity: 'Steel beams' },
    { n: 26, status: 'opportunity', equipment: 'box-truck', from: P.orlando, to: P.tampa, miles: 85, rate: 375, pickupDay: 1, broker: 2, dispatcherId: 'u3', weightLbs: 4800, commodity: 'Final-mile appliances', source: 'DAT (demo)' },
    { n: 27, status: 'dispatched', equipment: 'flatbed', from: P.atlanta, to: P.birmingham, miles: 147, rate: 690, pickupDay: 1, broker: 3, carrierId: 'c3', truckId: 't8', driverId: 'd8', dispatcherId: 'u3', weightLbs: 43000, commodity: 'Rebar bundles' },
    { n: 28, status: 'delivered', equipment: 'box-truck', from: P.houston, to: P.dallas, miles: 240, rate: 700, pickupDay: -1, broker: 3, carrierId: 'c6', truckId: 't13', driverId: 'd13', dispatcherId: 'u5', weightLbs: 6900, commodity: 'Retail store resets' },
  ]
  return specs.map(makeLoad)
}
