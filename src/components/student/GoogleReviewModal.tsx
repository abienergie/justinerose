import { X, Star, Heart } from 'lucide-react';

interface GoogleReviewModalProps {
  onClose: () => void;
}

export default function GoogleReviewModal({ onClose }: GoogleReviewModalProps) {
  const handleReview = () => {
    window.open('https://g.page/r/CbZfPa77xqhZEBM/review', '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
        <div className="relative bg-gradient-to-br from-rose-400 via-pink-500 to-rose-500 p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-xl"></div>
              <Heart className="w-16 h-16 relative fill-white text-white animate-pulse" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-center mb-2">
            Votre avis compte !
          </h3>
          <p className="text-white/90 text-center">
            Vous avez complété 2 séances avec nous
          </p>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <p className="text-gray-700 text-center leading-relaxed mb-4">
              Nous serions ravis de connaître votre expérience et de savoir si nos séances vous ont apporté du bien-être.
            </p>

            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-8 h-8 fill-amber-400 text-amber-400"
                />
              ))}
            </div>

            <p className="text-sm text-gray-500 text-center">
              Votre avis nous aide à nous améliorer et à partager notre passion du yoga avec plus de personnes.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleReview}
              className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5 fill-white" />
              Laisser un avis Google
            </button>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Peut-être plus tard
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Vous ne verrez ce message qu'une seule fois
          </p>
        </div>
      </div>
    </div>
  );
}
