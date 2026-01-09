// Script to seed partner data to Supabase
// Run with: npx tsx scripts/seed-partners.ts

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://ljllloeneawemiffitrm.supabase.co';
// Get this from your Supabase project settings > API > anon/public key
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_KEY) {
    console.error('Please set SUPABASE_ANON_KEY environment variable');
    console.log('Run with: SUPABASE_ANON_KEY=your_key npx tsx scripts/seed-partners.ts');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const partners = [
    {
        name: 'Kementerian Kesehatan RI',
        description_id: 'Kementerian Kesehatan Republik Indonesia yang mengatur kebijakan dan program kesehatan nasional.',
        description_en: 'Ministry of Health of the Republic of Indonesia that regulates national health policies and programs.',
        website_url: 'https://kemkes.go.id',
        contact_email: null,
        contact_phone: null,
        address: null,
        status: 'active',
        is_active: true,
        logo_url: null, // User will upload manually
    },
    {
        name: 'Riseta Medica Inovasia',
        description_id: 'Perusahaan riset kesehatan dan pengolahan data medis di Indonesia.',
        description_en: 'Healthcare research and medical data processing company in Indonesia.',
        website_url: 'https://risetamedica.com',
        contact_email: null,
        contact_phone: null,
        address: null,
        status: 'active',
        is_active: true,
        logo_url: null,
    },
    {
        name: 'Metaderma',
        description_id: 'Klinik skincare online yang menyediakan konsultasi dermatologi dan produk perawatan kulit.',
        description_en: 'Online skincare clinic providing dermatology consultations and skincare products.',
        website_url: 'https://metaderma.id',
        contact_email: null,
        contact_phone: null,
        address: null,
        status: 'active',
        is_active: true,
        logo_url: null,
    },
    {
        name: 'Docpren',
        description_id: 'Platform edukasi dan pengembangan dokter Indonesia.',
        description_en: 'Education and development platform for Indonesian doctors.',
        website_url: null,
        contact_email: null,
        contact_phone: null,
        address: null,
        status: 'active',
        is_active: true,
        logo_url: null,
    },
];

async function seedPartners() {
    console.log('Seeding partners...');

    const { data, error } = await supabase
        .from('partners')
        .insert(partners)
        .select();

    if (error) {
        console.error('Error inserting partners:', error);
        process.exit(1);
    }

    console.log('Successfully inserted', data?.length, 'partners:');
    data?.forEach(p => console.log(' -', p.name));
}

seedPartners();
