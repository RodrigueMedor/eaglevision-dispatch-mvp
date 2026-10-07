import { Bell, FileText, LayoutDashboard, LifeBuoy, MessageSquare, Package, Receipt, Truck, User, Users, Wallet } from 'lucide-react'
import type { PortalPermission } from '@/lib/permissions'

export interface PortalNavItem {
  to: string
  label: string
  icon: typeof Truck
  permission?: PortalPermission
  end?: boolean
}

export const PORTAL_NAV: PortalNavItem[] = [
  { to: '/portal', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/portal/loads', label: 'Loads', icon: Package },
  { to: '/portal/trucks', label: 'Trucks', icon: Truck, permission: 'fleet.manage' },
  { to: '/portal/drivers', label: 'Drivers', icon: Users, permission: 'fleet.manage' },
  { to: '/portal/documents', label: 'Documents', icon: FileText },
  { to: '/portal/invoices', label: 'Invoices', icon: Receipt, permission: 'finance.view' },
  { to: '/portal/payments', label: 'Payments', icon: Wallet, permission: 'finance.view' },
  { to: '/portal/messages', label: 'Messages', icon: MessageSquare },
  { to: '/portal/notifications', label: 'Notifications', icon: Bell },
  { to: '/portal/profile', label: 'Profile', icon: User },
  { to: '/portal/support', label: 'Support', icon: LifeBuoy },
]

/** Primary tabs in the mobile bottom bar. */
export const MOBILE_TABS = ['/portal', '/portal/loads', '/portal/documents', '/portal/messages']
