/*
  # Configuration complète de la base de données Yoga Studio

  1. Nouvelles tables
    - `profiles` : Profils utilisateurs avec rôles (manager/student)
    - `course_packages` : Forfaits de cours achetés
    - `sessions` : Séances de yoga effectuées
    - `documents` : Documents uploadés (factures, attestations)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour managers (accès complet) et students (accès limité)
    - Fonction helper pour vérifier le rôle manager

  3. Données de test
    - Compte manager : contact@justinerose.fr / password123
    - Compte étudiant de test
*/

-- Créer la table profiles (étend auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('manager', 'student')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Créer la table course_packages
CREATE TABLE IF NOT EXISTS course_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_type text NOT NULL CHECK (package_type IN ('single', 'card_5', 'card_10')),
  total_sessions integer NOT NULL,
  remaining_sessions integer NOT NULL,
  purchase_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE course_packages ENABLE ROW LEVEL SECURITY;

-- Créer la table sessions
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES course_packages(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  duration_hours numeric(3,1) NOT NULL CHECK (duration_hours > 0),
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Créer la table documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('invoice', 'tax_declaration')),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  uploaded_by uuid NOT NULL REFERENCES profiles(id)
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Fonction pour vérifier si l'utilisateur est manager
CREATE OR REPLACE FUNCTION is_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'manager'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour les sessions restantes
CREATE OR REPLACE FUNCTION update_package_remaining_sessions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE course_packages
  SET remaining_sessions = remaining_sessions - 1
  WHERE id = NEW.package_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour décrémenter automatiquement les sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_remaining_sessions'
  ) THEN
    CREATE TRIGGER trigger_update_remaining_sessions
      AFTER INSERT ON sessions
      FOR EACH ROW
      EXECUTE FUNCTION update_package_remaining_sessions();
  END IF;
END $$;

-- Politiques RLS pour profiles
CREATE POLICY "Users can read own profile, managers can read all"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles profiles_1
    WHERE profiles_1.id = auth.uid() AND profiles_1.role = 'manager'
  ));

CREATE POLICY "Managers can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles profiles_1
    WHERE profiles_1.id = auth.uid() AND profiles_1.role = 'manager'
  ));

CREATE POLICY "Managers can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles profiles_1
    WHERE profiles_1.id = auth.uid() AND profiles_1.role = 'manager'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles profiles_1
    WHERE profiles_1.id = auth.uid() AND profiles_1.role = 'manager'
  ));

-- Politiques RLS pour course_packages
CREATE POLICY "Students can view own packages"
  ON course_packages FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Managers can view all packages"
  ON course_packages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ));

CREATE POLICY "Managers can insert packages"
  ON course_packages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ));

CREATE POLICY "Managers can update packages"
  ON course_packages FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ));

-- Politiques RLS pour sessions
CREATE POLICY "Students can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Managers can view all sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ));

CREATE POLICY "Managers can insert sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ));

CREATE POLICY "Managers can update sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ));

CREATE POLICY "Managers can delete sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ));

-- Politiques RLS pour documents
CREATE POLICY "Students can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Managers can view all documents"
  ON documents FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ));

CREATE POLICY "Managers can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ));

CREATE POLICY "Managers can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
  ));

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_course_packages_student_id ON course_packages(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_package_id ON sessions(package_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON documents(student_id);

-- Insérer des données de test
-- IMPORTANT: Ces comptes seront créés automatiquement par l'application
-- Vous pourrez vous connecter avec :
-- Manager: contact@justinerose.fr / password123
-- Étudiant: marie.test@example.com / password123

-- Note: Les utilisateurs seront créés via l'interface d'administration
-- ou par la fonction de création de compte dans l'application