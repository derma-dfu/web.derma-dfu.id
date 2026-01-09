require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createBuckets() {
    console.log('Creating storage buckets...\n');

    const buckets = [
        'doctor-images',
        'product-images',
        'article-images',
        'partner-logos',
        'webinar-images'
    ];

    for (const bucket of buckets) {
        console.log(`Creating bucket: ${bucket}...`);

        // Check if bucket exists
        const { data: existingBucket } = await supabase.storage.getBucket(bucket);

        if (existingBucket) {
            console.log(`  ✅ ${bucket} already exists`);
            continue;
        }

        // Create bucket
        const { error } = await supabase.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        });

        if (error) {
            console.log(`  ❌ Error creating ${bucket}: ${error.message}`);
        } else {
            console.log(`  ✅ ${bucket} created successfully`);
        }
    }

    console.log('\n✅ Bucket setup complete!');

    // List all buckets
    const { data: allBuckets } = await supabase.storage.listBuckets();
    console.log('\nExisting buckets:');
    allBuckets?.forEach(b => console.log(`  - ${b.name}`));
}

createBuckets();
