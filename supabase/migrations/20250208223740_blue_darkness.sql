/*
  # Update messages table structure

  1. Changes
    - Add user_prompt and bot_response columns
    - Update existing messages to split content into appropriate columns
    - Add check constraints to ensure proper data format
    - Update RLS policies

  2. Security
    - Maintain existing RLS policies
    - Add validation for new columns
*/

-- Add new columns
ALTER TABLE messages
ADD COLUMN user_prompt text,
ADD COLUMN bot_response text;

-- Update existing messages
UPDATE messages
SET user_prompt = content,
    bot_response = NULL
WHERE type = 'user';

UPDATE messages
SET bot_response = content,
    user_prompt = NULL
WHERE type = 'bot';

-- Add check constraints
ALTER TABLE messages
ADD CONSTRAINT message_type_content_check
CHECK (
  (type = 'user' AND user_prompt IS NOT NULL AND bot_response IS NULL) OR
  (type = 'bot' AND bot_response IS NOT NULL AND user_prompt IS NULL)
);

-- Create function to ensure proper message format
CREATE OR REPLACE FUNCTION validate_message_format()
RETURNS trigger AS $$
BEGIN
  IF NEW.type = 'user' AND (NEW.user_prompt IS NULL OR NEW.bot_response IS NOT NULL) THEN
    RAISE EXCEPTION 'User messages must have user_prompt and no bot_response';
  END IF;
  
  IF NEW.type = 'bot' AND (NEW.bot_response IS NULL OR NEW.user_prompt IS NOT NULL) THEN
    RAISE EXCEPTION 'Bot messages must have bot_response and no user_prompt';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for message format validation
CREATE TRIGGER validate_message_format_trigger
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION validate_message_format();

-- Update the content column to be computed
ALTER TABLE messages DROP COLUMN content;
ALTER TABLE messages 
ADD COLUMN content text 
GENERATED ALWAYS AS (
  COALESCE(user_prompt, bot_response)
) STORED;