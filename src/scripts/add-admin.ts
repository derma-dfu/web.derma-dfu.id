import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is missing');
    process.exit(1);
}

const pool = new Pool({ connectionString });

async function main() {
    const email = 'iddermadfu@gmail.com';
    console.log(`Adding admin role for: ${email}...`);

    try {
        // 1. Find User
        const userResult = await pool.query('SELECT id FROM auth.users WHERE email = $1', [email]);

        if (userResult.rowCount === 0) {
            console.error(`User '${email}' NOT FOUND in auth.users. Cannot grant admin role.`);
            return;
        }

        const userId = userResult.rows[0].id;
        console.log(`Found User ID: ${userId}`);

        // 2. Update user_metadata in auth.users
        // We merge the new role into existing metadata
        const updateResult = await pool.query(`
            UPDATE auth.users 
            SET raw_user_meta_data = 
                CASE 
                    WHEN raw_user_meta_data IS NULL THEN '{"role": "admin"}'::jsonb
                    ELSE raw_user_meta_data || '{"role": "admin"}'::jsonb
                END
            WHERE id = $1
            RETURNING raw_user_meta_data
        `, [userId]);

        console.log("Updated user metadata:", updateResult.rows[0].raw_user_meta_data);
        console.log("Successfully granted 'admin' role via user_metadata!");

    } catch (error) {
        console.error('Error executing script:', error);
    } finally {
        await pool.end();
    }
}

main();
