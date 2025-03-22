import { AuthProvider } from '@/components/auth/AuthProvider';
import Dashboard from '@/components/Dashboard';
import AuthForm from '@/components/auth/AuthForm';
import AuthCallback from '@/components/auth/AuthCallback';
import ResetPasswordCallback from '@/components/auth/ResetPasswordCallback';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import { Routes, Route, Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-[#dfe9f3] to-white">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AuthenticatedApp() {
  const { user, session } = useAuth();

  if (session && user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-[#dfe9f3] to-white">
      <AuthForm />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<AuthenticatedApp />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/reset-password/callback" element={<ResetPasswordCallback />} />
        <Route path="/auth/reset-password" element={<ResetPasswordForm />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster 
        closeButton
        richColors
        toastOptions={{
          classNames: {
            closeButton: "absolute right-2 top-2 p-1 rounded-full hover:bg-gray-100"
          }
        }}
      />
    </AuthProvider>
  );
}

export default App;