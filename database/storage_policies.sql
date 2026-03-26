-- Storage policies for report-images bucket
-- These policies control access to uploaded report images

-- 1. Public read access on report-images bucket
-- This allows anyone to view uploaded images
CREATE POLICY "Public read access on report-images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'report-images'
    );

-- 2. Authenticated users can insert images in report-images bucket
-- This allows logged-in users to upload images
CREATE POLICY "Authenticated users can insert report-images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'report-images' AND 
        auth.role() = 'authenticated'
    );

-- 3. Users can update their own images in report-images bucket
-- This allows users to replace their own uploaded images
CREATE POLICY "Users can update own report-images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'report-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- 4. Users can delete their own images in report-images bucket
-- This allows users to delete their own uploaded images
CREATE POLICY "Users can delete own report-images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'report-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Helper function to extract user ID from folder path
-- This function extracts the user ID from paths like "reports/userId/filename.jpg"
CREATE OR REPLACE FUNCTION storage.foldername(path text)
RETURNS text[] AS $$
BEGIN
    -- Split path and return array of folder names
    RETURN string_to_array(path, '/');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
