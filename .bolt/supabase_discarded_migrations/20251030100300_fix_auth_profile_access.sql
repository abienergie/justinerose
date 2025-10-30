/*
  # Fix Authentication Profile Access

  1. Changes
    - Add policy to allow users to read their own profile immediately after authentication
    - This fixes the "Database error querying schema" issue during login
    - Users can now access their profile data right after signing in

  2. Security
    - Maintains RLS security
    - Only allows users to read their own profile (auth.uid() = id)
    - Does not compromise manager/student separation
*/

-- Drop the problematic policies that create circular dependencies
DROP POLICY IF EXISTS "Managers can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Students can view own profile" ON profiles;

-- Create a single, simple policy for SELECT that allows:
-- 1. Users to view their own profile (needed right after login)
-- 2. Managers to view all profiles
CREATE POLICY "Users can view own profile, managers can view all"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'manager'
    )
  );
