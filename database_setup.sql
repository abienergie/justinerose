/*
  # Yoga Studio Management Schema

  1. Tables Created
    - `profiles`
      - Extends auth.users with role and full_name
      - Stores user type (manager or student)
      - Fields: id (uuid), email (text), full_name (text), role (text), created_at, updated_at

    - `course_packages`
      - Tracks purchased course packages for students
      - Fields: id, student_id, package_type, total_sessions, remaining_sessions, purchase_date, stripe_payment_intent_id

    - `sessions`
      - Records individual yoga sessions completed
      - Fields: id, student_id, package_id, session_date, duration_hours, created_by, created_at

    - `documents`
      - Stores uploaded documents (invoices, tax declarations)
      - Fields: id, student_id, document_type, file_name, file_path, file_size, uploaded_at, uploaded_by

  2. Security
    - Enable RLS on all tables
    - Helper function `is_manager()` to check if user has manager role
    - Managers have full access to all data
    - Students can only access their own data
    - Public cannot access anything

  3. Important Notes
    - All tables use UUID primary keys with gen_random_uuid()
    - Foreign key constraints ensure data integrity
    - Timestamps use timestamptz for proper timezone handling
    - RLS policies are restrictive by default
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('manager', 'student')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create course_packages table
CREATE TABLE IF NOT EXISTS course_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_type text NOT NULL CHECK (package_type IN ('single', 'card_5', 'card_10')),
  total_sessions integer NOT NULL,
  remaining_sessions integer NOT NULL,
  purchase_date timestamptz DEFAULT now(),
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE course_packages ENABLE ROW LEVEL SECURITY;

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES course_packages(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  duration_hours numeric(3,1) NOT NULL,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create documents table
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

-- Create helper function to check if user is manager
CREATE OR REPLACE FUNCTION is_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'manager'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for profiles table
CREATE POLICY "Managers can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_manager());

CREATE POLICY "Students can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Managers can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_manager());

CREATE POLICY "Managers can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_manager())
  WITH CHECK (is_manager());

CREATE POLICY "Students can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for course_packages table
CREATE POLICY "Managers can view all packages"
  ON course_packages FOR SELECT
  TO authenticated
  USING (is_manager());

CREATE POLICY "Students can view own packages"
  ON course_packages FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Managers can insert packages"
  ON course_packages FOR INSERT
  TO authenticated
  WITH CHECK (is_manager());

CREATE POLICY "Authenticated users can insert own packages"
  ON course_packages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Managers can update all packages"
  ON course_packages FOR UPDATE
  TO authenticated
  USING (is_manager())
  WITH CHECK (is_manager());

-- RLS Policies for sessions table
CREATE POLICY "Managers can view all sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (is_manager());

CREATE POLICY "Students can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Managers can insert sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (is_manager());

CREATE POLICY "Managers can update sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (is_manager())
  WITH CHECK (is_manager());

CREATE POLICY "Managers can delete sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (is_manager());

-- RLS Policies for documents table
CREATE POLICY "Managers can view all documents"
  ON documents FOR SELECT
  TO authenticated
  USING (is_manager());

CREATE POLICY "Students can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Managers can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (is_manager());

CREATE POLICY "Managers can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (is_manager());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_course_packages_student_id ON course_packages(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_package_id ON sessions(package_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON documents(student_id);
