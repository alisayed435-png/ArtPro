/**
 * Main App Component with Routing
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth, ProtectedRoute } from '@/app/auth-context';
import { AppLayout } from '@/components/layout/app-layout';
import { LoadingState } from '@/components/shared';

// Lazy load pages for better code splitting
const LandingPage = lazy(() =>
  import('@/app/pages/landing').then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() =>
  import('@/app/pages/login').then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard').then((m) => ({ default: m.DashboardPage }))
);
const OrdersPage = lazy(() =>
  import('@/features/orders').then((m) => ({ default: m.OrdersPage }))
);
const ArtworkPage = lazy(() =>
  import('@/features/artwork').then((m) => ({ default: m.ArtworkPage }))
);
const CompliancePage = lazy(() =>
  import('@/features/compliance').then((m) => ({ default: m.CompliancePage }))
);
const AnalyticsPage = lazy(() =>
  import('@/features/analytics').then((m) => ({ default: m.AnalyticsPage }))
);
const StatusPage = lazy(() =>
  import('@/features/status').then((m) => ({ default: m.StatusPage }))
);

// Create query client with defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Page loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingState text="Loading..." />
    </div>
  );
}

// App shell for authenticated routes
function AppShell() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/artwork" element={<ArtworkPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}

// Root router component
function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingState text="Loading Calyx Command..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/landing"
        element={
          <Suspense fallback={<PageLoader />}>
            <LandingPage />
          </Suspense>
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/app" replace />
          ) : (
            <Suspense fallback={<PageLoader />}>
              <LoginPage />
            </Suspense>
          )
        }
      />

      {/* Protected app routes */}
      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/app' : '/landing'} replace />}
      />
    </Routes>
  );
}

// Main App component
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'font-sans',
              duration: 4000,
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
