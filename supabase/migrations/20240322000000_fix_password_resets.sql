/*
  # Fix password_resets table

  1. Changes
    - Add user_id column to password_resets table
    - Add foreign key constraint to auth.users
    - Add index for better performance
*/

-- Drop existing user_id column if it exists
ALTER TABLE public.password_resets
DROP COLUMN IF EXISTS user_id;

-- Add user_id column
ALTER TABLE public.password_resets
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id
ON public.password_resets(user_id)
WHERE user_id IS NOT NULL; 