import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ScrollToTop } from './ScrollToTop'
import { PageLoader } from './PageLoader'

// Each prototype area is code-split so the public site stays lightweight.
const PublicRoutes = lazy(() => import('@/features/public/PublicRoutes'))
const PortalRoutes = lazy(() => import('@/features/portal/PortalRoutes'))
const AdminRoutes = lazy(() => import('@/features/admin/AdminRoutes'))
const BriefPage = lazy(() => import('@/features/brief/BriefPage'))
const DesignSystemPage = lazy(() => import('@/features/design-system/DesignSystemPage'))

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Routes>
        <Route path="/brief" element={<BriefPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/portal/*" element={<PortalRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={<PublicRoutes />} />
      </Routes>
    </Suspense>
  )
}
