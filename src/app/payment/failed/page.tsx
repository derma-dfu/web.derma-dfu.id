"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Cancel01Icon, ArrowLeft02Icon } from 'hugeicons-react';
import Link from 'next/link';

import { Suspense } from 'react';

function PaymentFailedContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-red-50 to-background">
            <Card className="max-w-md w-full rounded-3xl shadow-xl border-red-100">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Cancel01Icon className="w-10 h-10 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl text-red-700">
                        {t({ id: 'Pembayaran Gagal', en: 'Payment Failed' })}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {t({
                            id: 'Maaf, pembayaran Anda tidak dapat diproses.',
                            en: 'Sorry, your payment could not be processed.'
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

                    <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-700">
                        <p className="font-medium mb-2">
                            {t({ id: 'Kemungkinan Penyebab:', en: 'Possible Causes:' })}
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-amber-600">
                            <li>{t({ id: 'Saldo tidak mencukupi', en: 'Insufficient balance' })}</li>
                            <li>{t({ id: 'Pembayaran dibatalkan', en: 'Payment was cancelled' })}</li>
                            <li>{t({ id: 'Waktu pembayaran habis', en: 'Payment timed out' })}</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href="/cart" className="w-full">
                            <Button className="w-full h-12 bg-primary">
                                {t({ id: 'Coba Lagi', en: 'Try Again' })}
                            </Button>
                        </Link>
                        <Link href="/products" className="w-full">
                            <Button variant="outline" className="w-full h-12">
                                <ArrowLeft02Icon className="mr-2 h-5 w-5" />
                                {t({ id: 'Kembali ke Produk', en: 'Back to Products' })}
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentFailed() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <PaymentFailedContent />
        </Suspense>
    );
}
