-- Create the 'partner-logos' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create the 'article-images' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create the 'product-images' bucket (just in case it's missing, though user said it exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up policies for 'partner-logos'
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'partner-logos' );

-- Allow authenticated users to upload
CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'partner-logos' );

-- Allow authenticated users to update
CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'partner-logos' );

-- Allow authenticated users to delete
CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'partner-logos' );


-- Set up policies for 'article-images'
-- Allow public read access
CREATE POLICY "Public Access Article"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'article-images' );

-- Allow authenticated users to upload
CREATE POLICY "Auth Upload Article"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'article-images' );

-- Allow authenticated users to update
CREATE POLICY "Auth Update Article"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'article-images' );

-- Allow authenticated users to delete
CREATE POLICY "Auth Delete Article"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'article-images' );
