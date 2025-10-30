import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X } from 'lucide-react';

interface AddStudentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStudentModal({ onClose, onSuccess }: AddStudentModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Cet email est déjà utilisé. Veuillez utiliser un autre email.');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erreur lors de la création du compte utilisateur');
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: 'student',
      });

      if (profileError) {
        if (profileError.message.includes('foreign key constraint')) {
          throw new Error('Cet email est déjà utilisé. Veuillez utiliser un autre email ou supprimer l\'ancien compte.');
        }
        if (profileError.message.includes('duplicate key')) {
          throw new Error('Un profil existe déjà avec cet email.');
        }
        throw profileError;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Nouvel élève</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              placeholder="Marie Dupont"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              placeholder="marie@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-rose-400 to-pink-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
