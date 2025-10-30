import { useState } from 'react';
import { X, CreditCard, Loader2, Receipt } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../../lib/supabase';

interface PurchasePackageModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const packages = [
  {
    id: 'single',
    name: '1 heure de cours',
    price: 98,
    sessions: 1,
    description: 'Parfait pour découvrir'
  },
  {
    id: 'card_5',
    name: 'Carte 5 heures',
    price: 450,
    sessions: 5,
    description: 'Idéal pour pratiquer régulièrement',
    popular: true
  },
  {
    id: 'card_10',
    name: 'Carte 10 heures',
    price: 800,
    sessions: 10,
    description: 'Le meilleur rapport qualité-prix',
    badge: 'Économisez 180€'
  }
];

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PurchasePackageModal({ onClose, onSuccess }: PurchasePackageModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('card_5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePurchase = async () => {
    setError('');
    setLoading(true);

    try {
      const pkg = packages.find(p => p.id === selectedPackage);
      if (!pkg) throw new Error('Forfait non trouvé');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            packageType: pkg.id,
            packageName: pkg.name,
            price: pkg.price,
            sessions: pkg.sessions,
            userId: user.id,
            userEmail: user.email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }

      // Redirection directe vers l'URL de checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de paiement non disponible');
      }

    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Acheter un forfait</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPackage === pkg.id
                  ? 'border-rose-400 bg-rose-50 shadow-lg'
                  : 'border-gray-200 hover:border-rose-200'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    POPULAIRE
                  </span>
                </div>
              )}

              {pkg.badge && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {pkg.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-800 mb-1">{pkg.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{pkg.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-rose-500">{pkg.price}€</span>
                    {pkg.sessions > 1 && (
                      <span className="text-gray-500 text-sm">
                        soit {(pkg.price / pkg.sessions).toFixed(0)}€/heure
                      </span>
                    )}
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPackage === pkg.id
                    ? 'border-rose-400 bg-rose-400'
                    : 'border-gray-300'
                }`}>
                  {selectedPackage === pkg.id && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-start gap-3">
              <Receipt className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Avantage fiscal - Service à la personne</h4>
                <p className="text-sm text-gray-700">
                  Grâce à mon agrément "Service à la personne", vous bénéficiez d'une <strong>déduction d'impôts de 50%</strong> sur le montant total des cours facturés sur une année.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Paiement sécurisé</h4>
                <p className="text-sm text-gray-600">
                  Vous serez redirigé vers Stripe pour effectuer le paiement en toute sécurité. Vos informations bancaires ne sont jamais stockées sur nos serveurs.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-rose-400 to-pink-500 text-white px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Procéder au paiement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
