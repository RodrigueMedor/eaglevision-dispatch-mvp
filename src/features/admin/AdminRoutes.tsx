import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import type { Permission } from '@/lib/permissions'
import { STAFF_PERMISSIONS, ROLE_LABEL } from '@/lib/permissions'
import { useStaffActor } from '@/store/hooks'
import { EmptyState } from '@/components/ui/Feedback'
import { Button } from '@/components/ui/Button'
import type { StaffRole } from '@/data/types'
import { AdminLayout } from './AdminLayout'
import { AdminDashboard } from './pages/AdminDashboard'
import { ApplicationsPage } from './pages/ApplicationsPage'
import { ApplicationDetailPage } from './pages/ApplicationDetailPage'
import { CarriersPage } from './pages/CarriersPage'
import { CarrierDetailPage } from './pages/CarrierDetailPage'
import { DriversPage } from './pages/DriversPage'
import { TrucksPage } from './pages/TrucksPage'
import { LoadsPage } from './pages/LoadsPage'
import { AdminLoadDetailPage } from './pages/AdminLoadDetailPage'
import { DispatchBoardPage } from './pages/DispatchBoardPage'
import { LoadBoardPage } from './pages/LoadBoardPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { InvoicesPage } from './pages/InvoicesPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { MessagesPage } from './pages/MessagesPage'
import { ReportsPage } from './pages/ReportsPage'
import { UsersPage } from './pages/UsersPage'
import { IntegrationsPage } from './pages/IntegrationsPage'
import { SettingsPage } from './pages/SettingsPage'

/** RBAC route guard — mirrors Spring Security method-level authorization in production. */
function Guard({ permission, children }: { permission: Permission; children: ReactNode }) {
  const actor = useStaffActor()
  if (actor.can(permission)) return <>{children}</>
  const allowed = (Object.keys(STAFF_PERMISSIONS) as StaffRole[]).filter((r) => STAFF_PERMISSIONS[r].includes(permission)).map((r) => ROLE_LABEL[r])
  return (
    <EmptyState
      icon={<ShieldAlert className="size-7" />}
      title={`Restricted for ${actor.roleLabel}`}
      description={`This area requires the “${permission}” permission, available to: ${allowed.join(', ')}. Switch roles in the prototype bar to compare access.`}
      action={<Button to="/admin">Back to dashboard</Button>}
    />
  )
}

const g = (permission: Permission, el: ReactNode) => <Guard permission={permission}>{el}</Guard>

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="applications" element={g('applications.review', <ApplicationsPage />)} />
        <Route path="applications/:id" element={g('applications.review', <ApplicationDetailPage />)} />
        <Route path="carriers" element={g('fleet.view', <CarriersPage />)} />
        <Route path="carriers/:id" element={g('fleet.view', <CarrierDetailPage />)} />
        <Route path="drivers" element={g('fleet.view', <DriversPage />)} />
        <Route path="trucks" element={g('fleet.view', <TrucksPage />)} />
        <Route path="loads" element={g('loads.view', <LoadsPage />)} />
        <Route path="loads/:id" element={g('loads.view', <AdminLoadDetailPage />)} />
        <Route path="dispatch" element={g('dispatch.board', <DispatchBoardPage />)} />
        <Route path="load-board" element={g('loadboard.use', <LoadBoardPage />)} />
        <Route path="documents" element={g('documents.review', <DocumentsPage />)} />
        <Route path="invoices" element={g('finance.view', <InvoicesPage />)} />
        <Route path="payments" element={g('finance.view', <PaymentsPage />)} />
        <Route path="messages" element={g('messages.send', <MessagesPage />)} />
        <Route path="reports" element={g('reports.view', <ReportsPage />)} />
        <Route path="users" element={g('users.manage', <UsersPage />)} />
        <Route path="integrations" element={g('settings.manage', <IntegrationsPage />)} />
        <Route path="settings" element={g('settings.manage', <SettingsPage />)} />
        <Route path="*" element={<EmptyState icon={<ShieldAlert className="size-7" />} title="Page not found" action={<Button to="/admin">Back to dashboard</Button>} />} />
      </Route>
    </Routes>
  )
}
