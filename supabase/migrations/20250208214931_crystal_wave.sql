/*
  # Add Password and Phone Fields to Profiles

  1. Changes
    - Add password field to profiles table
    - Add phone number validation
    - Update handle_new_user function to include password
  
  2. Security
    - Password field is encrypted
    - Phone number format validation
*/

-- Add password field and update phone validation
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS password text,
ALTER COLUMN phone_number TYPE text,
ADD CONSTRAINT phone_number_format CHECK (
  phone_number ~ '^\+?[1-9]\d{1,14}$'
);

-- Update the handle_new_user function to include password
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    username,
    password,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    crypt(NEW.raw_user_meta_data->>'password', gen_salt('bf')),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    username = COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    password = EXCLUDED.password,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;