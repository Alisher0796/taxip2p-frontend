import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { LoadingScreen } from '@/shared/ui'

const RoleSelectPage = lazy(() => import('@/pages/RoleSelectPage'))
const PassengerCreatePage = lazy(() => import('@/pages/passenger'))
const DriverRequestsPage = lazy(() => import('@/pages/driver'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))

export function Router() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<RoleSelectPage />} />
        <Route path="/passenger/create" element={<PassengerCreatePage />} />
        <Route path="/driver/requests" element={<DriverRequestsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
