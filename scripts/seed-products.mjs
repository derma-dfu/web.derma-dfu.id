
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
    {
        title_id: 'Meso Whitening',
        title_en: 'Meso Whitening',
        description_id: 'Perawatan pencerah wajah dengan Ami Tone Up.',
        description_en: 'Brightening facial treatment using Ami Tone Up.',
        category: 'treatment',
        price: 1500000,
        imagePath: 'C:\\Users\\ferry\\.gemini\\antigravity\\brain\\dcae13bf-241a-4e2d-b85e-5d0788b26a23\\treatment_meso_whitening_1770594855699.png'
    },
    {
        title_id: 'Exosome Therapy',
        title_en: 'Exosome Therapy',
        description_id: 'Terapi regenerasi kulit dengan Botanic Exo.',
        description_en: 'Skin regeneration therapy using Botanic Exo.',
        category: 'treatment',
        price: 3000000,
        imagePath: 'C:\\Users\\ferry\\.gemini\\antigravity\\brain\\dcae13bf-241a-4e2d-b85e-5d0788b26a23\\treatment_exosome_1770594871949.png'
    },
    {
        title_id: 'Collagen Stimulator',
        title_en: 'Collagen Stimulator',
        description_id: 'Perangsang kolagen alami dengan FACETEM.',
        description_en: 'Natural collagen stimulator with FACETEM.',
        category: 'treatment',
        price: 7000000,
        imagePath: 'C:\\Users\\ferry\\.gemini\\antigravity\\brain\\dcae13bf-241a-4e2d-b85e-5d0788b26a23\\treatment_collagen_1770594891899.png'
    },
    {
        title_id: 'Face Lipolysis',
        title_en: 'Face Lipolysis',
        description_id: 'Penghancur lemak wajah (Slimming) dengan Facelane.',
        description_en: 'Fat dissolving facial treatment using Facelane.',
        category: 'treatment',
        price: 500000,
        imagePath: 'C:\\Users\\ferry\\.gemini\\antigravity\\brain\\dcae13bf-241a-4e2d-b85e-5d0788b26a23\\treatment_lipolysis_1770594914604.png'
    },
    {
        title_id: 'Skin Booster PDRN',
        title_en: 'Skin Booster PDRN',
        description_id: 'Nutrisi kulit intensif dengan ANA PNV.',
        description_en: 'Intensive skin nutrition using ANA PNV.',
        category: 'treatment',
        price: 2000000,
        imagePath: null
    },
    {
        title_id: 'OPI BEAUTY Suplemen',
        title_en: 'OPI BEAUTY Supplement',
        description_id: 'Suplemen kecantikan 60 Kapsul.',
        description_en: 'Beauty supplement 60 Capsules.',
        category: 'product',
        price: 1500000,
        imagePath: null
    },
    {
        title_id: 'Dermal Filler (Shape)',
        title_en: 'Dermal Filler (Shape)',
        description_id: 'Filler Hyafilia M Plus / Dorothy untuk kontur wajah.',
        description_en: 'Hyafilia M Plus / Dorothy filler for facial contouring.',
        category: 'treatment',
        price: 3000000,
        imagePath: null
    },
    {
        title_id: 'Dermal Filler (Volume)',
        title_en: 'Dermal Filler (Volume)',
        description_id: 'Filler Hyafilia V Plus untuk volume wajah.',
        description_en: 'Hyafilia V Plus filler for facial volume.',
        category: 'treatment',
        price: 3500000,
        imagePath: null
    }
];

async function seed() {
    console.log('Starting seed...');

    for (const product of products) {
        let publicUrl = null;

        if (product.imagePath && fs.existsSync(product.imagePath)) {
            const fileName = path.basename(product.imagePath);
            const fileBuffer = fs.readFileSync(product.imagePath);

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(fileName, fileBuffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (error) {
                console.error(`Error uploading ${fileName}:`, error.message);
            } else {
                const { data: publicUrlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName);
                publicUrl = publicUrlData.publicUrl;
                console.log(`Uploaded ${fileName}: ${publicUrl}`);
            }
        } else if (product.imagePath) {
            console.warn(`File not found: ${product.imagePath}`);
        }

        const { error: insertError } = await supabase
            .from('products')
            .insert({
                id: randomUUID(),
                title_id: product.title_id,
                title_en: product.title_en,
                description_id: product.description_id,
                description_en: product.description_en,
                category: product.category,
                price: product.price,
                image_url: publicUrl,
                is_active: true
            });

        if (insertError) {
            console.error(`Error inserting ${product.title_id}:`, insertError.message);
        } else {
            console.log(`Inserted ${product.title_id}`);
        }
    }

    console.log('Seed completed.');
}

seed();
