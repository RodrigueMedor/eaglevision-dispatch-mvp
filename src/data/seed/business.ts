/**
 * SAMPLE DATA — applications, finance, communications, load-board and integration
 * records. All fictional; dispatch fee percentages are configurable demo values.
 */
import type {
  AppNotification,
  CarrierApplication,
  Integration,
  Invoice,
  Load,
  LoadOpportunity,
  MessageThread,
  Payment,
  PlatformSettings,
} from '@/data/types'
import { daysFromNow, hoursAgo } from '@/lib/dates'
import { feeBreakdown } from '@/lib/fees'

export const DEFAULT_FEE_PCT = 3

export function seedSettings(): PlatformSettings {
  return {
    companyName: 'Eagle Vision Dispatch',
    dispatchFeePct: DEFAULT_FEE_PCT,
    supportEmail: 'support@eaglevisiondispatch.demo',
    supportPhone: '(800) 555-0199',
    requireMfaForStaff: true,
    documentExpiryWarningDays: 30,
    notificationChannels: {
      'load-assigned': ['in-app', 'sms', 'email'],
      'pickup-reminder': ['in-app', 'sms'],
      'delivery-reminder': ['in-app', 'sms'],
      'missing-pod': ['in-app', 'sms', 'email'],
      'document-expiring': ['in-app', 'email'],
      'payment-received': ['in-app', 'email'],
      application: ['in-app', 'email'],
      'status-update': ['in-app'],
    },
  }
}

export function seedInvoices(loads: Load[]): Invoice[] {
  const invoices: Invoice[] = []
  for (const load of loads) {
    if (!load.carrierId) continue
    const delivered = load.events.find((e) => e.status === 'delivered')?.at
    if (!delivered) continue
    const base = { loadId: load.id, carrierId: load.carrierId, brokerName: load.broker.name, grossRate: load.rate, feePct: DEFAULT_FEE_PCT }
    const issued = new Date(Math.min(new Date(delivered).getTime() + 86_400_000, Date.now())).toISOString()
    const due = new Date(new Date(issued).getTime() + load.broker.daysToPay * 86_400_000).toISOString()
    if (load.status === 'pod-received' || load.status === 'delivered') {
      invoices.push({ ...base, id: `INV-${load.id.slice(4)}`, issuedAt: issued, dueAt: due, status: 'pending' })
    } else if (load.status === 'invoiced') {
      invoices.push({ ...base, id: `INV-${load.id.slice(4)}`, issuedAt: issued, dueAt: due, status: new Date(due).getTime() < Date.now() ? 'overdue' : 'invoiced' })
    } else if (load.status === 'completed') {
      const paid = new Date(Math.min(new Date(due).getTime() - 3 * 86_400_000, Date.now() - 86_400_000)).toISOString()
      invoices.push({ ...base, id: `INV-${load.id.slice(4)}`, issuedAt: issued, dueAt: due, status: 'paid', paidAt: paid })
    }
  }
  return invoices
}

export function seedPayments(invoices: Invoice[]): Payment[] {
  const payments: Payment[] = []
  for (const inv of invoices) {
    if (inv.status !== 'paid' || !inv.paidAt) continue
    const f = feeBreakdown(inv.grossRate, inv.feePct)
    const tag = inv.id.slice(4)
    payments.push(
      { id: `PAY-${tag}-B`, invoiceId: inv.id, carrierId: inv.carrierId, kind: 'broker-payment', amount: f.gross, method: 'ACH', date: inv.paidAt, status: 'completed', reference: `ACH-${tag}01` },
      { id: `PAY-${tag}-F`, invoiceId: inv.id, carrierId: inv.carrierId, kind: 'dispatch-fee', amount: f.fee, method: 'ACH', date: inv.paidAt, status: 'completed', reference: `FEE-${tag}` },
      { id: `PAY-${tag}-C`, invoiceId: inv.id, carrierId: inv.carrierId, kind: 'carrier-payout', amount: f.net, method: 'ACH', date: inv.paidAt, status: 'completed', reference: `PO-${tag}02` },
    )
  }
  const pending = invoices.find((i) => i.status === 'invoiced')
  if (pending) {
    const f = feeBreakdown(pending.grossRate, pending.feePct)
    payments.push({ id: `PAY-${pending.id.slice(4)}-C`, invoiceId: pending.id, carrierId: pending.carrierId, kind: 'carrier-payout', amount: f.net, method: 'Quick Pay', date: daysFromNow(2), status: 'scheduled', reference: 'QP-PENDING' })
  }
  return payments
}

export function seedApplications(): CarrierApplication[] {
  const docs = (missing: string[] = []): CarrierApplication['documents'] =>
    (
      [
        ['w9', 'W-9'],
        ['coi', 'Certificate of Insurance'],
        ['mc-authority', 'MC Authority'],
        ['cdl', "Driver's License"],
        ['registration', 'Truck Registration'],
      ] as const
    ).map(([type, name]) => ({ type, name, status: missing.includes(type) ? 'missing' : 'received' }))

  return [
    {
      id: 'APP-1042', status: 'submitted', submittedAt: hoursAgo(3),
      owner: { firstName: 'Omar', lastName: 'Haddad', email: 'omar@coastalboxfreight.demo', phone: '(904) 555-0133' },
      company: { legalName: 'Coastal Box Freight LLC', dba: '', dotNumber: '4108821', mcNumber: 'MC-1452290', ein: '••-•••7731', address: { street: '880 Busch Dr', city: 'Jacksonville', state: 'FL', zip: '32218' } },
      equipment: { types: ['box-truck'], truckCount: 2, trucks: [
        { equipment: 'box-truck', year: '2023', make: 'Isuzu', model: 'NRR', vin: 'DEMO-VIN-PENDING-01', dimensions: `26' × 102" × 102"`, capacityLbs: '10000' },
        { equipment: 'box-truck', year: '2021', make: 'Hino', model: '268', vin: 'DEMO-VIN-PENDING-02', dimensions: `24' × 96" × 96"`, capacityLbs: '8500' },
      ] },
      preferences: { states: ['FL', 'GA', 'SC'], lanes: 'Jacksonville ↔ Savannah, Jacksonville → Orlando', radius: ['local', 'regional'], maxDistance: 500, minRatePerMile: 2.25, availability: 'Mon–Sat' },
      insurance: { provider: 'Sample Mutual Insurance Co.', policyNumber: 'SMI-26-100231', autoLiability: 1_000_000, cargo: 100_000, expiresAt: daysFromNow(355) },
      documents: docs(), notes: [],
    },
    {
      id: 'APP-1041', status: 'under-review', submittedAt: hoursAgo(28), reviewerId: 'u3',
      owner: { firstName: 'Grace', lastName: 'Whitaker', email: 'grace@lonestarreefer.demo', phone: '(210) 555-0108' },
      company: { legalName: 'Lone Star Reefer Co. LLC', dba: 'LSR Cold Chain', dotNumber: '3922047', mcNumber: 'MC-1330815', ein: '••-•••1902', address: { street: '400 Rittiman Rd', city: 'San Antonio', state: 'TX', zip: '78218' } },
      equipment: { types: ['reefer'], truckCount: 3, trucks: [
        { equipment: 'reefer', year: '2022', make: 'Freightliner', model: 'Cascadia', vin: 'DEMO-VIN-PENDING-03', dimensions: `53' Reefer`, capacityLbs: '43500' },
      ] },
      preferences: { states: ['TX', 'LA', 'OK', 'AR'], lanes: 'Texas triangle, produce out of the Rio Grande Valley', radius: ['regional', 'otr'], maxDistance: 1200, minRatePerMile: 2.6, availability: '24/7 with team drivers' },
      insurance: { provider: 'Example Commercial Assurance', policyNumber: 'ECA-5510283', autoLiability: 1_000_000, cargo: 250_000, expiresAt: daysFromNow(210) },
      documents: docs(['registration']), notes: [{ id: 'n1', at: hoursAgo(20), by: 'Maya Thompson', text: 'Authority verified on SAFER (demo). Waiting on trailer registration.' }],
    },
    {
      id: 'APP-1040', status: 'info-required', submittedAt: hoursAgo(60), reviewerId: 'u5',
      owner: { firstName: 'Samuel', lastName: 'Osei', email: 'sam@redriverhotshot.demo', phone: '(469) 555-0177' },
      company: { legalName: 'Red River Hotshot LLC', dba: '', dotNumber: '4120554', mcNumber: 'MC-1460031', ein: '••-•••5520', address: { street: '1200 E Lamar Blvd', city: 'Arlington', state: 'TX', zip: '76011' } },
      equipment: { types: ['hotshot'], truckCount: 1, trucks: [
        { equipment: 'hotshot', year: '2024', make: 'Ford', model: 'F-450 + 40\' Gooseneck', vin: 'DEMO-VIN-PENDING-04', dimensions: `40' Gooseneck`, capacityLbs: '16000' },
      ] },
      preferences: { states: ['TX', 'OK', 'NM'], lanes: 'DFW outbound, Permian Basin', radius: ['regional'], maxDistance: 700, minRatePerMile: 1.9, availability: 'Mon–Fri' },
      insurance: { provider: 'Example Commercial Assurance', policyNumber: 'ECA-6620014', autoLiability: 750_000, cargo: 100_000, expiresAt: daysFromNow(300) },
      documents: docs(['coi', 'w9']), notes: [{ id: 'n2', at: hoursAgo(40), by: 'Sofia Ramirez', text: 'Requested updated COI listing Eagle Vision Dispatch as certificate holder, plus signed W-9.' }],
    },
    {
      id: 'APP-1039', status: 'approved', submittedAt: hoursAgo(150), reviewerId: 'u5',
      owner: { firstName: 'Brandon', lastName: 'Hayes', email: 'brandon@gulfcoasthaulers.demo', phone: '(713) 555-0151' },
      company: { legalName: 'Gulf Coast Haulers LLC', dba: '', dotNumber: '4012935', mcNumber: 'MC-1401872', ein: '••-•••6620', address: { street: '9200 Market St', city: 'Houston', state: 'TX', zip: '77029' } },
      equipment: { types: ['box-truck', 'straight-truck'], truckCount: 2, trucks: [
        { equipment: 'box-truck', year: '2024', make: 'Isuzu', model: 'FTR', vin: 'DEMO-VIN-0013', dimensions: `26' × 102" × 102"`, capacityLbs: '10000' },
      ] },
      preferences: { states: ['TX', 'LA'], lanes: 'Houston metro, Houston ↔ Dallas', radius: ['local', 'regional'], maxDistance: 400, minRatePerMile: 2.4, availability: 'Mon–Sat' },
      insurance: { provider: 'Example Commercial Assurance', policyNumber: 'ECA-9013350', autoLiability: 1_000_000, cargo: 100_000, expiresAt: daysFromNow(330) },
      documents: docs(), notes: [{ id: 'n3', at: hoursAgo(144), by: 'Sofia Ramirez', text: 'Approved — carrier account created and welcome email sent.' }],
    },
    {
      id: 'APP-1038', status: 'rejected', submittedAt: hoursAgo(240), reviewerId: 'u4',
      owner: { firstName: 'Victor', lastName: 'Lane', email: 'victor@quickmoveexpress.demo', phone: '(615) 555-0102' },
      company: { legalName: 'QuickMove Express LLC', dba: '', dotNumber: '4155009', mcNumber: 'MC-— (pending)', ein: '••-•••0091', address: { street: '55 Harding Pl', city: 'Nashville', state: 'TN', zip: '37211' } },
      equipment: { types: ['straight-truck'], truckCount: 1, trucks: [] },
      preferences: { states: ['TN'], lanes: 'Nashville local', radius: ['local'], maxDistance: 150, minRatePerMile: 3, availability: 'Weekends' },
      insurance: { provider: '—', policyNumber: '—', autoLiability: 0, cargo: 0, expiresAt: daysFromNow(-1) },
      documents: docs(['coi', 'mc-authority', 'registration']), notes: [{ id: 'n4', at: hoursAgo(230), by: 'Andre Collins', text: 'Rejected: MC authority not yet active and no insurance on file. Invited to reapply.' }],
    },
    {
      id: 'APP-1043', status: 'draft', submittedAt: hoursAgo(1),
      owner: { firstName: 'Elena', lastName: 'Fischer', email: 'elena@northgateflatbed.demo', phone: '(317) 555-0166' },
      company: { legalName: 'Northgate Flatbed LLC', dba: '', dotNumber: '4167730', mcNumber: 'MC-1471208', ein: '••-•••4410', address: { street: '3100 S Harding St', city: 'Indianapolis', state: 'IN', zip: '46217' } },
      equipment: { types: ['flatbed', 'step-deck'], truckCount: 4, trucks: [] },
      preferences: { states: ['IN', 'OH', 'IL', 'KY'], lanes: 'Midwest steel lanes', radius: ['regional', 'otr'], maxDistance: 900, minRatePerMile: 2.75, availability: 'Mon–Fri' },
      insurance: { provider: 'Sample Mutual Insurance Co.', policyNumber: '—', autoLiability: 1_000_000, cargo: 100_000, expiresAt: daysFromNow(200) },
      documents: docs(['coi', 'w9', 'registration', 'cdl']), notes: [],
    },
  ]
}

export function seedThreads(): MessageThread[] {
  return [
    {
      id: 'th1', carrierId: 'c1', subject: 'EVD-24101 · Orlando → Atlanta', loadId: 'EVD-24101', unreadForCarrier: true, unreadForStaff: false,
      messages: [
        { id: 'm1', from: 'Maya Thompson', fromRole: 'dispatcher', text: 'Luis, rate con is signed. Pickup at Sunbelt DC dock 14. Shipper says 14 pallets, no touch.', at: hoursAgo(7), channel: 'in-app' },
        { id: 'm2', from: 'Luis Ortega', fromRole: 'driver', text: 'Copy. Checked in, waiting on door.', at: hoursAgo(5.5), channel: 'sms' },
        { id: 'm3', from: 'System', fromRole: 'system', text: 'Status updated to In Transit by Luis Ortega.', at: hoursAgo(4), channel: 'in-app' },
        { id: 'm4', from: 'Maya Thompson', fromRole: 'dispatcher', text: 'Receiver confirmed appointment tomorrow. Please send BOL photo when you can.', at: hoursAgo(1), channel: 'in-app' },
      ],
    },
    {
      id: 'th2', carrierId: 'c1', subject: 'Insurance renewal reminder', unreadForCarrier: false, unreadForStaff: true,
      messages: [
        { id: 'm5', from: 'Jordan Lee', fromRole: 'support', text: 'Hi Marcus — your Certificate of Insurance expires soon. Please upload the renewed COI in the Document Center.', at: hoursAgo(30), channel: 'email' },
        { id: 'm6', from: 'Marcus Reed', fromRole: 'carrier', text: 'Agent is sending it this week. I will upload as soon as I get it.', at: hoursAgo(2), channel: 'in-app' },
      ],
    },
    {
      id: 'th3', carrierId: 'c2', subject: 'EVD-24109 · Reefer temp check', loadId: 'EVD-24109', unreadForCarrier: false, unreadForStaff: true,
      messages: [
        { id: 'm7', from: 'Andre Collins', fromRole: 'dispatcher', text: 'Rafael, broker asking for a reefer download at delivery. Set point 34°F continuous.', at: hoursAgo(9), channel: 'sms' },
        { id: 'm8', from: 'Rafael Mendez', fromRole: 'driver', text: 'Running continuous at 34. Will print download at receiver.', at: hoursAgo(0.5), channel: 'sms' },
      ],
    },
    {
      id: 'th4', carrierId: 'c4', subject: 'COI expired — dispatch on hold', unreadForCarrier: true, unreadForStaff: false,
      messages: [
        { id: 'm9', from: 'Sofia Ramirez', fromRole: 'dispatcher', text: 'Jesse, your COI on file has expired. New loads are on hold until we receive the renewal.', at: hoursAgo(20), channel: 'email' },
      ],
    },
    {
      id: 'th5', carrierId: 'c5', subject: 'EVD-24120 · POD needed', loadId: 'EVD-24120', unreadForCarrier: true, unreadForStaff: false,
      messages: [
        { id: 'm10', from: 'System', fromRole: 'system', text: 'Missing POD reminder sent by SMS to Mark Kowalski.', at: hoursAgo(3), channel: 'sms' },
      ],
    },
  ]
}

export function seedNotifications(): AppNotification[] {
  let n = 0
  const note = (p: Omit<AppNotification, 'id' | 'read'> & { read?: boolean }): AppNotification => ({ id: `nt${++n}`, read: false, ...p })
  return [
    note({ kind: 'load-assigned', title: 'New load assigned', body: 'EVD-24103 · Atlanta, GA → Charlotte, NC assigned to EVT-103.', at: hoursAgo(1.2), channels: ['in-app', 'sms', 'email'], audience: 'carrier', carrierId: 'c1', link: '/portal/loads/EVD-24103' }),
    note({ kind: 'pickup-reminder', title: 'Pickup reminder', body: 'EVD-24102 pickup tomorrow at Port Miami Cold Storage. Liftgate required.', at: hoursAgo(2), channels: ['in-app', 'sms'], audience: 'carrier', carrierId: 'c1', link: '/portal/loads/EVD-24102' }),
    note({ kind: 'delivery-reminder', title: 'Delivery reminder', body: 'EVD-24101 delivery appointment tomorrow at Peachtree Retail DC.', at: hoursAgo(3), channels: ['in-app', 'sms'], audience: 'carrier', carrierId: 'c1', link: '/portal/loads/EVD-24101' }),
    note({ kind: 'missing-pod', title: 'POD missing', body: 'Upload the signed POD for EVD-24108 so we can invoice the broker.', at: hoursAgo(5), channels: ['in-app', 'sms', 'email'], audience: 'carrier', carrierId: 'c1', link: '/portal/loads/EVD-24108' }),
    note({ kind: 'document-expiring', title: 'Certificate of Insurance expiring', body: 'Your COI expires in 18 days. Upload the renewal to avoid dispatch holds.', at: hoursAgo(20), channels: ['in-app', 'email'], audience: 'carrier', carrierId: 'c1', link: '/portal/documents' }),
    note({ kind: 'payment-received', title: 'Payment received', body: 'Broker payment for EVD-24106 received. Carrier payout of $756.60 sent by ACH.', at: hoursAgo(48), channels: ['in-app', 'email'], audience: 'carrier', carrierId: 'c1', link: '/portal/payments', read: true }),
    note({ kind: 'application', title: 'New carrier application', body: 'Coastal Box Freight LLC submitted an application (2 box trucks).', at: hoursAgo(3), channels: ['in-app', 'email'], audience: 'staff', link: '/admin/applications/APP-1042' }),
    note({ kind: 'missing-pod', title: 'POD overdue', body: 'EVD-24120 delivered yesterday — POD still missing (Prairie Line Carriers).', at: hoursAgo(3), channels: ['in-app'], audience: 'staff', link: '/admin/loads/EVD-24120' }),
    note({ kind: 'document-expiring', title: 'COI expired', body: 'RoadStar Transport LLC certificate of insurance expired 4 days ago.', at: hoursAgo(6), channels: ['in-app', 'email'], audience: 'staff', link: '/admin/documents' }),
    note({ kind: 'status-update', title: 'Load picked up', body: 'EVD-24112 picked up at Peachtree Retail DC by Calvin Price.', at: hoursAgo(1), channels: ['in-app'], audience: 'staff', link: '/admin/loads/EVD-24112' }),
    note({ kind: 'payment-received', title: 'Broker payment received', body: 'Summit Freight Brokerage paid INV-24110 ($2,500.00).', at: hoursAgo(26), channels: ['in-app'], audience: 'staff', link: '/admin/invoices', read: true }),
  ]
}

export function seedOpportunities(): LoadOpportunity[] {
  const o = (id: string, source: LoadOpportunity['source'], oc: string, os: string, dc: string, ds: string, day: number, equipment: LoadOpportunity['equipment'], miles: number, weightLbs: number, rate: number, broker: string, brokerRating: number, daysToPay: number, postedMinutesAgo: number): LoadOpportunity => ({
    id, source, origin: { city: oc, state: os }, destination: { city: dc, state: ds }, pickupDate: daysFromNow(day, 8), equipment, miles, weightLbs, rate, broker, brokerRating, daysToPay, postedMinutesAgo, saved: false,
  })
  return [
    o('LB-9001', 'DAT', 'Orlando', 'FL', 'Atlanta', 'GA', 1, 'box-truck', 440, 7800, 1200, 'Summit Freight Brokerage', 4.7, 21, 4),
    o('LB-9002', 'Truckstop', 'Miami', 'FL', 'Jacksonville', 'FL', 1, 'box-truck', 345, 6000, 925, 'Harborline Brokerage', 4.8, 15, 9),
    o('LB-9003', 'DAT', 'Atlanta', 'GA', 'Charlotte', 'NC', 2, 'dry-van', 245, 36000, 860, 'Keystone Logistics Group', 4.5, 30, 12),
    o('LB-9004', 'DAT', 'Dallas', 'TX', 'Houston', 'TX', 1, 'hotshot', 240, 11000, 650, 'TrueNorth Freight', 4.2, 35, 18),
    o('LB-9005', 'Truckstop', 'Chicago', 'IL', 'Indianapolis', 'IN', 1, 'power-only', 180, 38000, 620, 'Keystone Logistics Group', 4.5, 30, 22),
    o('LB-9006', 'DAT', 'Tampa', 'FL', 'Nashville', 'TN', 2, 'reefer', 760, 40000, 2450, 'Crescent Logistics', 4.6, 25, 27),
    o('LB-9007', 'Truckstop', 'Birmingham', 'AL', 'Atlanta', 'GA', 1, 'flatbed', 147, 44000, 700, 'TrueNorth Freight', 4.2, 35, 31),
    o('LB-9008', 'DAT', 'Jacksonville', 'FL', 'Savannah', 'GA', 1, 'box-truck', 140, 5500, 520, 'Harborline Brokerage', 4.8, 15, 35),
    o('LB-9009', 'DAT', 'Houston', 'TX', 'New Orleans', 'LA', 2, 'step-deck', 350, 41000, 1350, 'Crescent Logistics', 4.6, 25, 40),
    o('LB-9010', 'Truckstop', 'Memphis', 'TN', 'Nashville', 'TN', 1, 'straight-truck', 210, 8000, 640, 'Redline Transport Brokers', 3.9, 45, 46),
    o('LB-9011', 'DAT', 'Savannah', 'GA', 'Orlando', 'FL', 3, 'dry-van', 280, 30000, 900, 'Summit Freight Brokerage', 4.7, 21, 55),
    o('LB-9012', 'Truckstop', 'Charlotte', 'NC', 'Raleigh', 'NC', 1, 'box-truck', 170, 6200, 560, 'Keystone Logistics Group', 4.5, 30, 63),
    o('LB-9013', 'DAT', 'Dallas', 'TX', 'Oklahoma City', 'OK', 2, 'flatbed', 205, 45000, 790, 'TrueNorth Freight', 4.2, 35, 70),
    o('LB-9014', 'DAT', 'Indianapolis', 'IN', 'Columbus', 'OH', 2, 'reefer', 175, 38000, 720, 'Redline Transport Brokers', 3.9, 45, 88),
  ]
}

export function seedIntegrations(): Integration[] {
  return [
    { id: 'dat', name: 'DAT', category: 'Load Board', status: 'requires-api', brandColor: '#0057b8', description: 'Load search, rate insights and load import from the DAT load board.', features: ['Load search & import', 'Market rate lookups', 'Broker credit data'], note: 'Requires an authorized DAT API agreement. The Load Board screen uses SAMPLE data only — no scraping.' },
    { id: 'truckstop', name: 'Truckstop', category: 'Load Board', status: 'requires-api', brandColor: '#d7262e', description: 'Load search and posting via Truckstop APIs.', features: ['Load search & import', 'Rate analysis', 'Broker profiles'], note: 'Requires Truckstop API access and commercial approval. SAMPLE data only until then.' },
    { id: 'twilio', name: 'Twilio', category: 'Communication', status: 'connected', brandColor: '#f22f46', description: 'SMS notifications for load assignments, reminders and missing PODs.', features: ['Load assigned SMS', 'Pickup / delivery reminders', 'Two-factor codes (optional)'], note: 'Demo mode — messages are simulated, nothing is sent.' },
    { id: 'email', name: 'Transactional Email', category: 'Communication', status: 'connected', brandColor: '#1a82e2', description: 'Account verification, alerts and transactional email (SendGrid, SES or similar).', features: ['Email verification', 'Password reset', 'Document expiry alerts'], note: 'Demo mode — emails are simulated.' },
    { id: 'maps', name: 'Google Maps', category: 'Maps', status: 'not-connected', brandColor: '#34a853', description: 'Address validation, routing and mileage calculation.', features: ['Address autocomplete', 'Route & mileage', 'Location tracking (future)'] },
    { id: 'stripe', name: 'Stripe', category: 'Payments', status: 'not-connected', brandColor: '#635bff', description: 'Collect dispatch fees and process carrier payments.', features: ['Dispatch fee collection', 'ACH / card payments', 'Payment receipts'] },
    { id: 'quickbooks', name: 'QuickBooks Online', category: 'Accounting', status: 'coming-soon', brandColor: '#2ca01c', description: 'Sync invoices, payments and dispatch fees to accounting.', features: ['Invoice sync', 'Payment sync', 'Chart of accounts mapping'] },
    { id: 'docusign', name: 'DocuSign', category: 'E-Signature', status: 'coming-soon', brandColor: '#ffcc22', description: 'Electronic signature for dispatch agreements and rate confirmations.', features: ['Dispatch agreement e-sign', 'Rate confirmation signing', 'Signed document archive'] },
    { id: 'safer', name: 'FMCSA SAFER', category: 'Compliance', status: 'coming-soon', brandColor: '#1f3655', description: 'Verify DOT/MC authority and safety status during onboarding.', features: ['Authority verification', 'Insurance on file check', 'Safety rating lookup'] },
    { id: 'storage', name: 'Secure Object Storage', category: 'Storage', status: 'connected', brandColor: '#5f7ba3', description: 'Private S3-compatible storage for carrier and shipment documents.', features: ['Encrypted at rest', 'Signed download URLs', 'Retention policies'], note: 'Demo mode — uploads stay in your browser.' },
  ]
}
