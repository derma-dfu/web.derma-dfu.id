-- =============================================
-- Row Level Security (RLS) Policies for Orders & Payments
-- Run this in Supabase SQL Editor after migration
-- =============================================

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ORDERS TABLE POLICIES
-- =============================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT 
    USING (auth.uid()::text = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own pending orders (e.g., cancel)
CREATE POLICY "Users can update own pending orders" ON orders
    FOR UPDATE 
    USING (auth.uid()::text = user_id AND status = 'pending');

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM "user" 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- Admins can update all orders
CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM "user" 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- =============================================
-- ORDER_ITEMS TABLE POLICIES
-- =============================================

-- Users can view their own order items
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()::text
        )
    );

-- Users can create order items for their own orders
CREATE POLICY "Users can create own order items" ON order_items
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()::text
        )
    );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM "user" 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- =============================================
-- PAYMENTS TABLE POLICIES
-- =============================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT 
    USING (auth.uid()::text = user_id);

-- Users can create their own payments
CREATE POLICY "Users can create own payments" ON payments
    FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM "user" 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- Admins can update all payments (for manual status changes)
CREATE POLICY "Admins can update all payments" ON payments
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM "user" 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- =============================================
-- SERVICE ROLE BYPASS (for webhooks/backend)
-- The service role key bypasses RLS automatically
-- Make sure to use SUPABASE_SERVICE_ROLE_KEY in backend
-- =============================================
