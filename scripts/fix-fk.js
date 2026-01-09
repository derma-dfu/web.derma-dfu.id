const pg = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const client = new pg.Client({
    connectionString: process.env.DATABASE_URL
});

async function fixForeignKey() {
    try {
        await client.connect();
        console.log('Connected to database\n');

        // Drop the foreign key constraint on orders.user_id
        console.log('Dropping foreign key constraint on orders.user_id...');
        await client.query(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_user_id_fk`);
        console.log('✅ Foreign key constraint dropped!\n');

        // Now test order creation
        const orderId = require('crypto').randomUUID();
        const testUserId = 'auth-user-' + Date.now();

        console.log('Testing order creation with user ID:', testUserId);
        const insertResult = await client.query(
            `INSERT INTO orders (id, user_id, total_amount, shipping_address, shipping_name, shipping_phone, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [orderId, testUserId, 100000, 'Test Address', 'Test Name', '+6281234567890', 'pending']
        );
        console.log('✅ Order creation test succeeded!', insertResult.rows[0]);

        // Clean up
        await client.query(`DELETE FROM orders WHERE id = $1`, [orderId]);
        console.log('✅ Test data cleaned up\n');

        console.log('🎉 CHECKOUT SHOULD NOW WORK!');
        console.log('The foreign key constraint has been removed.');
        console.log('Restart your dev server and try checkout again.');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

fixForeignKey();
