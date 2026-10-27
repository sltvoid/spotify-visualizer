import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { getAccessToken } from './utils/auth';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './pages/Login';
import Callback from './pages/Callback';

// The dashboard pulls in the charting library, so load it only after login.
const Dashboard = lazy(() => import('./pages/Dashboard'));

function ProtectedRoute({ children }: { children: ReactNode }) {
  return getAccessToken() ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route
              path="/"
              element={getAccessToken() ? <Navigate to="/dashboard" replace /> : <Login />}
            />
            <Route path="/callback" element={<Callback />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
