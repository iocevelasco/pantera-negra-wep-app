import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/protected-route';
import { AdminRoute } from './components/admin-route';
import { StudentRoute } from './components/student-route';
import { NetworkOwnerRoute } from './components/network-owner-route';
import { AuthGuard } from './components/auth/auth-guard';
import { RouteLoading } from './components/routes/route-loading';
import { ROUTES } from './lib/routes';

// Lazy load pages for better performance and code splitting
const LoginPage = lazy(() => import('./pages/login').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/register').then(m => ({ default: m.RegisterPage })));
const ResetPasswordPage = lazy(() => import('./pages/reset-password').then(m => ({ default: m.ResetPasswordPage })));
const OAuthCallbackPage = lazy(() => import('./pages/oauth-callback').then(m => ({ default: m.OAuthCallbackPage })));
const DashboardPage = lazy(() => import('./pages/dashboard').then(m => ({ default: m.DashboardPage })));
const StudentViewPage = lazy(() => import('./pages/student-view').then(m => ({ default: m.StudentViewPage })));
const MembersPage = lazy(() => import('./pages/members').then(m => ({ default: m.MembersPage })));
const SchedulePage = lazy(() => import('./pages/schedule').then(m => ({ default: m.SchedulePage })));
const ScheduleManagementPage = lazy(() => import('./pages/schedule-management').then(m => ({ default: m.ScheduleManagementPage })));
const PortalPage = lazy(() => import('./pages/portal').then(m => ({ default: m.PortalPage })));
const RegistrationsPage = lazy(() => import('./pages/registrations').then(m => ({ default: m.RegistrationsPage })));
const MembershipPlansPage = lazy(() => import('./pages/membership-plans').then(m => ({ default: m.MembershipPlansPage })));
const PrivateClassesPage = lazy(() => import('./pages/private-classes').then(m => ({ default: m.PrivateClassesPage })));

// Network Owner pages
const NetworkDashboard = lazy(() => import('./pages/network/network-dashboard'));
const OrganizationNew = lazy(() => import('./pages/network/organization-new'));
const OrganizationDetail = lazy(() => import('./pages/network/organization-detail'));
const DojoNew = lazy(() => import('./pages/network/dojo-new'));
const DojoEdit = lazy(() => import('./pages/network/dojo-edit'));

/**
 * Wrapper component for lazy-loaded routes with Suspense
 */
function LazyRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<RouteLoading />}>{children}</Suspense>;
}

/**
 * Main application routes
 * 
 * Best practices implemented:
 * - Lazy loading for code splitting and better performance
 * - Route constants to avoid typos
 * - Grouped routes by category (auth, admin, student, protected)
 * - Suspense for loading states
 * - Type-safe route paths
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <LazyRoute>
            <AuthGuard redirectIfAuthenticated>
              <LoginPage />
            </AuthGuard>
          </LazyRoute>
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          <LazyRoute>
            <RegisterPage />
          </LazyRoute>
        }
      />
      <Route
        path={ROUTES.RESET_PASSWORD}
        element={
          <LazyRoute>
            <ResetPasswordPage />
          </LazyRoute>
        }
      />
      <Route
        path={ROUTES.OAUTH_CALLBACK}
        element={
          <LazyRoute>
            <OAuthCallbackPage />
          </LazyRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path={ROUTES.STUDENT_MEMBERSHIP}
        element={
          <LazyRoute>
            <StudentRoute>
              <StudentViewPage />
            </StudentRoute>
          </LazyRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path={ROUTES.ADMIN_ROOT}
        element={
          <LazyRoute>
            <AdminRoute>
              <MembersPage />
            </AdminRoute>
          </LazyRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <LazyRoute>
            <AdminRoute>
              <DashboardPage />
            </AdminRoute>
          </LazyRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_SCHEDULE_MANAGEMENT}
        element={
          <LazyRoute>
            <AdminRoute>
              <ScheduleManagementPage />
            </AdminRoute>
          </LazyRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_REGISTRATIONS}
        element={
          <LazyRoute>
            <AdminRoute>
              <RegistrationsPage />
            </AdminRoute>
          </LazyRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_MEMBERSHIP_PLANS}
        element={
          <LazyRoute>
            <AdminRoute>
              <MembershipPlansPage />
            </AdminRoute>
          </LazyRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_PRIVATE_CLASSES}
        element={
          <LazyRoute>
            <AdminRoute>
              <PrivateClassesPage />
            </AdminRoute>
          </LazyRoute>
        }
      />

      {/* Network Owner Routes */}
      <Route path={ROUTES.NETWORK_ROOT} element={<LazyRoute><NetworkOwnerRoute><NetworkDashboard /></NetworkOwnerRoute></LazyRoute>} />
      <Route path={ROUTES.NETWORK_ORGANIZATION_NEW} element={<LazyRoute><NetworkOwnerRoute><OrganizationNew /></NetworkOwnerRoute></LazyRoute>} />
      <Route path="/network/organizations/:id" element={<LazyRoute><NetworkOwnerRoute><OrganizationDetail /></NetworkOwnerRoute></LazyRoute>} />
      <Route path="/network/organizations/:id/edit" element={<LazyRoute><NetworkOwnerRoute><OrganizationDetail /></NetworkOwnerRoute></LazyRoute>} />
      <Route path="/network/organizations/:orgId/dojos/new" element={<LazyRoute><NetworkOwnerRoute><DojoNew /></NetworkOwnerRoute></LazyRoute>} />
      <Route path="/network/organizations/:orgId/dojos/:dojoId/edit" element={<LazyRoute><NetworkOwnerRoute><DojoEdit /></NetworkOwnerRoute></LazyRoute>} />

      {/* Protected Routes (Any Authenticated User) */}
      <Route
        path={ROUTES.SCHEDULE}
        element={
          <LazyRoute>
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          </LazyRoute>
        }
      />
      <Route
        path={ROUTES.PORTAL}
        element={
          <LazyRoute>
            <ProtectedRoute>
              <PortalPage />
            </ProtectedRoute>
          </LazyRoute>
        }
      />
    </Routes>
  );
}

