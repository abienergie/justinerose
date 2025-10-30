import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Paiement réussi !
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Votre forfait a été activé avec succès
            </p>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 mb-8">
            <p className="text-gray-700 leading-relaxed">
              Merci pour votre achat ! Votre forfait est maintenant disponible dans votre espace personnel. Vous allez être redirigé automatiquement.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2 mx-auto"
          >
            Retour à mon espace
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-gray-500 text-sm mt-6">
            Redirection automatique dans 5 secondes...
          </p>
        </div>
      </div>
    </Layout>
  );
}
