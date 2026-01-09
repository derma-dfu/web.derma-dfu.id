import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookToken } from "@/lib/xendit";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin client for server-side operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface XenditWebhookPayload {
    id: string;
    external_id: string;
    status: string;
    amount: number;
    paid_amount?: number;
    paid_at?: string;
    payer_email?: string;
    description?: string;
    payment_method?: string;
    payment_channel?: string;
}

export async function POST(request: NextRequest) {
    try {
        // 1. Verify webhook token from header
        const webhookToken = request.headers.get("x-callback-token");

        if (!verifyWebhookToken(webhookToken)) {
            console.error("Invalid webhook token");
            return NextResponse.json(
                { error: "Invalid webhook token" },
                { status: 401 }
            );
        }

        // 2. Parse webhook payload
        const payload: XenditWebhookPayload = await request.json();

        // console.log("Xendit webhook received:", {
        //     id: payload.id,
        //     external_id: payload.external_id,
        //     status: payload.status,
        //     amount: payload.amount
        // });

        // 3. Handle different invoice statuses
        switch (payload.status) {
            case "PAID":
            case "SETTLED":
                await handlePaymentSuccess(payload);
                break;

            case "EXPIRED":
                await handlePaymentExpired(payload);
                break;

            case "FAILED":
                await handlePaymentFailed(payload);
                break;

            default:
                console.log(`Unhandled invoice status: ${payload.status}`);
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({
            success: true,
            message: `Webhook processed: ${payload.status}`
        });

    } catch (error: any) {
        console.error("Webhook processing error:", error);
        // Return 200 anyway to prevent Xendit from retrying
        return NextResponse.json({
            success: false,
            error: error.message
        });
    }
}

async function handlePaymentSuccess(payload: XenditWebhookPayload) {
    const { external_id, paid_at } = payload;

    // Extract order_id from external_id (format: ORDER-{uuid})
    const orderId = external_id.replace("ORDER-", "");

    // Update payment status
    const { error: paymentError } = await supabaseAdmin
        .from("payments")
        .update({
            status: "paid",
            paid_at: paid_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq("xendit_external_id", external_id);

    if (paymentError) {
        console.error("Failed to update payment:", paymentError);
    }

    // Update order status
    const { error: orderError } = await supabaseAdmin
        .from("orders")
        .update({
            status: "paid",
            updated_at: new Date().toISOString()
        })
        .eq("id", orderId);

    if (orderError) {
        console.error("Failed to update order:", orderError);
    }

    // TODO: Send notification to partner/admin
    // This is a placeholder for email/WhatsApp notification
    console.log(`Order ${orderId} paid - Notify partner for fulfillment`);

    // Get order details for notification
    const { data: order } = await supabaseAdmin
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId)
        .single();

    if (order) {
        // Placeholder: Log order for manual processing
        console.log("Order ready for fulfillment:", {
            order_id: orderId,
            shipping_name: order.shipping_name,
            shipping_phone: order.shipping_phone,
            shipping_address: order.shipping_address,
            items: order.order_items,
            total: order.total_amount
        });

        // TODO: Integrate with WhatsApp API or Email service
        // await sendWhatsAppNotification(order);
        // await sendEmailNotification(order);
    }
}

async function handlePaymentExpired(payload: XenditWebhookPayload) {
    const { external_id } = payload;
    const orderId = external_id.replace("ORDER-", "");

    // Update payment status
    await supabaseAdmin
        .from("payments")
        .update({
            status: "expired",
            updated_at: new Date().toISOString()
        })
        .eq("xendit_external_id", external_id);

    // Update order status
    await supabaseAdmin
        .from("orders")
        .update({
            status: "cancelled",
            updated_at: new Date().toISOString()
        })
        .eq("id", orderId);

    console.log(`Order ${orderId} expired/cancelled`);
}

async function handlePaymentFailed(payload: XenditWebhookPayload) {
    const { external_id } = payload;

    // Update payment status
    await supabaseAdmin
        .from("payments")
        .update({
            status: "failed",
            updated_at: new Date().toISOString()
        })
        .eq("xendit_external_id", external_id);

    console.log(`Payment failed for ${external_id}`);
}
