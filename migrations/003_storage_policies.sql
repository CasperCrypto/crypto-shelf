-- Migration 003: Storage Policies for Assets Bucket
-- This fixes the "new row violates row-level security policy" error during uploads.
-- Run this in your Supabase SQL Editor.

-- 1. Ensure the "assets" bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow Deletes" ON storage.objects;

-- 3. Create permissive policies for the "assets" bucket

-- Policy: Allow public read access to all files in the assets bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'assets' );

-- Policy: Allow any user to upload files to the assets bucket
-- Note: In a strict production environment, you should restrict this to admins.
CREATE POLICY "Allow Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'assets' );

-- Policy: Allow any user to update files in the assets bucket
CREATE POLICY "Allow Updates"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'assets' );

-- Policy: Allow any user to delete files from the assets bucket
CREATE POLICY "Allow Deletes"
ON storage.objects FOR DELETE
USING ( bucket_id = 'assets' );
