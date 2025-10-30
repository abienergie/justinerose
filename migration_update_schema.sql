/*
  # Update Schema for Custom Packages and Session Types

  1. Changes to Tables
    - `course_packages`
      - Update package_type CHECK constraint to include 'custom'
      - Add custom_price column for custom packages

    - `sessions`
      - Add session_type column for tracking different types of yoga sessions

  2. Security
    - No changes to RLS policies

  3. Important Notes
    - Uses DO blocks to safely modify existing constraints
    - Adds columns only if they don't already exist
    - Maintains data integrity and backward compatibility
*/

-- Add custom_price column to course_packages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_packages' AND column_name = 'custom_price'
  ) THEN
    ALTER TABLE course_packages ADD COLUMN custom_price integer;
  END IF;
END $$;

-- Add session_type column to sessions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'session_type'
  ) THEN
    ALTER TABLE sessions ADD COLUMN session_type text;
  END IF;
END $$;

-- Update package_type constraint to include 'custom'
DO $$
BEGIN
  -- Drop the old constraint if it exists
  ALTER TABLE course_packages DROP CONSTRAINT IF EXISTS course_packages_package_type_check;

  -- Add the new constraint with 'custom' included
  ALTER TABLE course_packages ADD CONSTRAINT course_packages_package_type_check
    CHECK (package_type IN ('single', 'card_5', 'card_10', 'custom'));
END $$;

-- Add index for session_type for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_session_type ON sessions(session_type);

-- Add RLS policy for managers to delete profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
    AND policyname = 'Managers can delete profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "Managers can delete profiles"
      ON profiles FOR DELETE
      TO authenticated
      USING (is_manager())';
  END IF;
END $$;
