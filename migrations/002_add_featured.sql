-- Migration 002: Add is_featured to shelves
-- Run this in Supabase SQL Editor

ALTER TABLE public.shelves 
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Add index for performance on featured queries
CREATE INDEX IF NOT EXISTS idx_shelves_is_featured ON public.shelves(is_featured);

-- Update RLS policies to allow update of is_featured only for admins?
-- Currently RLS is permissive (USING (true)).
-- If strict policies were in place, we'd need a policy for admin update.
-- Since we are permissive, anyone can update technically (if they knew the endpoint and RLS was completely open for update).
-- But the app logic restricts it to admin UI.
