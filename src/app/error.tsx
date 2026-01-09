'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { t } = useLanguage();

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-center px-4">
            <h2 className="text-2xl font-bold text-destructive">
                {t({ id: 'Terjadi Kesalahan', en: 'Something went wrong!' })}
            </h2>
            <p className="text-muted-foreground max-w-md">
                {t({
                    id: 'Maaf, terjadi kesalahan saat memuat halaman ini.',
                    en: 'Sorry, an error occurred while loading this page.'
                })}
            </p>
            <div className="flex gap-4 mt-4">
                <Button onClick={() => reset()} variant="default">
                    {t({ id: 'Coba Lagi', en: 'Try again' })}
                </Button>
                <Button onClick={() => window.location.href = '/'} variant="outline">
                    {t({ id: 'Kembali ke Beranda', en: 'Go Home' })}
                </Button>
            </div>
        </div>
    );
}
