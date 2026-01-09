const pg = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const client = new pg.Client({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Check orders table schema
        const ordersResult = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'orders'
            ORDER BY ordinal_position
        `);
        console.log('\nOrders table columns:');
        ordersResult.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });

        // Check if tables exist
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('orders', 'order_items', 'payments')
        `);
        console.log('\nTables found:', tablesResult.rows.map(r => r.table_name).join(', '));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

main();
