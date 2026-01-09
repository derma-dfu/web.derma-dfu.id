// Script to apply RLS policies and update product prices
// Run with: npx ts-node scripts/apply-rls-and-prices.ts

const pg = require("pg");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const { Client } = pg;

async function main() {
    console.log("🚀 Starting RLS and Price setup...\n");

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("✅ Connected to database\n");

        // Step 1: Enable RLS on tables
        console.log("📋 Step 1: Enabling RLS on order tables...");

        const rlsQueries = [
            "ALTER TABLE orders ENABLE ROW LEVEL SECURITY;",
            "ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;",
            "ALTER TABLE payments ENABLE ROW LEVEL SECURITY;"
        ];

        for (const query of rlsQueries) {
            try {
                await client.query(query);
                console.log(`   ✅ ${query.split(' ')[2]} RLS enabled`);
            } catch (err: any) {
                if (err.message.includes('already')) {
                    console.log(`   ⏭️ ${query.split(' ')[2]} RLS already enabled`);
                } else {
                    console.log(`   ❌ Error: ${err.message}`);
                }
            }
        }

        // Step 2: Create RLS policies
        console.log("\n📋 Step 2: Creating RLS policies...");

        const policies = [
            // Orders policies
            `CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid()::text = user_id);`,
            `CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid()::text = user_id);`,
            `CREATE POLICY "Users can update own pending orders" ON orders FOR UPDATE USING (auth.uid()::text = user_id AND status = 'pending');`,
            `CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (EXISTS (SELECT 1 FROM "user" WHERE id = auth.uid()::text AND role = 'admin'));`,
            `CREATE POLICY "Admins can update all orders" ON orders FOR UPDATE USING (EXISTS (SELECT 1 FROM "user" WHERE id = auth.uid()::text AND role = 'admin'));`,

            // Order items policies
            `CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()::text));`,
            `CREATE POLICY "Users can create own order items" ON order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()::text));`,
            `CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM "user" WHERE id = auth.uid()::text AND role = 'admin'));`,

            // Payments policies
            `CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid()::text = user_id);`,
            `CREATE POLICY "Users can create own payments" ON payments FOR INSERT WITH CHECK (auth.uid()::text = user_id);`,
            `CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM "user" WHERE id = auth.uid()::text AND role = 'admin'));`,
            `CREATE POLICY "Admins can update all payments" ON payments FOR UPDATE USING (EXISTS (SELECT 1 FROM "user" WHERE id = auth.uid()::text AND role = 'admin'));`,
        ];

        for (const policy of policies) {
            try {
                await client.query(policy);
                const policyName = policy.match(/"([^"]+)"/)?.[1] || 'Unknown';
                console.log(`   ✅ Created: ${policyName}`);
            } catch (err: any) {
                const policyName = policy.match(/"([^"]+)"/)?.[1] || 'Unknown';
                if (err.message.includes('already exists')) {
                    console.log(`   ⏭️ Already exists: ${policyName}`);
                } else {
                    console.log(`   ❌ Error on "${policyName}": ${err.message}`);
                }
            }
        }

        // Step 3: Update product prices
        console.log("\n📋 Step 3: Checking product prices...");

        const { rows: products } = await client.query(
            `SELECT id, title_id, price, is_active FROM products ORDER BY created_at DESC`
        );

        console.log(`   Found ${products.length} products`);

        const productsToUpdate = products.filter((p: any) => !p.price || p.price === 0);

        if (productsToUpdate.length > 0) {
            console.log(`   🔄 Updating ${productsToUpdate.length} products with default price (Rp 100.000)...`);

            for (const product of productsToUpdate) {
                await client.query(
                    `UPDATE products SET price = 100000 WHERE id = $1`,
                    [product.id]
                );
                console.log(`   ✅ Updated: ${product.title_id} → Rp 100.000`);
            }
        } else {
            console.log("   ✅ All products already have prices set");
        }

        // Step 4: Display current products
        console.log("\n📋 Current product prices:");

        const { rows: updatedProducts } = await client.query(
            `SELECT title_id, price, is_active FROM products ORDER BY created_at DESC`
        );

        for (const p of updatedProducts) {
            const status = p.is_active ? "✅" : "❌";
            console.log(`   ${status} ${p.title_id}: Rp ${(p.price || 0).toLocaleString('id-ID')}`);
        }

        console.log("\n✨ Setup complete!");

    } catch (error: any) {
        console.error("❌ Error:", error.message);
    } finally {
        await client.end();
    }
}

main();
