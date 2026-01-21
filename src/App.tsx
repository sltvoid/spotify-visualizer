import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAccessToken } from './utils/auth';
import { SpotifyDataProvider } from './contexts';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Callback from './pages/Callback';
import Dashboard from './pages/Dashboard';

/**
 * Protected route wrapper that redirects to login if no auth token exists.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getAccessToken();
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

/**
 * Main application component with routing and providers.
 */
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SpotifyDataProvider>
                  <Dashboard />
                </SpotifyDataProvider>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
