import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LoadingScreen } from '@/shared/ui';
import { RouteGuard } from './providers/RouteGuard/RouteGuard';
import type { AppRoute } from '@/shared/types/routes';
import type { Role } from '@/shared/types/common';

// Lazy load pages
const RoleSelectPage = lazy(() => import('@/pages/RoleSelectPage'));
const PassengerCreatePage = lazy(() => import('@/pages/passenger'));
const PassengerActivePage = lazy(() => import('@/pages/passenger/active'));
const DriverRequestsPage = lazy(() => import('@/pages/driver'));
const DriverActivePage = lazy(() => import('@/pages/driver/active'));
const NotFoundPage = lazy(() => import('@/pages/not-found'));

// Route configuration
const routes: Array<{
  path: AppRoute;
  element: JSX.Element;
  role?: Role;
}> = [
  {
    path: '/',
    element: <RoleSelectPage />,
  },
  {
    path: '/passenger',
    element: <PassengerCreatePage />,
    role: 'passenger',
  },
  {
    path: '/passenger/active',
    element: <PassengerActivePage />,
    role: 'passenger',
  },
  {
    path: '/driver',
    element: <DriverRequestsPage />,
    role: 'driver',
  },
  {
    path: '/driver/active',
    element: <DriverActivePage />,
    role: 'driver',
  },
];

export function Router() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {routes.map(({ path, element, role }) => (
          <Route
            key={path}
            path={path}
            element={
              role ? (
                <RouteGuard requiredRole={role}>{element}</RouteGuard>
              ) : (
                element
              )
            }
          />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
