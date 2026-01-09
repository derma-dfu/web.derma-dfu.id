require('dotenv').config();
const { Client } = require('pg');

async function secureTables() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database...\n');

        const contentTables = [
            'products',
            'articles',
            'doctors',
            'webinars',
            'partners',
            'product_categories',
            'partner_submissions'
        ];

        console.log('🔒 Securing Content Tables...');

        for (const table of contentTables) {
            console.log(`  Processing ${table}...`);

            // 1. Enable RLS
            await client.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);

            // 2. Drop existing policies to be clean
            await client.query(`DROP POLICY IF EXISTS "Public read access" ON "${table}"`);
            await client.query(`DROP POLICY IF EXISTS "Admin write access" ON "${table}"`);

            // 3. Allow Public Read
            // For partner_submissions, maybe we don't want public read? 
            // Actually partner_submissions is for "Contact Us" form, so Public INSERT, Admin SELECT.
            if (table === 'partner_submissions') {
                await client.query(`
                    CREATE POLICY "Public insert access" ON "${table}"
                    FOR INSERT
                    WITH CHECK (true)
                `);
                await client.query(`
                    CREATE POLICY "Admin read access" ON "${table}"
                    FOR SELECT
                    USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin')
                `);
            } else {
                // Standard Content: Public Read, Admin Write
                await client.query(`
                    CREATE POLICY "Public read access" ON "${table}"
                    FOR SELECT
                    USING (true)
                `);

                await client.query(`
                    CREATE POLICY "Admin write access" ON "${table}"
                    FOR ALL
                    USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin')
                `);
            }
        }

        console.log('\n🔒 Securing Auth/System Tables (user, session, etc)...');
        // These tables found in public schema: user, session, account, verification
        // They should NOT be accessible by anon via API.
        // We will ENABLE RLS and provide NO POLICIES for anon/authenticated (unless specific needs arise).
        // This effectively makes them "Service Role Only" which fits Next.js server-side usage.

        const systemTables = ['user', 'session', 'account', 'verification'];

        for (const table of systemTables) {
            console.log(`  Processing ${table}...`);
            // Check if table exists first (case sensitive in some configs, but usually lowercase in PG)
            const res = await client.query(`SELECT to_regclass('public."${table}"')`);
            if (res.rows[0].to_regclass) {
                await client.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);
                // No policies added = No access for public/anon/authenticated via PostgREST.
                // Service Role key (used in backend) bypasses RLS.
            }
        }

        console.log('\n✅ All tables secured successfully!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

secureTables();
