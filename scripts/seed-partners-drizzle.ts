// Script to seed partner data using Drizzle ORM
// Run with: npx tsx scripts/seed-partners-drizzle.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { partners } from '../src/db/schema';

dotenv.config({ path: '.env' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

const partnerData = [
    {
        name: 'Kementerian Kesehatan RI',
        description_id: 'Kementerian Kesehatan Republik Indonesia yang mengatur kebijakan dan program kesehatan nasional.',
        description_en: 'Ministry of Health of the Republic of Indonesia that regulates national health policies and programs.',
        website_url: 'https://kemkes.go.id',
        status: 'active',
        is_active: true,
    },
    {
        name: 'Riseta Medica Inovasia',
        description_id: 'Perusahaan riset kesehatan dan pengolahan data medis di Indonesia.',
        description_en: 'Healthcare research and medical data processing company in Indonesia.',
        website_url: 'https://risetamedica.com',
        status: 'active',
        is_active: true,
    },
    {
        name: 'Metaderma',
        description_id: 'Klinik skincare online yang menyediakan konsultasi dermatologi dan produk perawatan kulit.',
        description_en: 'Online skincare clinic providing dermatology consultations and skincare products.',
        website_url: 'https://metaderma.id',
        status: 'active',
        is_active: true,
    },
    {
        name: 'Docpren',
        description_id: 'Platform edukasi dan pengembangan dokter Indonesia.',
        description_en: 'Education and development platform for Indonesian doctors.',
        website_url: null,
        status: 'active',
        is_active: true,
    },
];

async function seedPartners() {
    console.log('🌱 Seeding partners with Drizzle...');

    try {
        const inserted = await db.insert(partners).values(partnerData).returning();

        console.log('✅ Successfully inserted', inserted.length, 'partners:');
        inserted.forEach(p => console.log('  -', p.name));
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }

    await client.end();
    console.log('🎉 Done!');
}

seedPartners();
