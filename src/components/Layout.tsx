import { useAuth } from '../contexts/AuthContext';
import { LogOut, Heart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Justine Rose Yoga</h1>
                <p className="text-xs text-gray-600">
                  {profile?.role === 'manager' ? 'Espace Manager' : 'Espace Élève'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{profile?.full_name}</p>
                <p className="text-xs text-gray-600">{profile?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-rose-50 rounded-xl transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
