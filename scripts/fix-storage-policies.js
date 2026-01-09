require('dotenv').config();
const { Client } = require('pg');

async function fixStoragePolicies() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database...\n');

        const buckets = ['doctor-images', 'product-images', 'article-images', 'partner-logos', 'webinar-images'];

        for (const bucket of buckets) {
            console.log(`Setting up policies for: ${bucket}`);

            // Drop existing policies if any
            await client.query(`DROP POLICY IF EXISTS "Allow public read ${bucket}" ON storage.objects`);
            await client.query(`DROP POLICY IF EXISTS "Allow authenticated upload ${bucket}" ON storage.objects`);
            await client.query(`DROP POLICY IF EXISTS "Allow authenticated update ${bucket}" ON storage.objects`);
            await client.query(`DROP POLICY IF EXISTS "Allow authenticated delete ${bucket}" ON storage.objects`);

            // Allow public read
            await client.query(`
                CREATE POLICY "Allow public read ${bucket}" ON storage.objects
                FOR SELECT
                USING (bucket_id = '${bucket}')
            `);

            // Allow authenticated users to upload
            await client.query(`
                CREATE POLICY "Allow authenticated upload ${bucket}" ON storage.objects
                FOR INSERT
                WITH CHECK (
                    bucket_id = '${bucket}' 
                    AND auth.role() = 'authenticated'
                )
            `);

            // Allow authenticated users to update
            await client.query(`
                CREATE POLICY "Allow authenticated update ${bucket}" ON storage.objects
                FOR UPDATE
                USING (
                    bucket_id = '${bucket}'
                    AND auth.role() = 'authenticated'
                )
            `);

            // Allow authenticated users to delete
            await client.query(`
                CREATE POLICY "Allow authenticated delete ${bucket}" ON storage.objects
                FOR DELETE
                USING (
                    bucket_id = '${bucket}'
                    AND auth.role() = 'authenticated'
                )
            `);

            console.log(`  ✅ Policies set for ${bucket}`);
        }

        console.log('\n✅ All storage policies configured!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

fixStoragePolicies();
