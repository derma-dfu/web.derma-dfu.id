require('dotenv').config();
const { Client } = require('pg');

async function auditRLS() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database...\n');

        // Get all tables in public schema
        const tablesRes = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
        `);

        const tables = tablesRes.rows.map(r => r.tablename);
        console.log(`Checking RLS for tables: ${tables.join(', ')}\n`);

        for (const table of tables) {
            // Check if RLS is enabled
            const rlsRes = await client.query(`
                SELECT relrowsecurity 
                FROM pg_class 
                WHERE relname = $1
            `, [table]);

            const isRLSEnabled = rlsRes.rows[0]?.relrowsecurity;
            console.log(`Table: ${table} [RLS: ${isRLSEnabled ? '✅ ON' : '❌ OFF'}]`);

            // Get policies
            const policiesRes = await client.query(`
                SELECT policyname, cmd, roles, qual, with_check
                FROM pg_policies 
                WHERE tablename = $1
            `, [table]);

            if (policiesRes.rows.length === 0) {
                console.log('  ⚠️  No policies found! (Data access might be blocked completely or open if RLS is off)');
            } else {
                policiesRes.rows.forEach(p => {
                    console.log(`  - ${p.policyname} (${p.cmd})`);
                });
            }
            console.log('');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

auditRLS();
