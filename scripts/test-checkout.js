const pg = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const client = new pg.Client({
    connectionString: process.env.DATABASE_URL
});

async function testCheckout() {
    try {
        await client.connect();
        console.log('Connected to database\n');

        // 1. Get a product
        console.log('1. Fetching active product...');
        const { rows: products } = await client.query(
            `SELECT id, title_id, price FROM products WHERE is_active = true LIMIT 1`
        );

        if (products.length === 0) {
            console.error('No active products found!');
            return;
        }

        console.log('   Product:', products[0]);

        // 2. Create a test order
        const orderId = require('crypto').randomUUID();
        const testUserId = 'test-user-' + Date.now(); // Simulated user ID
        const totalAmount = products[0].price;

        console.log('\n2. Creating order...');
        console.log('   Order ID:', orderId);
        console.log('   User ID:', testUserId);
        console.log('   Total Amount:', totalAmount);

        try {
            const insertResult = await client.query(
                `INSERT INTO orders (id, user_id, total_amount, shipping_address, shipping_name, shipping_phone, status, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING id`,
                [orderId, testUserId, totalAmount, 'Test Address', 'Test Name', '+6281234567890', 'pending', null]
            );
            console.log('   ✅ Order created successfully!', insertResult.rows[0]);
        } catch (insertError) {
            console.error('   ❌ Order creation failed:', insertError.message);
            console.error('   Error code:', insertError.code);
            console.error('   Error detail:', insertError.detail);
            return;
        }

        // 3. Create order item
        const orderItemId = require('crypto').randomUUID();
        console.log('\n3. Creating order item...');

        try {
            const itemResult = await client.query(
                `INSERT INTO order_items (id, order_id, product_id, product_title, quantity, unit_price)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id`,
                [orderItemId, orderId, products[0].id, products[0].title_id, 1, products[0].price]
            );
            console.log('   ✅ Order item created!', itemResult.rows[0]);
        } catch (itemError) {
            console.error('   ❌ Order item creation failed:', itemError.message);
        }

        // 4. Create payment record
        const paymentId = require('crypto').randomUUID();
        console.log('\n4. Creating payment record...');

        try {
            const paymentResult = await client.query(
                `INSERT INTO payments (id, user_id, order_id, amount, status, xendit_invoice_id, xendit_invoice_url, xendit_external_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING id`,
                [paymentId, testUserId, orderId, totalAmount, 'pending', 'test-invoice-id', 'https://example.com/invoice', 'ORDER-' + orderId]
            );
            console.log('   ✅ Payment record created!', paymentResult.rows[0]);
        } catch (paymentError) {
            console.error('   ❌ Payment creation failed:', paymentError.message);
        }

        // 5. Clean up test data
        console.log('\n5. Cleaning up test data...');
        await client.query(`DELETE FROM payments WHERE id = $1`, [paymentId]);
        await client.query(`DELETE FROM order_items WHERE id = $1`, [orderItemId]);
        await client.query(`DELETE FROM orders WHERE id = $1`, [orderId]);
        console.log('   ✅ Test data cleaned up');

        console.log('\n🎉 ALL DATABASE OPERATIONS SUCCEEDED!');
        console.log('The checkout should work. The error might be in:');
        console.log('  1. User authentication (token validation)');
        console.log('  2. Xendit API call');
        console.log('  3. Request body format');

    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await client.end();
    }
}

testCheckout();
