import {
  Building,
  ChartColumn,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Package,
  Plug,
  Radio,
  Receipt,
  Settings,
  SquareKanban,
  Truck,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react'
import type { Permission } from '@/lib/permissions'

export interface AdminNavItem {
  to: string
  label: string
  icon: typeof Truck
  permission?: Permission
  end?: boolean
}

export const ADMIN_NAV: { section: string; items: AdminNavItem[] }[] = [
  { section: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
  {
    section: 'Operations',
    items: [
      { to: '/admin/dispatch', label: 'Dispatch Board', icon: SquareKanban, permission: 'dispatch.board' },
      { to: '/admin/loads', label: 'Loads', icon: Package, permission: 'loads.view' },
      { to: '/admin/load-board', label: 'Load Board (Demo)', icon: Radio, permission: 'loadboard.use' },
      { to: '/admin/applications', label: 'Carrier Applications', icon: ClipboardList, permission: 'applications.review' },
    ],
  },
  {
    section: 'Fleet',
    items: [
      { to: '/admin/carriers', label: 'Carriers', icon: Building, permission: 'fleet.view' },
      { to: '/admin/drivers', label: 'Drivers', icon: Users, permission: 'fleet.view' },
      { to: '/admin/trucks', label: 'Trucks', icon: Truck, permission: 'fleet.view' },
      { to: '/admin/documents', label: 'Documents', icon: FileText, permission: 'documents.review' },
    ],
  },
  {
    section: 'Finance',
    items: [
      { to: '/admin/invoices', label: 'Invoices', icon: Receipt, permission: 'finance.view' },
      { to: '/admin/payments', label: 'Payments', icon: Wallet, permission: 'finance.view' },
    ],
  },
  {
    section: 'Communication & Insights',
    items: [
      { to: '/admin/messages', label: 'Messages', icon: MessageSquare, permission: 'messages.send' },
      { to: '/admin/reports', label: 'Reports', icon: ChartColumn, permission: 'reports.view' },
    ],
  },
  {
    section: 'Administration',
    items: [
      { to: '/admin/users', label: 'Users & Roles', icon: UserCog, permission: 'users.manage' },
      { to: '/admin/integrations', label: 'Integrations', icon: Plug, permission: 'settings.manage' },
      { to: '/admin/settings', label: 'Settings', icon: Settings, permission: 'settings.manage' },
    ],
  },
]
