import type { DemoState } from '@/data/types'
import { nowIso } from '@/lib/dates'
import {
  seedApplications,
  seedIntegrations,
  seedInvoices,
  seedNotifications,
  seedOpportunities,
  seedPayments,
  seedSettings,
  seedThreads,
} from './business'
import { seedCarriers, seedDocuments, seedDrivers, seedTrucks, seedUsers } from './fleet'
import { seedLoads } from './loads'

export const DEMO_STATE_VERSION = 1

/** Builds a fresh copy of the full demo dataset. Dates are relative to "now". */
export function createSeed(): DemoState {
  const loads = seedLoads()
  const invoices = seedInvoices(loads)
  return {
    version: DEMO_STATE_VERSION,
    seededAt: nowIso(),
    session: { staffRole: 'dispatcher', portalRole: 'carrier', staffUserId: 'u3', carrierId: 'c1', driverId: 'd1' },
    settings: seedSettings(),
    carriers: seedCarriers(),
    drivers: seedDrivers(),
    trucks: seedTrucks(),
    loads,
    documents: seedDocuments(),
    applications: seedApplications(),
    invoices,
    payments: seedPayments(invoices),
    threads: seedThreads(),
    notifications: seedNotifications(),
    opportunities: seedOpportunities(),
    integrations: seedIntegrations(),
    users: seedUsers(),
  }
}
