import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { LoadingScreen } from '@/shared/ui'

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
        <Route path="/passenger" element={<PassengerCreatePage />} />
        <Route path="/passenger/active" element={<PassengerActivePage />} />
        <Route path="/driver" element={<DriverRequestsPage />} />
        <Route path="/driver/active" element={<DriverActivePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
