/**
 * Domain model for the Eagle Vision Dispatch platform.
 *
 * These types intentionally mirror the planned Spring Boot / PostgreSQL entities
 * (Carrier, Truck, Driver, Load, Document, Invoice, ...) so the mock services in
 * `src/services` can later be replaced by REST clients without touching the UI.
 */

export type ID = string
/** ISO-8601 timestamp */
export type ISODate = string

export type EquipmentType =
  | 'box-truck'
  | 'dry-van'
  | 'reefer'
  | 'flatbed'
  | 'step-deck'
  | 'hotshot'
  | 'power-only'
  | 'straight-truck'

/** Mirrors the proposal's load workflow (section 8), condensed into 10 tracked statuses. */
export type LoadStatus =
  | 'opportunity'
  | 'review'
  | 'approved'
  | 'dispatched'
  | 'pickup'
  | 'in-transit'
  | 'delivered'
  | 'pod-received'
  | 'invoiced'
  | 'completed'

export type ApplicationStatus = 'draft' | 'submitted' | 'under-review' | 'info-required' | 'approved' | 'rejected'
export type TruckStatus = 'available' | 'assigned' | 'in-transit' | 'maintenance' | 'inactive'
export type DocumentStatus = 'valid' | 'expiring' | 'expired' | 'pending'
export type InvoiceStatus = 'pending' | 'invoiced' | 'paid' | 'overdue'
export type PaymentStatus = 'scheduled' | 'processing' | 'completed' | 'failed'
export type CarrierStatus = 'active' | 'onboarding' | 'suspended' | 'inactive'
export type DriverStatus = 'available' | 'on-load' | 'off-duty' | 'inactive'
export type OperatingRadius = 'local' | 'regional' | 'otr'

export type StaffRole = 'super-admin' | 'admin' | 'dispatcher' | 'accounting' | 'support'
export type PortalRole = 'carrier' | 'driver'
export type Role = StaffRole | PortalRole

export interface Address {
  street: string
  city: string
  state: string
  zip: string
}

export interface Carrier {
  id: ID
  legalName: string
  dba?: string
  dotNumber: string
  mcNumber: string
  einLast4: string
  ownerName: string
  email: string
  phone: string
  address: Address
  equipment: EquipmentType[]
  status: CarrierStatus
  joinedAt: ISODate
  dispatcherId: ID
  preferredStates: string[]
  radius: OperatingRadius
  /** 0-5 internal rating */
  rating: number
  onTimeRate: number
  insurance: { provider: string; policyNumber: string; autoLiability: number; cargo: number; expiresAt: ISODate }
}

export interface Driver {
  id: ID
  carrierId: ID
  name: string
  phone: string
  email: string
  cdlClass: 'A' | 'B' | 'Non-CDL'
  licenseState: string
  licenseExpiresAt: ISODate
  status: DriverStatus
  truckId?: ID
  hiredAt: ISODate
}

export interface Truck {
  id: ID
  carrierId: ID
  unitNumber: string
  equipment: EquipmentType
  year: number
  make: string
  model: string
  vin: string
  /** e.g. 26' x 102" x 102" */
  dimensions: string
  capacityLbs: number
  status: TruckStatus
  driverId?: ID
  homeBase: string
  odometer: number
}

export interface StopLocation {
  facility: string
  street: string
  city: string
  state: string
  zip: string
  /** appointment start */
  appointment: ISODate
  window: string
  contact: string
  phone: string
}

export interface Broker {
  name: string
  mcNumber: string
  contact: string
  phone: string
  email: string
  rating: number
  daysToPay: number
}

export type LoadDocumentKind = 'rate-con' | 'bol' | 'pod' | 'lumper' | 'other'

export interface LoadDocument {
  id: ID
  kind: LoadDocumentKind
  name: string
  uploadedAt: ISODate
  uploadedBy: string
}

export interface LoadEvent {
  id: ID
  status: LoadStatus
  at: ISODate
  by: string
  note?: string
}

export interface Note {
  id: ID
  at: ISODate
  by: string
  text: string
}

export interface Load {
  id: ID
  status: LoadStatus
  equipment: EquipmentType
  carrierId?: ID
  truckId?: ID
  driverId?: ID
  dispatcherId?: ID
  broker: Broker
  pickup: StopLocation
  delivery: StopLocation
  miles: number
  rate: number
  weightLbs: number
  commodity: string
  reference: string
  source: 'manual' | 'DAT (demo)' | 'Truckstop (demo)'
  createdAt: ISODate
  events: LoadEvent[]
  documents: LoadDocument[]
  notes: Note[]
}

export type CarrierDocumentType =
  | 'w9'
  | 'coi'
  | 'mc-authority'
  | 'cdl'
  | 'registration'
  | 'inspection'
  | 'ifta'
  | 'medical-card'
  | 'other'

export interface CarrierDocument {
  id: ID
  carrierId: ID
  type: CarrierDocumentType
  name: string
  /** Company, a truck unit or a driver */
  subject: string
  truckId?: ID
  driverId?: ID
  uploadedAt: ISODate
  expiresAt?: ISODate
  review: 'approved' | 'pending' | 'rejected'
}

export interface ApplicationTruck {
  equipment: EquipmentType
  year: string
  make: string
  model: string
  vin: string
  dimensions: string
  capacityLbs: string
}

export interface CarrierApplication {
  id: ID
  status: ApplicationStatus
  submittedAt: ISODate
  owner: { firstName: string; lastName: string; email: string; phone: string }
  company: { legalName: string; dba: string; dotNumber: string; mcNumber: string; ein: string; address: Address }
  equipment: { types: EquipmentType[]; truckCount: number; trucks: ApplicationTruck[] }
  preferences: {
    states: string[]
    lanes: string
    radius: OperatingRadius[]
    maxDistance: number
    minRatePerMile: number
    availability: string
  }
  insurance: { provider: string; policyNumber: string; autoLiability: number; cargo: number; expiresAt: ISODate }
  documents: { type: CarrierDocumentType; name: string; status: 'received' | 'missing' }[]
  notes: Note[]
  reviewerId?: ID
}

export interface Invoice {
  id: ID
  loadId: ID
  carrierId: ID
  brokerName: string
  issuedAt: ISODate
  dueAt: ISODate
  grossRate: number
  /** dispatch fee percentage applied to this invoice, e.g. 3 */
  feePct: number
  status: InvoiceStatus
  paidAt?: ISODate
}

export interface Payment {
  id: ID
  invoiceId: ID
  carrierId: ID
  kind: 'broker-payment' | 'dispatch-fee' | 'carrier-payout'
  amount: number
  method: 'ACH' | 'Check' | 'Quick Pay' | 'Card (Stripe)'
  date: ISODate
  status: PaymentStatus
  reference: string
}

export type Channel = 'in-app' | 'email' | 'sms'

export interface ThreadMessage {
  id: ID
  from: string
  fromRole: Role | 'system'
  text: string
  at: ISODate
  channel: Channel
}

export interface MessageThread {
  id: ID
  carrierId: ID
  subject: string
  loadId?: ID
  messages: ThreadMessage[]
  unreadForCarrier: boolean
  unreadForStaff: boolean
}

export type NotificationKind =
  | 'load-assigned'
  | 'pickup-reminder'
  | 'delivery-reminder'
  | 'missing-pod'
  | 'document-expiring'
  | 'payment-received'
  | 'application'
  | 'status-update'

export interface AppNotification {
  id: ID
  kind: NotificationKind
  title: string
  body: string
  at: ISODate
  channels: Channel[]
  audience: 'carrier' | 'staff'
  carrierId?: ID
  read: boolean
  link?: string
}

export interface LoadOpportunity {
  id: ID
  source: 'DAT' | 'Truckstop'
  origin: { city: string; state: string }
  destination: { city: string; state: string }
  pickupDate: ISODate
  equipment: EquipmentType
  miles: number
  weightLbs: number
  rate: number
  broker: string
  brokerRating: number
  daysToPay: number
  postedMinutesAgo: number
  saved: boolean
  /** set when converted into a platform load */
  assignedLoadId?: ID
}

export type IntegrationStatus = 'connected' | 'not-connected' | 'coming-soon' | 'requires-api'

export interface Integration {
  id: ID
  name: string
  category: 'Load Board' | 'Communication' | 'Maps' | 'Payments' | 'Accounting' | 'E-Signature' | 'Compliance' | 'Storage'
  description: string
  status: IntegrationStatus
  features: string[]
  brandColor: string
  note?: string
}

export interface StaffUser {
  id: ID
  name: string
  email: string
  role: StaffRole
  status: 'active' | 'invited' | 'disabled'
  lastActiveAt: ISODate
  phone: string
}

export interface PlatformSettings {
  companyName: string
  /** default dispatch fee % — sample value, configurable */
  dispatchFeePct: number
  supportEmail: string
  supportPhone: string
  notificationChannels: Record<NotificationKind, Channel[]>
  requireMfaForStaff: boolean
  documentExpiryWarningDays: number
}

export interface Session {
  staffRole: StaffRole
  portalRole: PortalRole
  /** staff user acting in the admin portal */
  staffUserId: ID
  /** carrier the carrier-portal session belongs to */
  carrierId: ID
  /** driver used when portalRole === 'driver' */
  driverId: ID
}

export interface DemoState {
  version: number
  seededAt: ISODate
  session: Session
  settings: PlatformSettings
  carriers: Carrier[]
  drivers: Driver[]
  trucks: Truck[]
  loads: Load[]
  documents: CarrierDocument[]
  applications: CarrierApplication[]
  invoices: Invoice[]
  payments: Payment[]
  threads: MessageThread[]
  notifications: AppNotification[]
  opportunities: LoadOpportunity[]
  integrations: Integration[]
  users: StaffUser[]
}
