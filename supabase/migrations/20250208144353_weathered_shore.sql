/*
  # Add sentiment analysis support
  
  1. Changes
    - Add sentiment_analysis column to messages table
    - Add sentiment_score column to messages table
    - Add bot_type column to messages table to distinguish between different bots
  
  2. Security
    - Existing RLS policies will cover the new columns
*/

-- Add new columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS sentiment_analysis text,
ADD COLUMN IF NOT EXISTS sentiment_score float,
ADD COLUMN IF NOT EXISTS bot_type text CHECK (bot_type IN ('sezar', 'sentiment')) DEFAULT 'sezar';

-- Update existing messages to have bot_type='sezar'
UPDATE messages SET bot_type = 'sezar' WHERE type = 'bot';