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
    console.log(`Checking status for: ${email}...`);

    try {
        const res = await pool.query(
            'SELECT id, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data FROM auth.users WHERE email = $1',
            [email]
        );

        if (res.rowCount === 0) {
            console.log('User NOT FOUND in auth.users');
        } else {
            const user = res.rows[0];
            console.log('User Found:');
            console.log(`- ID: ${user.id}`);
            console.log(`- Email: ${user.email}`);
            console.log(`- Confirmed At: ${user.email_confirmed_at ? user.email_confirmed_at : 'NOT CONFIRMED'}`);
            console.log(`- Provider: ${user.raw_app_meta_data.provider}`);

            if (user.raw_app_meta_data.provider === 'google') {
                console.log('\nNOTE: Google Auth users are typically verified automatically by Supabase.');
            }
        }

    } catch (error) {
        console.error('Error executing query:', error);
    } finally {
        await pool.end();
    }
}

main();
