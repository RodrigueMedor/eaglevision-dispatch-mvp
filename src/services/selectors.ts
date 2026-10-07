/**
 * Read-side service layer. Each function corresponds to a future REST query, e.g.
 *   loadsForCarrier  → GET /api/v1/carriers/{id}/loads
 *   adminKpis        → GET /api/v1/reports/dashboard
 */
import type { CarrierDocument, DemoState, DocumentStatus, Invoice, Load, LoadStatus } from '@/data/types'
import { daysUntil } from '@/lib/format'
import { feeBreakdown } from '@/lib/fees'
import { ACTIVE_LOAD_STATUSES, LOAD_FLOW } from '@/lib/status'

export const byId = <T extends { id: string }>(list: T[], id?: string) => (id ? list.find((x) => x.id === id) : undefined)

export const carrierName = (s: DemoState, id?: string) => byId(s.carriers, id)?.legalName ?? 'Unassigned'
export const truckUnit = (s: DemoState, id?: string) => byId(s.trucks, id)?.unitNumber ?? '—'
export const driverName = (s: DemoState, id?: string) => byId(s.drivers, id)?.name ?? '—'
export const userName = (s: DemoState, id?: string) => byId(s.users, id)?.name ?? '—'
export const dispatchers = (s: DemoState) => s.users.filter((u) => u.role === 'dispatcher' && u.status === 'active')

export function documentStatus(doc: CarrierDocument, warnDays = 30): DocumentStatus {
  if (doc.review === 'pending') return 'pending'
  if (!doc.expiresAt) return 'valid'
  const d = daysUntil(doc.expiresAt)
  if (d < 0) return 'expired'
  if (d <= warnDays) return 'expiring'
  return 'valid'
}

export const isActiveLoad = (l: Load) => ACTIVE_LOAD_STATUSES.includes(l.status)

export function loadsForPortal(s: DemoState) {
  const { carrierId, portalRole, driverId } = s.session
  return s.loads.filter((l) => l.carrierId === carrierId && l.status !== 'opportunity' && (portalRole === 'carrier' || l.driverId === driverId))
}

export function invoiceTotals(invoices: Invoice[]) {
  return invoices.reduce(
    (acc, inv) => {
      const f = feeBreakdown(inv.grossRate, inv.feePct)
      acc.gross += f.gross
      acc.fees += f.fee
      acc.net += f.net
      return acc
    },
    { gross: 0, fees: 0, net: 0 },
  )
}

export function loadsByStatus(loads: Load[]) {
  return LOAD_FLOW.map((status) => ({ status, count: loads.filter((l) => l.status === status).length }))
}

export function carrierKpis(s: DemoState, carrierId: string) {
  const loads = s.loads.filter((l) => l.carrierId === carrierId)
  const trucks = s.trucks.filter((t) => t.carrierId === carrierId)
  const docs = s.documents.filter((d) => d.carrierId === carrierId)
  const invoices = s.invoices.filter((i) => i.carrierId === carrierId)
  const warn = s.settings.documentExpiryWarningDays
  const pendingInv = invoices.filter((i) => i.status !== 'paid')
  return {
    activeLoads: loads.filter(isActiveLoad).length,
    availableTrucks: trucks.filter((t) => t.status === 'available').length,
    totalTrucks: trucks.length,
    documentsExpiring: docs.filter((d) => ['expiring', 'expired'].includes(documentStatus(d, warn))).length,
    pendingPayments: invoiceTotals(pendingInv).net,
    pendingPaymentCount: pendingInv.length,
    completedLoads: loads.filter((l) => l.status === 'completed').length,
    dispatchFees: invoiceTotals(invoices).fees,
  }
}

export function adminKpis(s: DemoState) {
  const warn = s.settings.documentExpiryWarningDays
  const today = new Date().toDateString()
  const totals = invoiceTotals(s.invoices)
  return {
    activeCarriers: s.carriers.filter((c) => c.status === 'active').length,
    activeTrucks: s.trucks.filter((t) => t.status !== 'inactive').length,
    availableTrucks: s.trucks.filter((t) => t.status === 'available').length,
    activeLoads: s.loads.filter(isActiveLoad).length,
    deliveredToday: s.loads.filter((l) => l.events.some((e) => e.status === 'delivered' && new Date(e.at).toDateString() === today)).length,
    pendingApplications: s.applications.filter((a) => ['submitted', 'under-review', 'info-required'].includes(a.status)).length,
    documentsExpiring: s.documents.filter((d) => ['expiring', 'expired'].includes(documentStatus(d, warn))).length,
    pendingPods: s.loads.filter((l) => l.status === 'delivered').length,
    revenue: totals.gross,
    dispatchFees: totals.fees,
  }
}

export const statusCount = (loads: Load[], statuses: LoadStatus[]) => loads.filter((l) => statuses.includes(l.status)).length
