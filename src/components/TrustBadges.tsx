"use client";

import {
    SecurityCheckIcon,
    Certificate02Icon,
    SecurityLockIcon,
    CheckmarkBadge02Icon,
    Award02Icon
} from 'hugeicons-react';
import { useLanguage } from '@/contexts/LanguageContext';

const TrustBadges = () => {
    const { t } = useLanguage();

    const badges = [
        {
            icon: <SecurityCheckIcon className="h-6 w-6 text-primary" />,
            title: { id: 'Terdaftar Kemenkes', en: 'Registered with MOH' },
            subtitle: { id: 'Lisensi Resmi', en: 'Official License' }
        },
        {
            icon: <Certificate02Icon className="h-6 w-6 text-primary" />,
            title: { id: 'ISO 13485', en: 'ISO 13485' },
            subtitle: { id: 'Medical Devices', en: 'Medical Devices' }
        },
        {
            icon: <SecurityLockIcon className="h-6 w-6 text-primary" />,
            title: { id: 'Data Terenkripsi', en: 'Encrypted Data' },
            subtitle: { id: 'SSL/TLS Secure', en: 'SSL/TLS Secure' }
        },
        {
            icon: <CheckmarkBadge02Icon className="h-6 w-6 text-primary" />,
            title: { id: 'BPOM Approved', en: 'BPOM Approved' },
            subtitle: { id: 'Produk Tersertifikasi', en: 'Certified Products' }
        },
        {
            icon: <Award02Icon className="h-6 w-6 text-primary" />,
            title: { id: 'Anggota PERKENI', en: 'PERKENI Member' },
            subtitle: { id: 'Asosiasi Profesional', en: 'Professional Association' }
        }
    ];

    return (
        <div className="bg-muted/30 border-y border-border/50 py-8">
            <div className="container mx-auto px-4">
                <div className="text-center mb-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {t({ id: 'Dipercaya & Tersertifikasi', en: 'Trusted & Certified' })}
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                    {badges.map((badge, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center p-4 bg-white rounded-xl border border-border/40 hover:border-primary/30 hover:shadow-sm transition-all group"
                        >
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                {badge.icon}
                            </div>
                            <h4 className="text-sm font-bold text-secondary text-center mb-0.5">
                                {t(badge.title)}
                            </h4>
                            <p className="text-xs text-muted-foreground text-center">
                                {t(badge.subtitle)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrustBadges;
