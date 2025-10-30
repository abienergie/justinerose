import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AddPackageModalProps {
  studentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

type PackageType = 'single' | 'card_5' | 'card_10';

export default function AddPackageModal({ studentId, onClose, onSuccess }: AddPackageModalProps) {
  const { user } = useAuth();
  const [packageType, setPackageType] = useState<PackageType>('single');
  const [customHours, setCustomHours] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const packageOptions = [
    { type: 'single' as PackageType, label: '1 heure', sessions: 1, price: '98€' },
    { type: 'card_5' as PackageType, label: '5 heures', sessions: 5, price: '450€' },
    { type: 'card_10' as PackageType, label: '10 heures', sessions: 10, price: '800€' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let sessions, totalSessions;
      
      if (isCustom) {
        if (!customHours || !customPrice) throw new Error('Veuillez remplir tous les champs personnalisés');
        sessions = parseInt(customHours);
        totalSessions = sessions;
        if (sessions <= 0) throw new Error('Le nombre d\'heures doit être positif');
      } else {
        const selectedPackage = packageOptions.find(p => p.type === packageType);
        if (!selectedPackage) throw new Error('Package type invalide');
        sessions = selectedPackage.sessions;
        totalSessions = selectedPackage.sessions;
      }

      const insertData: any = {
        student_id: studentId,
        package_type: isCustom ? 'custom' : packageType,
        total_sessions: totalSessions,
        remaining_sessions: sessions,
      };

      if (isCustom) {
        insertData.custom_price = parseInt(customPrice);
      }

      const { error: insertError } = await supabase.from('course_packages').insert(insertData);

      if (insertError) throw insertError;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout du forfait');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Ajouter un forfait</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {packageOptions.map((option) => (
              <label
                key={option.type}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  packageType === option.type && !isCustom
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-gray-200 hover:border-rose-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="packageType"
                    value={option.type}
                    checked={packageType === option.type && !isCustom}
                    onChange={(e) => {
                      setPackageType(e.target.value as PackageType);
                      setIsCustom(false);
                    }}
                    className="w-4 h-4 text-rose-500"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{option.label}</p>
                    <p className="text-sm text-gray-600">{option.sessions} heure{option.sessions > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <p className="font-bold text-rose-500">{option.price}</p>
              </label>
            ))}
            
            <div className={`p-4 rounded-xl border-2 transition-all ${
              isCustom ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
            }`}>
              <label className="flex items-center gap-3 mb-3">
                <input
                  type="radio"
                  name="packageType"
                  checked={isCustom}
                  onChange={() => setIsCustom(true)}
                  className="w-4 h-4 text-rose-500"
                />
                <span className="font-medium text-gray-800">Forfait personnalisé</span>
              </label>
              
              {isCustom && (
                <div className="grid grid-cols-2 gap-3 ml-7">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nombre d'heures</label>
                    <input
                      type="number"
                      value={customHours}
                      onChange={(e) => setCustomHours(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 outline-none"
                      placeholder="Ex: 3"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Prix (€)</label>
                    <input
                      type="number"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 outline-none"
                      placeholder="Ex: 250"
                      min="1"
                    />
                  </div>
                </div>
              )}
            </div>
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
      </div>
    </div>
  );
}
