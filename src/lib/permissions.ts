import type { PortalRole, StaffRole } from '@/data/types'

/** Permission keys — will map 1:1 to Spring Security authorities in production. */
export type Permission =
  | 'applications.review'
  | 'carriers.manage'
  | 'fleet.view'
  | 'loads.view'
  | 'loads.manage'
  | 'dispatch.board'
  | 'loadboard.use'
  | 'documents.review'
  | 'finance.view'
  | 'finance.manage'
  | 'messages.send'
  | 'reports.view'
  | 'users.manage'
  | 'settings.manage'
  | 'integrations.manage'

const ALL: Permission[] = [
  'applications.review', 'carriers.manage', 'fleet.view', 'loads.view', 'loads.manage', 'dispatch.board', 'loadboard.use',
  'documents.review', 'finance.view', 'finance.manage', 'messages.send', 'reports.view', 'users.manage', 'settings.manage',
  'integrations.manage',
]

export const STAFF_PERMISSIONS: Record<StaffRole, Permission[]> = {
  'super-admin': ALL,
  admin: ALL.filter((p) => p !== 'integrations.manage'),
  dispatcher: ['applications.review', 'carriers.manage', 'fleet.view', 'loads.view', 'loads.manage', 'dispatch.board', 'loadboard.use', 'documents.review', 'messages.send', 'reports.view'],
  accounting: ['fleet.view', 'loads.view', 'finance.view', 'finance.manage', 'messages.send', 'reports.view'],
  support: ['fleet.view', 'loads.view', 'documents.review', 'messages.send'],
}

export const ROLE_LABEL: Record<StaffRole | PortalRole, string> = {
  'super-admin': 'Super Admin',
  admin: 'Admin',
  dispatcher: 'Dispatcher',
  accounting: 'Accounting',
  support: 'Support',
  carrier: 'Carrier / Owner-Operator',
  driver: 'Driver',
}

export const ROLE_DESCRIPTION: Record<StaffRole | PortalRole, string> = {
  'super-admin': 'Full platform configuration, integrations and administrative control.',
  admin: 'Business and operational administration, users and settings.',
  dispatcher: 'Carrier onboarding review, load sourcing, assignment and communication.',
  accounting: 'Invoices, dispatch fees, carrier payments and financial reports.',
  support: 'Carrier support, document follow-up and messaging.',
  carrier: 'Company profile, trucks, drivers, documents, assigned loads and payments.',
  driver: 'Limited access to assigned loads, BOL/POD upload and messages.',
}

export function staffCan(role: StaffRole, permission: Permission) {
  return STAFF_PERMISSIONS[role].includes(permission)
}

/** Carrier-portal capabilities. Drivers get a limited view (proposal section 11). */
export type PortalPermission = 'fleet.manage' | 'finance.view' | 'company.manage' | 'loads.all'

const PORTAL_PERMISSIONS: Record<PortalRole, PortalPermission[]> = {
  carrier: ['fleet.manage', 'finance.view', 'company.manage', 'loads.all'],
  driver: [],
}

export function portalCan(role: PortalRole, permission: PortalPermission) {
  return PORTAL_PERMISSIONS[role].includes(permission)
}
