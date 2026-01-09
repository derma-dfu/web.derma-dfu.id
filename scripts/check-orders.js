require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOrders() {
    console.log('Checking orders in database...\n');

    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, user_id, status, total_amount, shipping_name, created_at')
        .limit(10);

    if (error) {
        console.log('Error:', error.message);
        return;
    }

    console.log(`Found ${orders?.length || 0} orders:\n`);

    if (orders && orders.length > 0) {
        orders.forEach(order => {
            console.log(`- Order #${order.id.slice(0, 8)} | ${order.shipping_name} | ${order.status} | Rp ${order.total_amount.toLocaleString()}`);
        });
    } else {
        console.log('No orders found in database.');
    }
}

checkOrders();
