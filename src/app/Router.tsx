import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { LoadingScreen } from '@/shared/ui/LoadingScreen'
import { RouteGuard } from './providers/RouteGuard/RouteGuard'

const RoleSelectPage = lazy(() => import('@/pages/RoleSelectPage'))
const PassengerCreatePage = lazy(() => import('@/pages/passenger'))
const PassengerActivePage = lazy(() => import('@/pages/passenger/active'))
const DriverRequestsPage = lazy(() => import('@/pages/driver'))
const DriverActivePage = lazy(() => import('@/pages/driver/active'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))

export function Router() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<RoleSelectPage />} />
        
        {/* Маршруты для пассажира */}
        <Route
          path="/passenger"
          element={
            <RouteGuard requiredRole="passenger">
              <PassengerCreatePage />
            </RouteGuard>
          }
        />
        <Route
          path="/passenger/active"
          element={
            <RouteGuard requiredRole="passenger">
              <PassengerActivePage />
            </RouteGuard>
          }
        />

        {/* Маршруты для водителя */}
        <Route
          path="/driver"
          element={
            <RouteGuard requiredRole="driver">
              <DriverRequestsPage />
            </RouteGuard>
          }
        />
        <Route
          path="/driver/active"
          element={
            <RouteGuard requiredRole="driver">
              <DriverActivePage />
            </RouteGuard>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
