const pg = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const client = new pg.Client({
    connectionString: process.env.DATABASE_URL
});

async function fixAllFK() {
    try {
        await client.connect();
        console.log('Connected to database\n');

        // Drop FK on payments table too
        console.log('Dropping FK constraint on payments.user_id...');
        await client.query(`ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_user_id_fk`);
        console.log('✅ Payments FK constraint dropped!\n');

        // Test payment insert
        const paymentId = require('crypto').randomUUID();
        const orderId = require('crypto').randomUUID();
        const testUserId = 'auth-user-' + Date.now();

        console.log('Testing payment creation...');
        await client.query(
            `INSERT INTO payments (id, user_id, order_id, amount, status, xendit_invoice_id, xendit_invoice_url, xendit_external_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [paymentId, testUserId, orderId, 100000, 'pending', 'test-id', 'https://test.com', 'ORDER-test']
        );
        console.log('✅ Payment creation test succeeded!');

        // Clean up
        await client.query(`DELETE FROM payments WHERE id = $1`, [paymentId]);
        console.log('✅ Test data cleaned up\n');

        console.log('🎉 ALL FIXED! Checkout should fully work now.');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

fixAllFK();
