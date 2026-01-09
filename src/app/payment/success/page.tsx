"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tick02Icon, ShoppingCart01Icon } from 'hugeicons-react';
import Link from 'next/link';

import { Suspense } from 'react';

function PaymentSuccessContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);

        // Clear cart after successful payment
        if (typeof window !== 'undefined') {
            localStorage.removeItem('cartItems');
        }
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-green-50 to-background">
            <Card className="max-w-md w-full rounded-3xl shadow-xl border-green-100">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Tick02Icon className="w-10 h-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl text-green-700">
                        {t({ id: 'Pembayaran Berhasil!', en: 'Payment Successful!' })}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {t({
                            id: 'Terima kasih atas pembelian Anda. Pesanan Anda sedang diproses.',
                            en: 'Thank you for your purchase. Your order is being processed.'
                        })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {orderId && (
                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                            <p className="text-sm text-muted-foreground mb-1">
                                {t({ id: 'ID Pesanan', en: 'Order ID' })}
                            </p>
                            <p className="font-mono font-semibold text-secondary">
                                {orderId.slice(0, 8).toUpperCase()}
                            </p>
                        </div>
                    )}

                    <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                        <p className="font-medium mb-2">
                            {t({ id: 'Langkah Selanjutnya:', en: 'Next Steps:' })}
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-blue-600">
                            <li>{t({ id: 'Anda akan menerima email konfirmasi', en: 'You will receive a confirmation email' })}</li>
                            <li>{t({ id: 'Tim kami akan memproses pesanan Anda', en: 'Our team will process your order' })}</li>
                            <li>{t({ id: 'Pesanan akan dikirim dalam 1-3 hari kerja', en: 'Order will be shipped within 1-3 business days' })}</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href="/products" className="w-full">
                            <Button className="w-full h-12">
                                <ShoppingCart01Icon className="mr-2 h-5 w-5" />
                                {t({ id: 'Lanjut Belanja', en: 'Continue Shopping' })}
                            </Button>
                        </Link>
                        <Link href="/dashboard" className="w-full">
                            <Button variant="outline" className="w-full h-12">
                                {t({ id: 'Lihat Pesanan Saya', en: 'View My Orders' })}
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentSuccess() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}
