// Script to update partner contact data using Drizzle ORM
// Run with: npx tsx scripts/update-partners-contact.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
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

const partnerUpdates = [
    {
        name: 'Kementerian Kesehatan RI',
        contact_email: 'kontak@kemkes.go.id',
        contact_phone: '1500-567',
        address: 'Jl. HR Rasuna Said Blok X.5 Kav. 4-9, Kuningan, Jakarta Selatan 12950',
    },
    {
        name: 'Riseta Medica Inovasia',
        contact_email: 'info@risetamedica.com',
        contact_phone: null,
        address: null,
    },
    {
        name: 'Metaderma',
        contact_email: 'info@metaderma.id',
        contact_phone: '+62 821-2221-5400',
        address: null,
    },
    {
        name: 'Docpren',
        contact_email: null,
        contact_phone: null,
        address: null,
    },
];

async function updatePartners() {
    console.log('📝 Updating partner contact data...');

    for (const update of partnerUpdates) {
        try {
            const result = await db.update(partners)
                .set({
                    contact_email: update.contact_email,
                    contact_phone: update.contact_phone,
                    address: update.address,
                })
                .where(eq(partners.name, update.name))
                .returning();

            if (result.length > 0) {
                console.log(`✅ Updated: ${update.name}`);
                if (update.contact_email) console.log(`   Email: ${update.contact_email}`);
                if (update.contact_phone) console.log(`   Phone: ${update.contact_phone}`);
                if (update.address) console.log(`   Address: ${update.address}`);
            } else {
                console.log(`⚠️  Not found: ${update.name}`);
            }
        } catch (error) {
            console.error(`❌ Error updating ${update.name}:`, error);
        }
    }

    await client.end();
    console.log('🎉 Done!');
}

updatePartners();
