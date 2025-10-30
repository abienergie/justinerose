/*
  # Add Google Review Tracking

  1. Changes to Tables
    - `profiles`
      - Add google_review_requested column to track if the review popup was shown
      - Default value is false

  2. Important Notes
    - Uses DO block to safely add column only if it doesn't exist
    - No security changes needed
*/

-- Add google_review_requested column to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'google_review_requested'
  ) THEN
    ALTER TABLE profiles ADD COLUMN google_review_requested boolean DEFAULT false;
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_google_review ON profiles(google_review_requested);
