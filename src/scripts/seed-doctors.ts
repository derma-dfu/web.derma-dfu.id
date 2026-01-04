
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Or use SERVICE_ROLE_KEY if RLS policies prevent anon inserts, but for now anon/service check:
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || (!supabaseKey && !supabaseServiceKey)) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey!);

const doctors = [
    {
        name: 'dr. Andrew Suprayogi, Sp.PD., M.M., FINASIM',
        role_id: 'Spesialis Penyakit Dalam',
        role_en: 'Internal Medicine Specialist',
        specialty_id: 'Diabetes & Metabolisme',
        specialty_en: 'Diabetes & Metabolism',
        experience_id: '15+ Tahun',
        experience_en: '15+ Years',
        image_url: '/doctors/dr.%20andrew.png',
        credentials: ['Sp.PD', 'M.M', 'FINASIM'],
        is_active: true
    },
    {
        name: 'Dr. dr. Reza Y Purwoko, Sp.DVE., FINSDV., FAADV',
        role_id: 'Spesialis Dermatologi & Venereologi',
        role_en: 'Dermatology & Venereology Specialist',
        specialty_id: 'Perawatan Luka Diabetes',
        specialty_en: 'Diabetic Wound Care',
        experience_id: '12+ Tahun',
        experience_en: '12+ Years',
        image_url: '/doctors/dr.%20Reza.jpg',
        credentials: ['Sp.DVE', 'FINSDV', 'FAADV'],
        is_active: true
    },
    {
        name: 'dr. Sonia Wibisono',
        role_id: 'Dokter Umum',
        role_en: 'General Practitioner',
        specialty_id: 'Konseling Pasien DFU',
        specialty_en: 'DFU Patient Counseling',
        experience_id: '8+ Tahun',
        experience_en: '8+ Years',
        image_url: '/doctors/dr.%20Sonia.png',
        credentials: ['Universitas Indonesia'],
        is_active: true
    }
];

async function seedDoctors() {
    console.log('Seeding doctors...');

    // Check if doctors already exist
    const { data: existing, error: checkError } = await supabase.from('doctors').select('id');

    if (checkError) {
        console.error('Error checking existing doctors (table might not exist yet):', checkError);
        return;
    }

    if (existing && existing.length > 0) {
        console.log('Doctors table already has data. Skipping seed.');
        return;
    }

    const { error } = await supabase.from('doctors').insert(doctors);

    if (error) {
        console.error('Error inserting doctors:', error);
    } else {
        console.log('Doctors seeded successfully!');
    }
}

seedDoctors();
