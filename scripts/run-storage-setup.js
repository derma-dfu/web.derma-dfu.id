const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('Error: DATABASE_URL not found in .env');
    process.exit(1);
}

const sql = postgres(dbUrl);

async function main() {
    try {
        const sqlFilePath = path.join(__dirname, '..', 'create_storage_buckets.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Executing SQL from create_storage_buckets.sql...');

        // Execute the SQL content
        // postgres.js 'file' would be better but we have the content in a file already.
        // However, to execute raw multi-statement SQL safely with postgres.js, we often use sql.unsafe()
        // but sql.unsafe might strictly allow one statement depending on config/driver.
        // But specific to postgres.js, multiple statements are often allowed if passed as a single string to unsafe for simple migrations.
        // Let's try executing the file directly using the 'file' feature if available or just reading it.

        await sql.file(sqlFilePath);

        console.log('✅ Storage buckets and policies created successfully!');
    } catch (error) {
        console.error('❌ Error executing SQL:', error);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

main();
