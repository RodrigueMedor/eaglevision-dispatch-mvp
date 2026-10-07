/**
 * Write-side service layer: pure state transitions that encode the dispatch
 * workflow rules. Each maps to a future Spring Boot endpoint, e.g.
 *   setLoadStatus      → PATCH /api/v1/loads/{id}/status
 *   addLoadDocument    → POST  /api/v1/loads/{id}/documents  (multipart → object storage)
 *   setApplicationStatus → POST /api/v1/applications/{id}/decision
 */
import type {
  AppNotification,
  ApplicationStatus,
  Carrier,
  CarrierApplication,
  CarrierDocument,
  Channel,
  DemoState,
  Driver,
  Integration,
  Invoice,
  Load,
  LoadDocumentKind,
  LoadStatus,
  Payment,
  PlatformSettings,
  Role,
  Session,
  StaffUser,
  Truck,
} from '@/data/types'
import { uid } from '@/lib/id'
import { nowIso } from '@/lib/dates'
import { feeBreakdown } from '@/lib/fees'
import { lane, moneyCents } from '@/lib/format'
import { loadStep, LOAD_STATUS } from '@/lib/status'

const patchIn = <T extends { id: string }>(list: T[], id: string, patch: Partial<T> | ((x: T) => T)): T[] =>
  list.map((x) => (x.id === id ? (typeof patch === 'function' ? patch(x) : { ...x, ...patch }) : x))

const upsertIn = <T extends { id: string }>(list: T[], item: T): T[] =>
  list.some((x) => x.id === item.id) ? patchIn(list, item.id, item) : [item, ...list]

function notify(s: DemoState, n: Omit<AppNotification, 'id' | 'read' | 'at' | 'channels'> & { channels?: Channel[] }): DemoState {
  const channels = n.channels ?? s.settings.notificationChannels[n.kind] ?? ['in-app']
  return { ...s, notifications: [{ id: uid('nt'), read: false, at: nowIso(), ...n, channels }, ...s.notifications] }
}

// ---------------------------------------------------------------- session & settings

export const setSession = (s: DemoState, patch: Partial<Session>): DemoState => ({ ...s, session: { ...s.session, ...patch } })
export const updateSettings = (s: DemoState, patch: Partial<PlatformSettings>): DemoState => ({ ...s, settings: { ...s.settings, ...patch } })

// ---------------------------------------------------------------- loads

export type LoadInput = Omit<Load, 'id' | 'events' | 'documents' | 'notes' | 'createdAt' | 'status'> & { status?: LoadStatus }

export function nextLoadId(s: DemoState) {
  const max = s.loads.reduce((m, l) => Math.max(m, Number(l.id.replace(/\D/g, '')) || 0), 24100)
  return `EVD-${max + 1}`
}

export function createLoad(s: DemoState, input: LoadInput, by: string): DemoState {
  const id = nextLoadId(s)
  const status = input.status ?? (input.carrierId ? 'review' : 'opportunity')
  const at = nowIso()
  const load: Load = { ...input, id, status, createdAt: at, events: [{ id: uid('ev'), status, at, by, note: 'Load created' }], documents: [], notes: [] }
  return { ...s, loads: [load, ...s.loads] }
}

export const updateLoad = (s: DemoState, id: string, patch: Partial<Load>): DemoState => ({ ...s, loads: patchIn(s.loads, id, patch) })

export function setLoadStatus(s: DemoState, id: string, status: LoadStatus, by: string, note?: string): DemoState {
  const load = s.loads.find((l) => l.id === id)
  if (!load || load.status === status) return s
  let next: DemoState = {
    ...s,
    loads: patchIn(s.loads, id, (l) => ({ ...l, status, events: [...l.events, { id: uid('ev'), status, at: nowIso(), by, note }] })),
  }

  // Equipment & driver side effects
  const truckStatus: Partial<Record<LoadStatus, Truck['status']>> = {
    approved: 'assigned', dispatched: 'assigned', pickup: 'in-transit', 'in-transit': 'in-transit', delivered: 'available',
  }
  const t = truckStatus[status]
  if (t && load.truckId) next = { ...next, trucks: patchIn(next.trucks, load.truckId, { status: t }) }
  if (load.driverId) {
    const driverStatus: Driver['status'] | undefined = ['dispatched', 'pickup', 'in-transit'].includes(status) ? 'on-load' : status === 'delivered' ? 'available' : undefined
    if (driverStatus) next = { ...next, drivers: patchIn(next.drivers, load.driverId, { status: driverStatus }) }
  }

  // Accounting side effects
  if (status === 'pod-received' || status === 'delivered') next = ensureInvoice(next, id)
  const invoice = next.invoices.find((i) => i.loadId === id)
  if (status === 'invoiced' && invoice) next = { ...next, invoices: patchIn(next.invoices, invoice.id, { status: 'invoiced', issuedAt: nowIso() }) }
  if (status === 'completed' && invoice && invoice.status !== 'paid') next = markInvoicePaid(next, invoice.id, by, false)

  // Carrier notifications
  if (load.carrierId) {
    const kind: AppNotification['kind'] = status === 'approved' ? 'load-assigned' : status === 'delivered' ? 'missing-pod' : 'status-update'
    const title = status === 'approved' ? 'New load assigned' : status === 'delivered' ? 'Delivered — upload POD' : `Load ${LOAD_STATUS[status].label}`
    next = notify(next, { kind, title, body: `${id} · ${lane(load.pickup, load.delivery)}`, audience: 'carrier', carrierId: load.carrierId, link: `/portal/loads/${id}` })
  }
  return next
}

export function assignLoad(s: DemoState, id: string, a: { carrierId?: string; truckId?: string; driverId?: string; dispatcherId?: string }, by: string): DemoState {
  const load = s.loads.find((l) => l.id === id)
  if (!load) return s
  let next = updateLoad(s, id, a)
  if (a.truckId) next = { ...next, trucks: patchIn(next.trucks, a.truckId, (t) => ({ ...t, status: t.status === 'available' ? 'assigned' : t.status })) }
  if (load.status === 'opportunity' && a.carrierId) next = setLoadStatus(next, id, 'review', by, 'Carrier / truck matched')
  if (a.carrierId && a.carrierId !== load.carrierId) {
    next = notify(next, { kind: 'load-assigned', title: 'Load offered for review', body: `${id} · ${lane(load.pickup, load.delivery)}`, audience: 'carrier', carrierId: a.carrierId, link: `/portal/loads/${id}` })
  }
  return next
}

/** Carrier declines an offered load — it returns to the open pool and the truck is released. */
export function declineLoad(s: DemoState, id: string, by: string): DemoState {
  const load = s.loads.find((l) => l.id === id)
  if (!load) return s
  let next = updateLoad(s, id, { carrierId: undefined, truckId: undefined, driverId: undefined })
  if (load.truckId) next = { ...next, trucks: patchIn(next.trucks, load.truckId, (t) => ({ ...t, status: t.status === 'assigned' ? 'available' : t.status })) }
  next = setLoadStatus(next, id, 'opportunity', by, 'Declined by carrier')
  return notify(next, { kind: 'status-update', title: 'Load offer declined', body: `${id} declined by ${by} — back in the open pool.`, audience: 'staff', link: `/admin/loads/${id}` })
}

export function addLoadDocument(s: DemoState, id: string, kind: LoadDocumentKind, name: string, by: string): DemoState {
  const load = s.loads.find((l) => l.id === id)
  if (!load) return s
  let next = updateLoad(s, id, { documents: [...load.documents, { id: uid('ld'), kind, name, uploadedAt: nowIso(), uploadedBy: by }] })
  const step = loadStep(load.status)
  if (kind === 'pod' && step >= loadStep('pickup') && step < loadStep('pod-received')) {
    if (step < loadStep('delivered')) next = setLoadStatus(next, id, 'delivered', by)
    next = setLoadStatus(next, id, 'pod-received', by, 'Signed POD uploaded')
    next = notify(next, { kind: 'status-update', title: 'POD received', body: `${id} POD uploaded by ${by} — ready to invoice.`, audience: 'staff', link: `/admin/loads/${id}` })
  }
  if (kind === 'bol' && (load.status === 'dispatched' || load.status === 'approved')) next = setLoadStatus(next, id, 'pickup', by, 'BOL uploaded at shipper')
  if (kind === 'rate-con' && load.status === 'review') next = setLoadStatus(next, id, 'approved', by, 'Rate confirmation uploaded')
  return next
}

export const addLoadNote = (s: DemoState, id: string, text: string, by: string): DemoState =>
  updateLoad(s, id, { notes: [...(s.loads.find((l) => l.id === id)?.notes ?? []), { id: uid('note'), at: nowIso(), by, text }] })

// ---------------------------------------------------------------- fleet

export const upsertTruck = (s: DemoState, truck: Truck): DemoState => ({ ...s, trucks: upsertIn(s.trucks, truck) })
export const upsertDriver = (s: DemoState, driver: Driver): DemoState => ({ ...s, drivers: upsertIn(s.drivers, driver) })
export const updateCarrier = (s: DemoState, id: string, patch: Partial<Carrier>): DemoState => ({ ...s, carriers: patchIn(s.carriers, id, patch) })

// ---------------------------------------------------------------- documents

export function addCarrierDocument(s: DemoState, doc: Omit<CarrierDocument, 'id' | 'uploadedAt' | 'review'>): DemoState {
  const next: DemoState = { ...s, documents: [{ ...doc, id: uid('doc'), uploadedAt: nowIso(), review: 'pending' }, ...s.documents] }
  return notify(next, { kind: 'document-expiring', title: 'Document uploaded for review', body: `${doc.name} (${doc.subject}) uploaded by ${s.carriers.find((c) => c.id === doc.carrierId)?.legalName ?? 'carrier'}.`, audience: 'staff', link: '/admin/documents' })
}

export const reviewDocument = (s: DemoState, id: string, review: CarrierDocument['review']): DemoState => ({ ...s, documents: patchIn(s.documents, id, { review }) })

// ---------------------------------------------------------------- applications

export function nextApplicationId(s: DemoState) {
  const max = s.applications.reduce((m, a) => Math.max(m, Number(a.id.replace(/\D/g, '')) || 0), 1000)
  return `APP-${max + 1}`
}

export function submitApplication(s: DemoState, app: Omit<CarrierApplication, 'id' | 'status' | 'submittedAt' | 'notes'>, id = nextApplicationId(s)): { state: DemoState; id: string } {
  const application: CarrierApplication = { ...app, id, status: 'under-review', submittedAt: nowIso(), notes: [] }
  let state: DemoState = { ...s, applications: [application, ...s.applications] }
  state = notify(state, { kind: 'application', title: 'New carrier application', body: `${app.company.legalName} submitted an application (${app.equipment.truckCount} truck${app.equipment.truckCount === 1 ? '' : 's'}).`, audience: 'staff', link: `/admin/applications/${id}` })
  return { state, id }
}

export function setApplicationStatus(s: DemoState, id: string, status: ApplicationStatus, by: string, note?: string): DemoState {
  const app = s.applications.find((a) => a.id === id)
  if (!app) return s
  const notes = note ? [...app.notes, { id: uid('note'), at: nowIso(), by, text: note }] : app.notes
  let next: DemoState = { ...s, applications: patchIn(s.applications, id, { status, notes }) }
  if (status === 'approved' && !s.carriers.some((c) => c.dotNumber === app.company.dotNumber)) {
    const carrier: Carrier = {
      id: uid('c'),
      legalName: app.company.legalName,
      dba: app.company.dba || undefined,
      dotNumber: app.company.dotNumber,
      mcNumber: app.company.mcNumber,
      einLast4: app.company.ein.slice(-4),
      ownerName: `${app.owner.firstName} ${app.owner.lastName}`,
      email: app.owner.email,
      phone: app.owner.phone,
      address: app.company.address,
      equipment: app.equipment.types,
      status: 'onboarding',
      joinedAt: nowIso(),
      dispatcherId: s.session.staffUserId,
      preferredStates: app.preferences.states,
      radius: app.preferences.radius[0] ?? 'regional',
      rating: 4.5,
      onTimeRate: 100,
      insurance: app.insurance,
    }
    next = { ...next, carriers: [...next.carriers, carrier] }
  }
  return next
}

// ---------------------------------------------------------------- accounting

function ensureInvoice(s: DemoState, loadId: string): DemoState {
  const load = s.loads.find((l) => l.id === loadId)
  if (!load?.carrierId || s.invoices.some((i) => i.loadId === loadId)) return s
  const issuedAt = nowIso()
  const invoice: Invoice = {
    id: `INV-${loadId.slice(4)}`,
    loadId,
    carrierId: load.carrierId,
    brokerName: load.broker.name,
    issuedAt,
    dueAt: new Date(Date.now() + load.broker.daysToPay * 86_400_000).toISOString(),
    grossRate: load.rate,
    feePct: s.settings.dispatchFeePct,
    status: 'pending',
  }
  return { ...s, invoices: [invoice, ...s.invoices] }
}

export function sendInvoice(s: DemoState, invoiceId: string, by: string): DemoState {
  const inv = s.invoices.find((i) => i.id === invoiceId)
  if (!inv) return s
  let next: DemoState = { ...s, invoices: patchIn(s.invoices, invoiceId, { status: 'invoiced', issuedAt: nowIso() }) }
  const load = next.loads.find((l) => l.id === inv.loadId)
  if (load && loadStep(load.status) < loadStep('invoiced')) next = setLoadStatus(next, load.id, 'invoiced', by, 'Invoice sent to broker')
  return next
}

export function markInvoicePaid(s: DemoState, invoiceId: string, by: string, completeLoad = true): DemoState {
  const inv = s.invoices.find((i) => i.id === invoiceId)
  if (!inv) return s
  const f = feeBreakdown(inv.grossRate, inv.feePct)
  const at = nowIso()
  const tag = inv.id.slice(4)
  const payments: Payment[] = [
    { id: uid('pay'), invoiceId, carrierId: inv.carrierId, kind: 'broker-payment', amount: f.gross, method: 'ACH', date: at, status: 'completed', reference: `ACH-${tag}` },
    { id: uid('pay'), invoiceId, carrierId: inv.carrierId, kind: 'dispatch-fee', amount: f.fee, method: 'ACH', date: at, status: 'completed', reference: `FEE-${tag}` },
    { id: uid('pay'), invoiceId, carrierId: inv.carrierId, kind: 'carrier-payout', amount: f.net, method: 'ACH', date: at, status: 'processing', reference: `PO-${tag}` },
  ]
  let next: DemoState = {
    ...s,
    invoices: patchIn(s.invoices, invoiceId, { status: 'paid', paidAt: at }),
    payments: [...payments, ...s.payments.filter((p) => !(p.invoiceId === invoiceId && p.status === 'scheduled'))],
  }
  next = notify(next, { kind: 'payment-received', title: 'Payment received', body: `${inv.loadId}: broker paid ${moneyCents(f.gross)}. Carrier payout ${moneyCents(f.net)} processing.`, audience: 'carrier', carrierId: inv.carrierId, link: '/portal/payments' })
  if (completeLoad) {
    const load = next.loads.find((l) => l.id === inv.loadId)
    if (load && load.status !== 'completed') next = setLoadStatus(next, load.id, 'completed', by, 'Payment received')
  }
  return next
}

export const updateInvoiceFee = (s: DemoState, invoiceId: string, feePct: number): DemoState => ({ ...s, invoices: patchIn(s.invoices, invoiceId, { feePct }) })

// ---------------------------------------------------------------- communication

export function sendMessage(s: DemoState, threadId: string, text: string, from: string, fromRole: Role, channel: Channel, side: 'carrier' | 'staff'): DemoState {
  return {
    ...s,
    threads: patchIn(s.threads, threadId, (t) => ({
      ...t,
      messages: [...t.messages, { id: uid('msg'), from, fromRole, text, at: nowIso(), channel }],
      unreadForCarrier: side === 'staff' ? true : false,
      unreadForStaff: side === 'carrier' ? true : false,
    })),
  }
}

export function createThread(s: DemoState, carrierId: string, subject: string, text: string, from: string, fromRole: Role, channel: Channel, side: 'carrier' | 'staff'): { state: DemoState; id: string } {
  const id = uid('th')
  const thread = { id, carrierId, subject, unreadForCarrier: side === 'staff', unreadForStaff: side === 'carrier', messages: [{ id: uid('msg'), from, fromRole, text, at: nowIso(), channel }] }
  return { state: { ...s, threads: [thread, ...s.threads] }, id }
}

export const markThreadRead = (s: DemoState, id: string, side: 'carrier' | 'staff'): DemoState => ({
  ...s,
  threads: patchIn(s.threads, id, side === 'carrier' ? { unreadForCarrier: false } : { unreadForStaff: false }),
})

export const markNotificationsRead = (s: DemoState, audience: 'carrier' | 'staff', carrierId?: string): DemoState => ({
  ...s,
  notifications: s.notifications.map((n) => (n.audience === audience && (!carrierId || n.carrierId === carrierId) ? { ...n, read: true } : n)),
})

export const markNotificationRead = (s: DemoState, id: string): DemoState => ({ ...s, notifications: patchIn(s.notifications, id, { read: true }) })

export const sendTestNotification = (s: DemoState, n: Omit<AppNotification, 'id' | 'read' | 'at' | 'channels'>, channels?: Channel[]) => notify(s, { ...n, channels })

// ---------------------------------------------------------------- load board (DEMO DATA)

export const toggleSaveOpportunity = (s: DemoState, id: string): DemoState => ({ ...s, opportunities: patchIn(s.opportunities, id, (o) => ({ ...o, saved: !o.saved })) })
export const negotiateOpportunity = (s: DemoState, id: string, rate: number): DemoState => ({ ...s, opportunities: patchIn(s.opportunities, id, { rate }) })

export function assignOpportunity(s: DemoState, oppId: string, a: { carrierId: string; truckId?: string; driverId?: string }, by: string): { state: DemoState; loadId: string } {
  const o = s.opportunities.find((x) => x.id === oppId)
  if (!o) return { state: s, loadId: '' }
  const broker = { name: o.broker, mcNumber: 'MC-DEMO', contact: 'Broker Desk', phone: '(800) 555-0150', email: 'loads@broker.demo', rating: o.brokerRating, daysToPay: o.daysToPay }
  const delivery = new Date(new Date(o.pickupDate).getTime() + Math.max(1, Math.ceil(o.miles / 500)) * 86_400_000).toISOString()
  const stopOf = (c: { city: string; state: string }, at: string, facility: string) => ({ facility, street: 'Address provided on rate confirmation', city: c.city, state: c.state, zip: '—', appointment: at, window: '8:00 AM – 10:00 AM', contact: 'Facility', phone: '(800) 555-0101' })
  const loadId = nextLoadId(s)
  let state = createLoad(
    s,
    {
      equipment: o.equipment,
      carrierId: a.carrierId,
      truckId: a.truckId,
      driverId: a.driverId,
      dispatcherId: s.session.staffUserId,
      broker,
      pickup: stopOf(o.origin, o.pickupDate, 'Shipper (from load board)'),
      delivery: stopOf(o.destination, delivery, 'Receiver (from load board)'),
      miles: o.miles,
      rate: o.rate,
      weightLbs: o.weightLbs,
      commodity: 'General freight',
      reference: o.id,
      source: o.source === 'DAT' ? 'DAT (demo)' : 'Truckstop (demo)',
      status: 'review',
    },
    by,
  )
  if (a.truckId) state = { ...state, trucks: patchIn(state.trucks, a.truckId, (t) => ({ ...t, status: t.status === 'available' ? 'assigned' : t.status })) }
  state = { ...state, opportunities: patchIn(state.opportunities, oppId, { assignedLoadId: loadId }) }
  state = notify(state, { kind: 'load-assigned', title: 'Load offered for review', body: `${loadId} · ${lane(o.origin, o.destination)}`, audience: 'carrier', carrierId: a.carrierId, link: `/portal/loads/${loadId}` })
  return { state, loadId }
}

// ---------------------------------------------------------------- admin

export const setIntegrationStatus = (s: DemoState, id: string, status: Integration['status']): DemoState => ({ ...s, integrations: patchIn(s.integrations, id, { status }) })
export const upsertUser = (s: DemoState, user: StaffUser): DemoState => ({ ...s, users: upsertIn(s.users, user) })
