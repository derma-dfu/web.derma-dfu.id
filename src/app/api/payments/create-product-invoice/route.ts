import { NextRequest, NextResponse } from "next/server";
import { invoiceClient } from "@/lib/xendit";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin client for server-side operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CreateInvoiceRequest {
    items: {
        product_id: string;
        quantity: number;
    }[];
    shipping_address: string;
    shipping_name: string;
    shipping_phone: string;
    notes?: string;
}

export async function POST(request: NextRequest) {
    try {
        // 1. Get user from authorization header or session
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { error: "Unauthorized - Please login first" },
                { status: 401 }
            );
        }

        // Verify user session
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { error: "Invalid session" },
                { status: 401 }
            );
        }

        // 2. Parse request body
        const body: CreateInvoiceRequest = await request.json();

        if (!body.items || body.items.length === 0) {
            return NextResponse.json(
                { error: "No items in order" },
                { status: 400 }
            );
        }

        if (!body.shipping_address || !body.shipping_name || !body.shipping_phone) {
            return NextResponse.json(
                { error: "Shipping information is required" },
                { status: 400 }
            );
        }

        // 3. Validate products and calculate total
        const productIds = body.items.map(item => item.product_id);
        console.log("Product IDs to validate:", productIds);

        const { data: products, error: productsError } = await supabaseAdmin
            .from("products")
            .select("id, title_id, title_en, price, is_active")
            .in("id", productIds)
            .eq("is_active", true);

        console.log("Products query result:", { products, productsError });

        if (productsError || !products || products.length !== productIds.length) {
            console.error("Product validation failed:", { productsError, productsCount: products?.length, expectedCount: productIds.length });
            return NextResponse.json(
                { error: "One or more products not found or inactive", details: productsError?.message },
                { status: 400 }
            );
        }

        // Calculate order items with prices
        const orderItems = body.items.map(item => {
            const product = products.find(p => p.id === item.product_id)!;
            return {
                product_id: product.id,
                product_title: product.title_id,
                quantity: item.quantity,
                unit_price: product.price,
                subtotal: product.price * item.quantity
            };
        });

        const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

        if (totalAmount <= 0) {
            return NextResponse.json(
                { error: "Invalid total amount" },
                { status: 400 }
            );
        }

        // 4. Create order in database
        const orderId = crypto.randomUUID();
        console.log("Creating order:", { orderId, userId: user.id, totalAmount });

        const { error: orderError } = await supabaseAdmin
            .from("orders")
            .insert({
                id: orderId,
                user_id: user.id,
                total_amount: totalAmount,
                shipping_address: body.shipping_address,
                shipping_name: body.shipping_name,
                shipping_phone: body.shipping_phone,
                notes: body.notes || null,
                status: "pending"
            });

        if (orderError) {
            console.error("Order creation error:", JSON.stringify(orderError, null, 2));
            return NextResponse.json(
                { error: "Failed to create order", details: orderError.message },
                { status: 500 }
            );
        }

        // 5. Create order items
        const orderItemsData = orderItems.map(item => ({
            id: crypto.randomUUID(),
            order_id: orderId,
            product_id: item.product_id,
            product_title: item.product_title,
            quantity: item.quantity,
            unit_price: item.unit_price
        }));

        const { error: itemsError } = await supabaseAdmin
            .from("order_items")
            .insert(orderItemsData);

        if (itemsError) {
            console.error("Order items error:", itemsError);
            // Rollback order
            await supabaseAdmin.from("orders").delete().eq("id", orderId);
            return NextResponse.json(
                { error: "Failed to create order items" },
                { status: 500 }
            );
        }

        // 6. Create Xendit Invoice
        const externalId = `ORDER-${orderId}`;
        const invoiceItems = orderItems.map(item => ({
            name: item.product_title,
            quantity: item.quantity,
            price: item.unit_price
        }));

        const xenditInvoice = await invoiceClient.createInvoice({
            data: {
                externalId: externalId,
                amount: totalAmount,
                description: `Order #${orderId.slice(0, 8)}`,
                currency: "IDR",
                invoiceDuration: 86400, // 24 hours
                customer: {
                    email: user.email,
                    givenNames: body.shipping_name,
                    mobileNumber: body.shipping_phone
                },
                items: invoiceItems,
                successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success?order_id=${orderId}`,
                failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/failed?order_id=${orderId}`
            }
        });

        // 7. Create payment record
        const paymentId = crypto.randomUUID();
        const { error: paymentError } = await supabaseAdmin
            .from("payments")
            .insert({
                id: paymentId,
                user_id: user.id,
                order_id: orderId,
                amount: totalAmount,
                status: "pending",
                xendit_invoice_id: xenditInvoice.id,
                xendit_invoice_url: xenditInvoice.invoiceUrl,
                xendit_external_id: externalId
            });

        if (paymentError) {
            console.error("Payment record error:", paymentError);
            // Don't fail the request, invoice is already created
        }

        // 8. Return invoice URL to redirect user
        return NextResponse.json({
            success: true,
            order_id: orderId,
            payment_id: paymentId,
            invoice_url: xenditInvoice.invoiceUrl,
            invoice_id: xenditInvoice.id,
            amount: totalAmount,
            expires_at: xenditInvoice.expiryDate
        });

    } catch (error: any) {
        console.error("Create invoice error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create invoice" },
            { status: 500 }
        );
    }
}
