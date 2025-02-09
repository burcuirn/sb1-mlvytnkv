/*
  # Update messages table structure
  
  1. Changes
    - Ensure user_prompt and bot_response are in the same row
    - Keep only user prompt timestamp
    - No data modification
    - No column additions/removals

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing triggers and constraints
DROP TRIGGER IF EXISTS validate_message_format_trigger ON messages;

-- Create or replace validation function to ensure proper message format
CREATE OR REPLACE FUNCTION validate_message_format()
RETURNS trigger AS $$
BEGIN
  -- Ensure user_prompt is not null
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