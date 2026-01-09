import Xendit from "xendit-node";

// Initialize Xendit client
// XENDIT_SECRET_KEY should be stored as server-side env var (no NEXT_PUBLIC_ prefix)
const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY!,
});

// Export Invoice API client
export const invoiceClient = xenditClient.Invoice;

// Helper to verify webhook token
export function verifyWebhookToken(token: string | null): boolean {
    const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;
    if (!expectedToken) {
        console.warn("XENDIT_WEBHOOK_TOKEN not set");
        return false;
    }
    return token === expectedToken;
}

// Invoice status types
export type XenditInvoiceStatus =
    | "PENDING"
    | "PAID"
    | "SETTLED"
    | "EXPIRED"
    | "FAILED";

export default xenditClient;
