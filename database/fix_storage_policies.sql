-- Fix storage policies - clean up broken policies and create working ones
-- This file should be run manually in Supabase SQL editor

-- Drop old broken policies if any exist
DROP POLICY IF EXISTS "Public read access on report-images bucket" 
ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can insert report-images" 
ON storage.objects;

DROP POLICY IF EXISTS "Users can update own report-images" 
ON storage.objects;

DROP POLICY IF EXISTS "Users can delete own report-images" 
ON storage.objects;

-- Create clean working policies
-- 1. Public read access on report-images bucket
CREATE POLICY "Public read report-images"
ON storage.objects
FOR SELECT USING (
  bucket_id = 'report-images'
);

-- 2. Authenticated users can insert images in report-images bucket
CREATE POLICY "Authenticated users can insert report-images" 
ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'report-images' AND 
  auth.role() = 'authenticated'
);

-- 3. Users can update their own images in report-images bucket
CREATE POLICY "Users can update own report-images" 
ON storage.objects
FOR UPDATE USING (
  bucket_id = 'report-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Users can delete their own images in report-images bucket
CREATE POLICY "Users can delete own report-images" 
ON storage.objects
FOR DELETE USING (
  bucket_id = 'report-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
