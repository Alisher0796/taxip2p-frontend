import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { LoadingScreen } from '@/shared/ui'

const HomePage = lazy(() => import('@/pages/home'))
const PassengerPage = lazy(() => import('@/pages/passenger'))
const DriverPage = lazy(() => import('@/pages/driver'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))

export function Router() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/passenger" element={<PassengerPage />} />
        <Route path="/driver" element={<DriverPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
