/*
  # Add user_id to password_resets table

  1. Changes
    - Add user_id column to password_resets table
    - Add foreign key constraint to auth.users
    - Add index for better performance
*/

-- Add user_id column
ALTER TABLE public.password_resets
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id
ON public.password_resets(user_id); 