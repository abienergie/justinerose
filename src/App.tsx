import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import ManagerDashboard from './pages/ManagerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import { useEffect, useState } from 'react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');

    if (error) {
      setAuthError(errorDescription || error);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-600 text-lg">Chargement...</div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur d'authentification</h2>
            <p className="text-gray-600 mb-6">{authError}</p>
          </div>
          <button
            onClick={() => {
              setAuthError(null);
              window.location.href = '/';
            }}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            Retour à la page de connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/success" element={
        user && profile ? <PaymentSuccess /> : <Navigate to="/" />
      } />
      <Route path="/" element={
        !user || !profile ? <LoginForm /> :
        profile.role === 'manager' ? <ManagerDashboard /> :
        <StudentDashboard />
      } />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter basename="/justinerose">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
