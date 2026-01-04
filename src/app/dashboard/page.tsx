"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { useEffect, useState } from 'react';
import {
    Loading03Icon,
    ShoppingBag01Icon,
    UserGroupIcon,
    File01Icon,
    Settings01Icon
} from 'hugeicons-react';
const Dashboard = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const { isAdmin, role, isLoading } = useUserRole();
    const [mounted, setMounted] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // Redirect admin to admin page
    useEffect(() => {
        if (!mounted) return;
        if (!isLoading && isAdmin && !isRedirecting) {
            console.log('Admin detected, redirecting to /admin');
            setIsRedirecting(true);
            router.replace('/admin');
        }
    }, [isAdmin, isLoading, router, mounted, isRedirecting]);

    const userStats = [
        {
            icon: <ShoppingBag01Icon className="h-6 w-6 text-primary" />,
            label: { id: 'Pesanan', en: 'Orders' },
            value: '3'
        },
        {
            icon: <UserGroupIcon className="h-6 w-6 text-accent" />,
            label: { id: 'Konsultasi', en: 'Consultations' },
            value: '5'
        },
        {
            icon: <File01Icon className="h-6 w-6 text-warning" />,
            label: { id: 'Artikel Tersimpan', en: 'Saved Articles' },
            value: '12'
        }
    ];

    const recentOrders = [
        {
            id: '001',
            product: { id: 'Pembalut Hidrokoloid Premium', en: 'Premium Hydrocolloid Dressing' },
            status: { id: 'Dikirim', en: 'Shipped' },
            date: '2025-10-05'
        },
        {
            id: '002',
            product: { id: 'Sistem Monitoring Digital', en: 'Digital Monitoring System' },
            status: { id: 'Diproses', en: 'Processing' },
            date: '2025-10-07'
        }
    ];

    if (!mounted || isLoading || isRedirecting) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loading03Icon className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="container mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-secondary">
                        {t({ id: 'Dashboard', en: 'Dashboard' })}
                    </h1>
                    <p className="text-lg text-foreground/80">
                        {t({ id: 'Selamat datang kembali!', en: 'Welcome back!' })}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {userStats.map((stat, index) => (
                        <Card key={index} className="rounded-2xl shadow-md hover-scale">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-foreground/70">
                                    {t(stat.label)}
                                </CardTitle>
                                {stat.icon}
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-secondary">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Orders */}
                <Card className="mb-8 rounded-2xl shadow-md">
                    <CardHeader>
                        <CardTitle className="text-secondary">
                            {t({ id: 'Pesanan Terbaru', en: 'Recent Orders' })}
                        </CardTitle>
                        <CardDescription>
                            {t({ id: 'Riwayat pemesanan Anda', en: 'Your order history' })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                                    <div>
                                        <p className="font-medium">{t(order.product)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {t({ id: 'Pesanan', en: 'Order' })} #{order.id} • {order.date}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                        {t(order.status)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="rounded-2xl shadow-md hover-scale cursor-pointer" onClick={() => router.push('/products')}>
                        <CardHeader>
                            <CardTitle className="text-secondary flex items-center">
                                <ShoppingBag01Icon className="mr-2 h-5 w-5" />
                                {t({ id: 'Belanja Produk', en: 'Shop Products' })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                {t({ id: 'Jelajahi produk perawatan luka', en: 'Explore wound care products' })}
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-md hover-scale cursor-pointer" onClick={() => router.push('/admin')}>
                        <CardHeader>
                            <CardTitle className="text-secondary flex items-center">
                                <Settings01Icon className="mr-2 h-5 w-5" />
                                {t({ id: 'Pengaturan', en: 'Settings' })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                {t({ id: 'Kelola akun dan preferensi', en: 'Manage account and preferences' })}
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>

                {/* Role Badge */}
                <div className="mt-8 p-4 bg-muted/30 rounded-2xl text-center">
                    <p className="text-sm text-muted-foreground">
                        {t({ id: `Role: ${role === 'admin' ? 'Administrator' : 'Pengguna'}`, en: `Role: ${role === 'admin' ? 'Administrator' : 'User'}` })}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
