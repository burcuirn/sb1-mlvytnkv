/*
  # Update messages table structure
  
  1. Changes
    - Remove existing content column
    - Add bot_response column
    - Add generated content column
    - Update constraints and triggers

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing triggers and constraints
DROP TRIGGER IF EXISTS validate_message_format_trigger ON messages;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS message_type_content_check;

-- Drop content column if it exists
ALTER TABLE messages DROP COLUMN IF EXISTS content;

-- Add bot_response column if it doesn't exist
ALTER TABLE messages ADD COLUMN IF NOT EXISTS bot_response text;

-- Add generated content column
ALTER TABLE messages 
ADD COLUMN content text 
GENERATED ALWAYS AS (
  COALESCE(user_prompt, bot_response)
) STORED;

-- Create validation function
CREATE OR REPLACE FUNCTION validate_message_format()
RETURNS trigger AS $$
BEGIN
  IF NEW.user_prompt IS NULL THEN
    RAISE EXCEPTION 'User prompt cannot be null';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
CREATE TRIGGER validate_message_format_trigger
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION validate_message_format();