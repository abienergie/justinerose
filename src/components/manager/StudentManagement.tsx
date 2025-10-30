import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Plus, UserPlus, Package, Calendar, FileText, Users, Trash2 } from 'lucide-react';
import type { Profile, CoursePackage, Session } from '../../types/database';
import AddStudentModal from './AddStudentModal';
import AddPackageModal from './AddPackageModal';
import AddSessionModal from './AddSessionModal';

export default function StudentManagement() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [packages, setPackages] = useState<CoursePackage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Profile | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentData(selectedStudent.id);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async (studentId: string) => {
    try {
      const { data: pkgs } = await supabase
        .from('course_packages')
        .select('*')
        .eq('student_id', studentId)
        .order('purchase_date', { ascending: false });

      const { data: sess } = await supabase
        .from('sessions')
        .select('*')
        .eq('student_id', studentId)
        .order('session_date', { ascending: false });

      setPackages(pkgs || []);
      setSessions(sess || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', studentToDelete.id);

      if (error) throw error;

      setStudents(students.filter(s => s.id !== studentToDelete.id));
      if (selectedStudent?.id === studentToDelete.id) {
        setSelectedStudent(null);
      }
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRemainingSessions = packages.reduce((sum, pkg) => sum + pkg.remaining_sessions, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800">Gestion des élèves</h3>
        <button
          onClick={() => setShowAddStudent(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nouvel élève</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-rose-100">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un élève..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedStudent?.id === student.id
                      ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md'
                      : 'bg-rose-50 hover:bg-rose-100 text-gray-800'
                  }`}
                >
                  <p className="font-medium">{student.full_name}</p>
                  <p className={`text-sm ${selectedStudent?.id === student.id ? 'text-white/80' : 'text-gray-600'}`}>
                    {student.email}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedStudent ? (
            <>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-rose-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800">{selectedStudent.full_name}</h4>
                    <p className="text-gray-600">{selectedStudent.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Cours restants</p>
                    <p className="text-3xl font-bold text-rose-500">{totalRemainingSessions}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddPackage(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 to-cyan-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    <Package className="w-4 h-4" />
                    <span>Ajouter forfait</span>
                  </button>
                  <button
                    onClick={() => setShowAddSession(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Ajouter séance</span>
                  </button>
                  <button
                    onClick={() => {
                      setStudentToDelete(selectedStudent);
                      setShowDeleteConfirm(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-400 to-red-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-rose-100">
                <h5 className="text-lg font-semibold text-gray-800 mb-4">Forfaits</h5>
                <div className="space-y-3">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-rose-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">
                            {pkg.package_type === 'single' && '1 heure'}
                            {pkg.package_type === 'card_5' && '5 heures'}
                            {pkg.package_type === 'card_10' && '10 heures'}
                            {pkg.package_type === 'custom' && 'Forfait personnalisé'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Acheté le {new Date(pkg.purchase_date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-rose-500">{pkg.remaining_sessions}/{pkg.total_sessions}</p>
                          <p className="text-xs text-gray-600">restants</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {packages.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Aucun forfait</p>
                  )}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-rose-100">
                <h5 className="text-lg font-semibold text-gray-800 mb-4">Historique des cours</h5>
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="bg-rose-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {new Date(session.session_date).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {session.duration_hours}h{session.session_type ? ` - ${session.session_type}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Aucun cours effectué</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-rose-100 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Sélectionnez un élève pour voir les détails</p>
            </div>
          )}
        </div>
      </div>

      {showAddStudent && (
        <AddStudentModal
          onClose={() => setShowAddStudent(false)}
          onSuccess={() => {
            fetchStudents();
            setShowAddStudent(false);
          }}
        />
      )}

      {showAddPackage && selectedStudent && (
        <AddPackageModal
          studentId={selectedStudent.id}
          onClose={() => setShowAddPackage(false)}
          onSuccess={() => {
            fetchStudentData(selectedStudent.id);
            setShowAddPackage(false);
          }}
        />
      )}

      {showAddSession && selectedStudent && (
        <AddSessionModal
          studentId={selectedStudent.id}
          onClose={() => setShowAddSession(false)}
          onSuccess={() => {
            fetchStudentData(selectedStudent.id);
            setShowAddSession(false);
          }}
        />
      )}

      {showDeleteConfirm && studentToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'élève <strong>{studentToDelete.full_name}</strong> ?
              Cette action est irréversible et supprimera également tous ses forfaits et séances.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setStudentToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteStudent}
                className="flex-1 bg-gradient-to-r from-red-400 to-red-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}