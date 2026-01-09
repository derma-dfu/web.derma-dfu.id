-- =============================================
-- Reporting Queries for Orders & Payments
-- =============================================

-- 1. Total orders per day
SELECT 
    DATE(created_at) as order_date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue
FROM orders
WHERE status IN ('paid', 'shipped', 'completed')
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- 2. Total revenue (all time)
SELECT 
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value
FROM orders
WHERE status IN ('paid', 'shipped', 'completed');

-- 3. Revenue by status
SELECT 
    status,
    COUNT(*) as order_count,
    SUM(total_amount) as total_amount
FROM orders
GROUP BY status
ORDER BY total_amount DESC;

-- 4. Pending shipments (orders paid but not shipped)
SELECT 
    o.id as order_id,
    o.shipping_name,
    o.shipping_phone,
    o.shipping_address,
    o.total_amount,
    o.created_at as order_date,
    p.paid_at as payment_date
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.status = 'paid'
ORDER BY o.created_at ASC;

-- 5. Top selling products
SELECT 
    oi.product_title,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.quantity * oi.unit_price) as total_revenue
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.status IN ('paid', 'shipped', 'completed')
GROUP BY oi.product_title
ORDER BY total_revenue DESC;

-- 6. Orders by user (customer report)
SELECT 
    u.name as customer_name,
    u.email as customer_email,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_spent
FROM "user" u
LEFT JOIN orders o ON o.user_id = u.id AND o.status IN ('paid', 'shipped', 'completed')
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC;

-- 7. Payment success rate
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM payments
GROUP BY status;

-- 8. Daily revenue trend (last 30 days)
SELECT 
    DATE(created_at) as date,
    COUNT(*) as orders,
    SUM(total_amount) as revenue
FROM orders
WHERE status IN ('paid', 'shipped', 'completed')
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;
