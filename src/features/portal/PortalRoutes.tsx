import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Lock } from 'lucide-react'
import type { PortalPermission } from '@/lib/permissions'
import { usePortalActor } from '@/store/hooks'
import { EmptyState } from '@/components/ui/Feedback'
import { Button } from '@/components/ui/Button'
import { PortalLayout } from './PortalLayout'
import { PortalDashboard } from './pages/PortalDashboard'
import { PortalLoads } from './pages/PortalLoads'
import { PortalLoadDetail } from './pages/PortalLoadDetail'
import { PortalTrucks } from './pages/PortalTrucks'
import { PortalDrivers } from './pages/PortalDrivers'
import { PortalDocuments } from './pages/PortalDocuments'
import { PortalInvoices } from './pages/PortalInvoices'
import { PortalPayments } from './pages/PortalPayments'
import { PortalMessages } from './pages/PortalMessages'
import { PortalNotifications } from './pages/PortalNotifications'
import { PortalProfile } from './pages/PortalProfile'
import { PortalSupport } from './pages/PortalSupport'

/** Role-gated route: drivers get a limited view (proposal: "Driver – limited shipment/load access"). */
function Gate({ permission, children }: { permission: PortalPermission; children: ReactNode }) {
  const actor = usePortalActor()
  if (actor.can(permission)) return <>{children}</>
  return (
    <EmptyState
      icon={<Lock className="size-7" />}
      title="Not available for drivers"
      description="This section is limited to the carrier owner / owner-operator account. Switch the role in the prototype bar to Carrier to view it."
      action={<Button to="/portal">Back to dashboard</Button>}
    />
  )
}

export default function PortalRoutes() {
  return (
    <Routes>
      <Route element={<PortalLayout />}>
        <Route index element={<PortalDashboard />} />
        <Route path="loads" element={<PortalLoads />} />
        <Route path="loads/:id" element={<PortalLoadDetail />} />
        <Route path="trucks" element={<Gate permission="fleet.manage"><PortalTrucks /></Gate>} />
        <Route path="drivers" element={<Gate permission="fleet.manage"><PortalDrivers /></Gate>} />
        <Route path="documents" element={<PortalDocuments />} />
        <Route path="invoices" element={<Gate permission="finance.view"><PortalInvoices /></Gate>} />
        <Route path="payments" element={<Gate permission="finance.view"><PortalPayments /></Gate>} />
        <Route path="messages" element={<PortalMessages />} />
        <Route path="notifications" element={<PortalNotifications />} />
        <Route path="profile" element={<PortalProfile />} />
        <Route path="support" element={<PortalSupport />} />
        <Route path="*" element={<EmptyState icon={<Lock className="size-7" />} title="Page not found" action={<Button to="/portal">Back to dashboard</Button>} />} />
      </Route>
    </Routes>
  )
}
