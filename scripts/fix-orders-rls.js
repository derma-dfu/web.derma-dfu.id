require('dotenv').config();
const { Client } = require('pg');

async function fixOrdersRLS() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database...\n');

        // Drop existing policies
        console.log('Dropping existing policies...');
        await client.query(`DROP POLICY IF EXISTS "Allow all for admin orders" ON orders`);
        await client.query(`DROP POLICY IF EXISTS "Admin can view all orders" ON orders`);
        await client.query(`DROP POLICY IF EXISTS "Users can view own orders" ON orders`);
        await client.query(`DROP POLICY IF EXISTS "Admin full access orders" ON orders`);
        await client.query(`DROP POLICY IF EXISTS "Users view own orders" ON orders`);
        await client.query(`DROP POLICY IF EXISTS "Service role bypass orders" ON orders`);

        await client.query(`DROP POLICY IF EXISTS "Allow all for admin order_items" ON order_items`);
        await client.query(`DROP POLICY IF EXISTS "Admin can view all order_items" ON order_items`);
        await client.query(`DROP POLICY IF EXISTS "Users can view own order_items" ON order_items`);
        await client.query(`DROP POLICY IF EXISTS "Admin full access order_items" ON order_items`);
        await client.query(`DROP POLICY IF EXISTS "Users view own order_items" ON order_items`);
        await client.query(`DROP POLICY IF EXISTS "Service role bypass order_items" ON order_items`);

        console.log('Creating new policies...');

        // Admin can do everything on orders (using JWT metadata)
        await client.query(`
            CREATE POLICY "Admin full access orders" ON orders
                FOR ALL
                USING (
                    ((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin'
                )
        `);

        // Users can view their own orders (cast auth.uid() to text for comparison with uuid)
        await client.query(`
            CREATE POLICY "Users view own orders" ON orders
                FOR SELECT
                USING (user_id::text = auth.uid()::text)
        `);

        // Admin can do everything on order_items
        await client.query(`
            CREATE POLICY "Admin full access order_items" ON order_items
                FOR ALL
                USING (
                    ((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin'
                )
        `);

        // Users can view their own order items
        await client.query(`
            CREATE POLICY "Users view own order_items" ON order_items
                FOR SELECT
                USING (
                    EXISTS (
                        SELECT 1 FROM orders 
                        WHERE orders.id = order_items.order_id 
                        AND orders.user_id::text = auth.uid()::text
                    )
                )
        `);

        console.log('✅ RLS policies updated successfully!\n');

        // Verify policies
        const { rows } = await client.query(`
            SELECT tablename, policyname, cmd 
            FROM pg_policies 
            WHERE tablename IN ('orders', 'order_items')
            ORDER BY tablename, policyname;
        `);

        console.log('Current policies:');
        rows.forEach(row => {
            console.log(`  - ${row.tablename}: "${row.policyname}" (${row.cmd})`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

fixOrdersRLS();
