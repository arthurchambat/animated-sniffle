-- Migration: Add role_interest column to profiles table
-- Created: 2024-11-06
-- Description: Adds role_interest field for onboarding flow

-- Add role_interest column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role_interest TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.role_interest IS 'User desired role (e.g., Analyste, Associate, VP, etc.)';

-- No index needed as this field is not used for filtering/searching
-- RLS policies remain unchanged - existing policies cover this column
