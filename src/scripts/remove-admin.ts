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
const db = drizzle(pool);

async function main() {
    const email = 'iddermadfu@gmail.com';
    try {
        // 1. Check legacy public."user" table
        console.log("Checking legacy 'public.user' table...");
        const legacyUserResult = await pool.query('SELECT * FROM public."user" WHERE email = $1', [email]);

        if (legacyUserResult.rowCount && legacyUserResult.rowCount > 0) {
            const legacyUserId = legacyUserResult.rows[0].id;
            console.log(`Found user in legacy table: ${legacyUserId}`);

            // Delete dependencies first
            console.log("Deleting dependent records in 'account' and 'session'...");
            await pool.query('DELETE FROM public.account WHERE "userId" = $1', [legacyUserId]);
            await pool.query('DELETE FROM public.session WHERE "userId" = $1', [legacyUserId]);

            const deleteLegacy = await pool.query('DELETE FROM public."user" WHERE email = $1 RETURNING *', [email]);
            console.log(`Deleted legacy user record: ${deleteLegacy.rows[0].email}`);
        } else {
            console.log("User not found in legacy 'public.user' table.");
        }

        // 2. Check auth.users (Supabase Auth)
        console.log("\nChecking 'auth.users' (Supabase Auth)...");
        const userResult = await pool.query('SELECT id, email FROM auth.users WHERE email ILIKE $1', [email]);

        if (userResult.rowCount === 0) {
            console.log(`User '${email}' NOT FOUND in auth.users.`);
        } else {
            const userId = userResult.rows[0].id;
            const actualEmail = userResult.rows[0].email;
            console.log(`Found User in auth.users: ${actualEmail} (ID: ${userId})`);

            // Delete from public.user_roles if exists
            const deleteResult = await pool.query(
                "DELETE FROM public.user_roles WHERE user_id = $1 AND role = 'admin' RETURNING *",
                [userId]
            );

            if (deleteResult.rowCount && deleteResult.rowCount > 0) {
                console.log(`Successfully removed 'admin' role for user ${actualEmail}.`);
            } else {
                console.log(`User ${actualEmail} has no 'admin' role in public.user_roles.`);
            }
        }

    } catch (error) {
        console.error('Error executing script:', error);
    } finally {
        await pool.end();
    }
}

main();
