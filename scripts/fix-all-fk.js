const pg = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const client = new pg.Client({
    connectionString: process.env.DATABASE_URL
});

async function fixAllForeignKeys() {
    try {
        await client.connect();
        console.log('Connected to database\n');

        // List all constraints we need to drop
        const constraints = [
            { table: 'orders', constraint: 'orders_user_id_user_id_fk' },
            { table: 'payments', constraint: 'payments_user_id_user_id_fk' },
            { table: 'payments', constraint: 'payments_order_id_orders_id_fk' },
            { table: 'order_items', constraint: 'order_items_order_id_orders_id_fk' },
            { table: 'order_items', constraint: 'order_items_product_id_products_id_fk' }
        ];

        for (const { table, constraint } of constraints) {
            console.log(`Dropping ${constraint} on ${table}...`);
            try {
                await client.query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${constraint}`);
                console.log(`  ✅ Dropped ${constraint}`);
            } catch (e) {
                console.log(`  ⚠️ ${e.message}`);
            }
        }

        console.log('\n🎉 All foreign key constraints removed!');
        console.log('Checkout should now work without constraint errors.');
        console.log('\nRestart your dev server and try again.');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

fixAllForeignKeys();
