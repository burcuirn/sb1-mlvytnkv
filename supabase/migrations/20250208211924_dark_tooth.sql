/*
  # Fix Authentication Issues

  1. Changes
    - Add missing columns to profiles table
    - Update profile trigger function
    - Add unique constraint on email
    - Add default values for timestamps
  
  2. Security
    - Add policy for profile creation
*/

-- Add missing columns and constraints to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone_number bigint,
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();

-- Add unique constraint on email
ALTER TABLE profiles
ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (
    id,
    email,
    username,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'username',
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy for profile creation
CREATE POLICY "Enable insert for authenticated users only"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);