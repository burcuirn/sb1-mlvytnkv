/*
  # Update messages table structure
  
  1. Changes
    - Remove sentiment_analysis column
    - Remove sentiment_score column
    - Remove bot_type column
    - Add index on thread_id for better performance
  
  2. Security
    - Keep existing RLS policies
*/

-- Remove sentiment analysis related columns
ALTER TABLE messages 
DROP COLUMN IF EXISTS sentiment_analysis,
DROP COLUMN IF EXISTS sentiment_score,
DROP COLUMN IF EXISTS bot_type;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS messages_thread_id_idx ON messages(thread_id);

-- Ensure RLS is enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Update messages policies to be more specific
DROP POLICY IF EXISTS "Users can view messages in own threads" ON messages;
DROP POLICY IF EXISTS "Users can create messages in own threads" ON messages;

CREATE POLICY "Users can view messages in own threads"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM threads
      WHERE threads.id = messages.thread_id
      AND threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own threads"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM threads
      WHERE threads.id = thread_id
      AND threads.user_id = auth.uid()
    )
  );