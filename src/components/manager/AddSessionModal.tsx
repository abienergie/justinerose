import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { CoursePackage } from '../../types/database';

interface AddSessionModalProps {
  studentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const sessionTypes = [
  'Yoga traditionnel',
  'Yoga prénatal',
  'Yoga post natal',
  'Accompagnement',
  'Stretching',
  'Massage',
  'Rebozo',
  'Séance photo'
];

export default function AddSessionModal({ studentId, onClose, onSuccess }: AddSessionModalProps) {
  const { user } = useAuth();
  const [packages, setPackages] = useState<CoursePackage[]>([]);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationHours, setDurationHours] = useState('1.0');
  const [customDuration, setCustomDuration] = useState('');
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [sessionType, setSessionType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPackages();
  }, [studentId]);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('course_packages')
        .select('*')
        .eq('student_id', studentId)
        .gt('remaining_sessions', 0)
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (err) {
      console.error('Error fetching packages:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) throw new Error('Non authentifié');

      // Find the first available package with remaining sessions
      const availablePackage = packages.find(pkg => pkg.remaining_sessions > 0);
      if (!availablePackage) throw new Error('Aucun forfait disponible pour cet élève');

      const finalDuration = isCustomDuration ? parseFloat(customDuration) : parseFloat(durationHours);
      if (isCustomDuration && (!customDuration || finalDuration <= 0)) {
        throw new Error('Veuillez entrer une durée valide');
      }

      const { error: sessionError } = await supabase.from('sessions').insert({
        student_id: studentId,
        package_id: availablePackage.id,
        session_date: sessionDate,
        duration_hours: finalDuration,
        session_type: sessionType || null,
        created_by: user.id,
      });

      if (sessionError) throw sessionError;

      const { error: updateError } = await supabase
        .from('course_packages')
        .update({ remaining_sessions: availablePackage.remaining_sessions - 1 })
        .eq('id', availablePackage.id);

      if (updateError) throw updateError;

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout de la séance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Ajouter une séance</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Aucun forfait disponible pour cet élève</p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date du cours
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de séance (optionnel)
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              >
                <option value="">Sélectionner un type</option>
                {sessionTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée (heures)
              </label>
              {!isCustomDuration ? (
                <>
                  <select
                    value={durationHours}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomDuration(true);
                      } else {
                        setDurationHours(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                    required
                  >
                    <option value="1.0">1 heure</option>
                    <option value="2.0">2 heures</option>
                    <option value="3.0">3 heures</option>
                    <option value="custom">Durée personnalisée...</option>
                  </select>
                </>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="Ex: 1.5"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomDuration(false);
                      setCustomDuration('');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              )}
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
                {loading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
