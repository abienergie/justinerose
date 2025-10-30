import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Package, Calendar, FileText, CreditCard } from 'lucide-react';
import Layout from '../components/Layout';
import PurchasePackageModal from '../components/student/PurchasePackageModal';
import type { CoursePackage, Session, Document } from '../types/database';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<CoursePackage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [packagesRes, sessionsRes, documentsRes] = await Promise.all([
        supabase
          .from('course_packages')
          .select('*')
          .eq('student_id', user.id)
          .neq('status', 'pending')
          .order('purchase_date', { ascending: false }),
        supabase
          .from('sessions')
          .select('*')
          .eq('student_id', user.id)
          .order('session_date', { ascending: false }),
        supabase
          .from('documents')
          .select('*')
          .eq('student_id', user.id)
          .order('uploaded_at', { ascending: false }),
      ]);

      if (packagesRes.data) setPackages(packagesRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (documentsRes.data) setDocuments(documentsRes.data);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRemainingSessions = packages.reduce((sum, pkg) => sum + pkg.remaining_sessions, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-rose-400 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-2">Mon espace yoga</h2>
          <p className="text-white/90 mb-6">Suivez vos cours et votre progression</p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
            <p className="text-white/80 text-sm mb-2">Cours restants</p>
            <p className="text-5xl font-bold">{totalRemainingSessions}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-rose-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 rounded-xl">
                  <Package className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Mes forfaits</h3>
              </div>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm"
              >
                <CreditCard className="w-4 h-4" />
                Acheter
              </button>
            </div>

            <div className="space-y-3">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-rose-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-800">
                      {pkg.package_type === 'single' && '1 heure'}
                      {pkg.package_type === 'card_5' && '5 heures'}
                      {pkg.package_type === 'card_10' && '10 heures'}
                      {pkg.package_type === 'custom' && 'Forfait personnalisé'}
                    </p>
                    <span className="text-lg font-bold text-rose-500">
                      {pkg.remaining_sessions}/{pkg.total_sessions}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Acheté le {new Date(pkg.purchase_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
              {packages.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun forfait actif</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-rose-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Historique</h3>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {sessions.map((session) => (
                <div key={session.id} className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      {new Date(session.session_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      Durée: {session.duration_hours}h
                      {session.session_type && ` • ${session.session_type}`}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun cours effectué</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-rose-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-50 rounded-xl">
              <FileText className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Mes documents</h3>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-amber-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{doc.file_name}</p>
                  <p className="text-sm text-gray-600">
                    {doc.document_type === 'invoice' ? 'Facture' : 'Attestation fiscale'} -
                    {' '}{new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium">
                  Télécharger
                </button>
              </div>
            ))}
            {documents.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun document disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPurchaseModal && (
        <PurchasePackageModal
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={() => {
            setShowPurchaseModal(false);
            fetchStudentData();
          }}
        />
      )}
    </Layout>
  );
}
