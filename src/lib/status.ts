import type {
  ApplicationStatus,
  CarrierStatus,
  DocumentStatus,
  DriverStatus,
  IntegrationStatus,
  InvoiceStatus,
  LoadStatus,
  PaymentStatus,
  TruckStatus,
} from '@/data/types'

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'progress' | 'brand' | 'violet'

export interface StatusMeta {
  label: string
  tone: Tone
  description?: string
}

/** Ordered load lifecycle (proposal section 8). */
export const LOAD_FLOW: LoadStatus[] = [
  'opportunity',
  'review',
  'approved',
  'dispatched',
  'pickup',
  'in-transit',
  'delivered',
  'pod-received',
  'invoiced',
  'completed',
]

export const LOAD_STATUS: Record<LoadStatus, StatusMeta> = {
  opportunity: { label: 'Opportunity', tone: 'neutral', description: 'Load identified on a load board or from a broker' },
  review: { label: 'Review', tone: 'violet', description: 'Carrier/truck matched — rate under review or negotiation' },
  approved: { label: 'Approved', tone: 'info', description: 'Carrier approved the load; rate confirmation pending/signed' },
  dispatched: { label: 'Dispatched', tone: 'brand', description: 'Dispatch sheet sent to the driver' },
  pickup: { label: 'Pickup', tone: 'progress', description: 'Driver checked in / loaded at shipper' },
  'in-transit': { label: 'In Transit', tone: 'progress', description: 'Freight on the road to the receiver' },
  delivered: { label: 'Delivered', tone: 'success', description: 'Delivery confirmed at receiver' },
  'pod-received': { label: 'POD Received', tone: 'success', description: 'Signed BOL/POD uploaded' },
  invoiced: { label: 'Invoiced', tone: 'warning', description: 'Invoice and dispatch fee processing' },
  completed: { label: 'Completed', tone: 'neutral', description: 'Paid and archived' },
}

export const loadStep = (s: LoadStatus) => LOAD_FLOW.indexOf(s)
export const nextLoadStatus = (s: LoadStatus): LoadStatus | undefined => LOAD_FLOW[loadStep(s) + 1]

/** Statuses where a load is actively moving (counts as "active"). */
export const ACTIVE_LOAD_STATUSES: LoadStatus[] = ['approved', 'dispatched', 'pickup', 'in-transit', 'delivered']

/** Carrier-facing timeline (load detail page). `reachedAt` is the first status that completes the step. */
export const LOAD_TIMELINE: { key: string; label: string; reachedAt: LoadStatus }[] = [
  { key: 'assigned', label: 'Load Assigned', reachedAt: 'approved' },
  { key: 'rate-con', label: 'Rate Confirmation', reachedAt: 'approved' },
  { key: 'dispatched', label: 'Dispatched', reachedAt: 'dispatched' },
  { key: 'pickup', label: 'Pickup', reachedAt: 'pickup' },
  { key: 'in-transit', label: 'In Transit', reachedAt: 'in-transit' },
  { key: 'delivered', label: 'Delivered', reachedAt: 'delivered' },
  { key: 'pod', label: 'POD Uploaded', reachedAt: 'pod-received' },
  { key: 'invoiced', label: 'Invoiced', reachedAt: 'invoiced' },
  { key: 'completed', label: 'Completed', reachedAt: 'completed' },
]

export const APPLICATION_STATUS: Record<ApplicationStatus, StatusMeta> = {
  draft: { label: 'Draft', tone: 'neutral' },
  submitted: { label: 'Submitted', tone: 'info' },
  'under-review': { label: 'Under Review', tone: 'violet' },
  'info-required': { label: 'Info Required', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
}

export const TRUCK_STATUS: Record<TruckStatus, StatusMeta> = {
  available: { label: 'Available', tone: 'success' },
  assigned: { label: 'Assigned', tone: 'info' },
  'in-transit': { label: 'In Transit', tone: 'progress' },
  maintenance: { label: 'Maintenance', tone: 'warning' },
  inactive: { label: 'Inactive', tone: 'neutral' },
}

export const DOCUMENT_STATUS: Record<DocumentStatus, StatusMeta> = {
  valid: { label: 'Valid', tone: 'success' },
  expiring: { label: 'Expiring Soon', tone: 'warning' },
  expired: { label: 'Expired', tone: 'danger' },
  pending: { label: 'Pending Review', tone: 'info' },
}

export const INVOICE_STATUS: Record<InvoiceStatus, StatusMeta> = {
  pending: { label: 'Pending', tone: 'neutral' },
  invoiced: { label: 'Invoiced', tone: 'info' },
  paid: { label: 'Paid', tone: 'success' },
  overdue: { label: 'Overdue', tone: 'danger' },
}

export const PAYMENT_STATUS: Record<PaymentStatus, StatusMeta> = {
  scheduled: { label: 'Scheduled', tone: 'neutral' },
  processing: { label: 'Processing', tone: 'info' },
  completed: { label: 'Completed', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
}

export const CARRIER_STATUS: Record<CarrierStatus, StatusMeta> = {
  active: { label: 'Active', tone: 'success' },
  onboarding: { label: 'Onboarding', tone: 'info' },
  suspended: { label: 'Suspended', tone: 'danger' },
  inactive: { label: 'Inactive', tone: 'neutral' },
}

export const DRIVER_STATUS: Record<DriverStatus, StatusMeta> = {
  available: { label: 'Available', tone: 'success' },
  'on-load': { label: 'On Load', tone: 'progress' },
  'off-duty': { label: 'Off Duty', tone: 'neutral' },
  inactive: { label: 'Inactive', tone: 'neutral' },
}

export const INTEGRATION_STATUS: Record<IntegrationStatus, StatusMeta> = {
  connected: { label: 'Connected (Demo)', tone: 'success' },
  'not-connected': { label: 'Not Connected', tone: 'neutral' },
  'coming-soon': { label: 'Coming Soon', tone: 'violet' },
  'requires-api': { label: 'Requires API Access', tone: 'warning' },
}

export const STATUS_MAPS = {
  load: LOAD_STATUS,
  application: APPLICATION_STATUS,
  truck: TRUCK_STATUS,
  document: DOCUMENT_STATUS,
  invoice: INVOICE_STATUS,
  payment: PAYMENT_STATUS,
  carrier: CARRIER_STATUS,
  driver: DRIVER_STATUS,
  integration: INTEGRATION_STATUS,
} as const

export type StatusKind = keyof typeof STATUS_MAPS
