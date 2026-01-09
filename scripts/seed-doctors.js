require('dotenv').config();
const { Client } = require('pg');

async function seedDoctors() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database...\n');

        const doctors = [
            {
                id: crypto.randomUUID(),
                name: 'Dr. dr. Reza Yuridian Purwoko, Sp.D.V.E',
                role_id: 'Konsultan Utama',
                role_en: 'Lead Consultant',
                specialty_id: 'Spesialis Dermatologi, Venereologi, dan Estetika',
                specialty_en: 'Specialist in Dermatology, Venereology, and Esthetics',
                bio_id: 'Dr. dr. Reza Yuridian Purwoko adalah dokter spesialis kulit dan kelamin dengan keahlian khusus di bidang dermatologi, venereologi, dan estetika. Beliau memiliki pengalaman luas dalam penanganan berbagai kondisi kulit termasuk luka diabetes dan perawatan estetika.',
                bio_en: 'Dr. dr. Reza Yuridian Purwoko is a dermatologist specializing in dermatology, venereology, and esthetics. He has extensive experience in treating various skin conditions including diabetic wounds and aesthetic treatments.',
                experience_id: '15+ tahun pengalaman di bidang dermatologi dan estetika',
                experience_en: '15+ years of experience in dermatology and esthetics',
                credentials: ['Sp.D.V.E', 'Fakultas Kedokteran UI', 'RS Murni Teguh'],
                is_active: true
            },
            {
                id: crypto.randomUUID(),
                name: 'Dr. Sonia Wibisono',
                role_id: 'Konsultan Dermatologi',
                role_en: 'Dermatology Consultant',
                specialty_id: 'Spesialis Kesehatan Kulit dan Kecantikan',
                specialty_en: 'Skin Health and Beauty Specialist',
                bio_id: 'Dr. Sonia Wibisono adalah dokter kecantikan ternama yang lulus dari Fakultas Kedokteran Universitas Indonesia. Beliau aktif sebagai narasumber di berbagai program kesehatan dan kecantikan serta pendiri Metaderma.id, platform telekonsultasi untuk perawatan kulit.',
                bio_en: 'Dr. Sonia Wibisono is a renowned beauty doctor who graduated from the Faculty of Medicine, University of Indonesia. She is active as a resource person in various health and beauty programs and founder of Metaderma.id, a teleconsultation platform for skincare.',
                experience_id: '20+ tahun pengalaman dalam kesehatan kulit dan kecantikan',
                experience_en: '20+ years of experience in skin health and beauty',
                credentials: ['Fakultas Kedokteran UI', 'Metaderma.id Founder', 'TV Health Program Host'],
                is_active: true
            },
            {
                id: crypto.randomUUID(),
                name: 'Dr. Andrew Jackson Yang, MARS., Sp.KBV',
                role_id: 'Konsultan Bedah Vaskular',
                role_en: 'Vascular Surgery Consultant',
                specialty_id: 'Spesialis Bedah Vaskular (Pembuluh Darah)',
                specialty_en: 'Specialist in Vascular Surgery (Blood Vessels)',
                bio_id: 'Dr. Andrew Jackson Yang adalah dokter spesialis bedah vaskular yang lulus dari Fakultas Kedokteran Universitas Indonesia dan berpraktik di Rumah Sakit St. Carolus. Beliau memiliki keahlian dalam penanganan komplikasi vaskular pada pasien diabetes termasuk luka kaki diabetes.',
                bio_en: 'Dr. Andrew Jackson Yang is a vascular surgeon who graduated from the Faculty of Medicine, University of Indonesia and practices at St. Carolus Hospital. He specializes in handling vascular complications in diabetic patients including diabetic foot wounds.',
                experience_id: '12+ tahun pengalaman dalam bedah vaskular dan penanganan luka diabetes',
                experience_en: '12+ years of experience in vascular surgery and diabetic wound treatment',
                credentials: ['Sp.KBV', 'MARS', 'Fakultas Kedokteran UI', 'RS St. Carolus'],
                is_active: true
            }
        ];

        console.log('Inserting doctors data...\n');

        for (const doctor of doctors) {
            const query = `
                INSERT INTO doctors (id, name, role_id, role_en, specialty_id, specialty_en, bio_id, bio_en, experience_id, experience_en, credentials, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    role_id = EXCLUDED.role_id,
                    role_en = EXCLUDED.role_en,
                    specialty_id = EXCLUDED.specialty_id,
                    specialty_en = EXCLUDED.specialty_en,
                    bio_id = EXCLUDED.bio_id,
                    bio_en = EXCLUDED.bio_en,
                    experience_id = EXCLUDED.experience_id,
                    experience_en = EXCLUDED.experience_en,
                    credentials = EXCLUDED.credentials,
                    is_active = EXCLUDED.is_active,
                    updated_at = NOW()
            `;

            await client.query(query, [
                doctor.id,
                doctor.name,
                doctor.role_id,
                doctor.role_en,
                doctor.specialty_id,
                doctor.specialty_en,
                doctor.bio_id,
                doctor.bio_en,
                doctor.experience_id,
                doctor.experience_en,
                doctor.credentials,
                doctor.is_active
            ]);

            console.log(`✅ Inserted: ${doctor.name}`);
        }

        console.log('\n✅ All doctors data inserted successfully!');

        // Verify
        const { rows } = await client.query('SELECT id, name, specialty_id FROM doctors WHERE is_active = true ORDER BY created_at');
        console.log('\nCurrent active doctors:');
        rows.forEach((row, idx) => {
            console.log(`  ${idx + 1}. ${row.name}`);
            console.log(`     ${row.specialty_id}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

seedDoctors();
