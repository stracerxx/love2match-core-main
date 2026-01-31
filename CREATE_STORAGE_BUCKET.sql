-- =====================================================
-- CREATE STORAGE BUCKET FOR USER PHOTOS
-- =====================================================
-- Run this in the Supabase SQL Editor to create the 
-- 'user-photos' storage bucket with proper RLS policies
-- =====================================================

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-photos',
  'user-photos',
  true,  -- Public bucket so photos can be viewed without auth
  5242880,  -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;

-- Policy: Anyone can view photos (public bucket)
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-photos');

-- Policy: Authenticated users can upload photos to their own folder
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own photos
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this script, verify the bucket exists:
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'user-photos';

-- Verify policies are created:
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

