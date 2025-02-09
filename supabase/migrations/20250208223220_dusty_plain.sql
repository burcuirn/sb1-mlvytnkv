/*
  # Fix UUID handling and add constraints

  1. Changes
    - Add UUID validation functions
    - Update foreign key constraints
    - Add indexes for performance
  
  2. Security
    - Ensure proper UUID format validation
    - Add constraints to prevent invalid data
*/

-- Create UUID validation function
CREATE OR REPLACE FUNCTION is_valid_uuid(text) RETURNS boolean AS $$
BEGIN
  RETURN $1 ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
EXCEPTION
  WHEN others THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add UUID validation triggers
CREATE OR REPLACE FUNCTION validate_uuid() RETURNS trigger AS $$
BEGIN
  IF NOT is_valid_uuid(NEW.id::text) THEN
    RAISE EXCEPTION 'Invalid UUID format';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add validation triggers to tables
DROP TRIGGER IF EXISTS validate_profile_uuid ON profiles;
CREATE TRIGGER validate_profile_uuid
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION validate_uuid();

DROP TRIGGER IF EXISTS validate_thread_uuid ON threads;
CREATE TRIGGER validate_thread_uuid
  BEFORE INSERT OR UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION validate_uuid();

DROP TRIGGER IF EXISTS validate_message_uuid ON messages;
CREATE TRIGGER validate_message_uuid
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION validate_uuid();

-- Add indexes for UUID columns
CREATE INDEX IF NOT EXISTS threads_user_id_idx ON threads(user_id);
CREATE INDEX IF NOT EXISTS messages_thread_id_idx ON messages(thread_id);

-- Update foreign key constraints with ON DELETE CASCADE
ALTER TABLE threads
DROP CONSTRAINT IF EXISTS threads_user_id_fkey,
ADD CONSTRAINT threads_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_thread_id_fkey,
ADD CONSTRAINT messages_thread_id_fkey
  FOREIGN KEY (thread_id)
  REFERENCES threads(id)
  ON DELETE CASCADE;