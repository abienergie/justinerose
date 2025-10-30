import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'Erreur de connexion';

      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.';
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Votre email n\'a pas été confirmé. Veuillez vérifier votre boîte mail.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <div className="w-full max-w-md px-6 space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-rose-100">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Justine Rose Yoga
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Connexion à votre espace
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
