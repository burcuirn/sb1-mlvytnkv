/*
  # Fix Profile Creation and Registration

  1. Changes
    - Update profiles table structure
    - Fix phone number handling
    - Improve profile creation trigger
    - Add proper error handling

  2. Security
    - Maintain existing RLS policies
    - Ensure secure password handling
*/

-- Update profiles table structure
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS phone_number_format;

ALTER TABLE public.profiles
ALTER COLUMN phone_number TYPE text,
ADD CONSTRAINT phone_number_format CHECK (
  phone_number IS NULL OR phone_number ~ '^\+90[0-9]{10}$'
);

-- Update the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    username,
    phone_number,
    password,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone_number',
    CASE 
      WHEN NEW.raw_user_meta_data->>'password' IS NOT NULL 
      THEN crypt(NEW.raw_user_meta_data->>'password', gen_salt('bf'))
      ELSE NULL
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    username = COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    phone_number = EXCLUDED.phone_number,
    password = EXCLUDED.password,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();