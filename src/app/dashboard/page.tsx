"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
    Loading03Icon,
    ShoppingBag01Icon,
    ShoppingCart01Icon,
    File01Icon,
    Settings01Icon,
    PackageIcon,
    ArrowRight01Icon,
    Tick02Icon,
    Time01Icon,
    DeliveryTruck01Icon
} from 'hugeicons-react';

interface Order {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    order_items?: { product_title: string; quantity: number }[];
}

const Dashboard = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const { isAdmin, role, isLoading, userId } = useUserRole();
    const [mounted, setMounted] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        setMounted(true);

        // Load cart items count from localStorage
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            try {
                const items = JSON.parse(savedCart);
                setCartItemCount(items.length);
            } catch (e) {
                console.error('Failed to parse cart items', e);
            }
        }
    }, []);

    // Admin redirect removed to prevent loops. Admins can view dashboard as user.
    // They will see a button to go to Admin Panel.

    // Fetch user orders from database
    useEffect(() => {
        if (!mounted || !userId || isLoading) return;

        const fetchOrders = async () => {
            try {
                // Get user name from session metadata (avoiding typed table issue)
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUserName(session.user.user_metadata?.name || session.user.email?.split('@')[0] || '');
                }

                // Fetch orders with order items - using any to bypass strict typing for new tables
                // Fetch orders without nested relation (FK was removed)
                const { data: ordersData, error } = await (supabase as any)
                    .from('orders')
                    .select('id, total_amount, status, created_at')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (error) throw error;

                // Fetch order items for each order
                if (ordersData && ordersData.length > 0) {
                    const orderIds = ordersData.map((o: any) => o.id);
                    const { data: itemsData } = await (supabase as any)
                        .from('order_items')
                        .select('order_id, product_title, quantity')
                        .in('order_id', orderIds);

                    // Merge items into orders
                    const ordersWithItems = ordersData.map((order: any) => ({
                        ...order,
                        order_items: itemsData?.filter((item: any) => item.order_id === order.id) || []
                    }));
                    setOrders(ordersWithItems);
                } else {
                    setOrders([]);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setOrdersLoading(false);
            }
        };

        fetchOrders();
    }, [mounted, userId, isLoading]);

    // Calculate stats
    const stats = {
        totalOrders: orders.length,
        paidOrders: orders.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'completed').length,
        pendingOrders: orders.filter(o => o.status === 'pending').length
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-700"><Tick02Icon className="w-3 h-3 mr-1" /> {t({ id: 'Dibayar', en: 'Paid' })}</Badge>;
            case 'shipped':
                return <Badge className="bg-blue-100 text-blue-700"><DeliveryTruck01Icon className="w-3 h-3 mr-1" /> {t({ id: 'Dikirim', en: 'Shipped' })}</Badge>;
            case 'completed':
                return <Badge className="bg-emerald-100 text-emerald-700"><Tick02Icon className="w-3 h-3 mr-1" /> {t({ id: 'Selesai', en: 'Completed' })}</Badge>;
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-700"><Time01Icon className="w-3 h-3 mr-1" /> {t({ id: 'Menunggu', en: 'Pending' })}</Badge>;
            case 'cancelled':
                return <Badge variant="secondary" className="bg-red-100 text-red-600">{t({ id: 'Dibatalkan', en: 'Cancelled' })}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (!mounted || isLoading || isRedirecting) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loading03Icon className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-slate-50 to-background">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold mb-1 text-secondary">
                            {t({ id: `Halo, ${userName || 'User'}!`, en: `Hello, ${userName || 'User'}!` })}
                        </h1>
                        <p className="text-muted-foreground">
                            {t({ id: 'Selamat datang di dashboard Anda', en: 'Welcome to your dashboard' })}
                        </p>
                    </div>
                    {/* Admin Access Button */}
                    {isAdmin && (
                        <Button
                            onClick={() => router.push('/admin')}
                            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200"
                        >
                            <Settings01Icon className="mr-2 h-4 w-4" />
                            Admin Panel
                        </Button>
                    )}
                </div>

                {/* Quick Actions Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Cart Card - Prominent */}
                    <Card
                        className="rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10"
                        onClick={() => router.push('/cart')}
                    >
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center relative">
                                <ShoppingCart01Icon className="h-7 w-7 text-primary" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-secondary">
                                    {t({ id: 'Keranjang Belanja', en: 'Shopping Cart' })}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {cartItemCount > 0
                                        ? t({ id: `${cartItemCount} item`, en: `${cartItemCount} item(s)` })
                                        : t({ id: 'Keranjang kosong', en: 'Cart is empty' })
                                    }
                                </p>
                            </div>
                            <ArrowRight01Icon className="h-5 w-5 text-primary" />
                        </CardContent>
                    </Card>

                    {/* Shop Products */}
                    <Card
                        className="rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => router.push('/products')}
                    >
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                                <ShoppingBag01Icon className="h-7 w-7 text-accent" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-secondary">
                                    {t({ id: 'Belanja Produk', en: 'Shop Products' })}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t({ id: 'Produk perawatan luka', en: 'Wound care products' })}
                                </p>
                            </div>
                            <ArrowRight01Icon className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                    </Card>

                    {/* Browse Articles */}
                    <Card
                        className="rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => router.push('/education')}
                    >
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center">
                                <File01Icon className="h-7 w-7 text-warning" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-secondary">
                                    {t({ id: 'Edukasi', en: 'Education' })}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t({ id: 'Artikel kesehatan', en: 'Health articles' })}
                                </p>
                            </div>
                            <ArrowRight01Icon className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-secondary">{stats.totalOrders}</p>
                            <p className="text-sm text-muted-foreground">{t({ id: 'Total Pesanan', en: 'Total Orders' })}</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-green-600">{stats.paidOrders}</p>
                            <p className="text-sm text-muted-foreground">{t({ id: 'Selesai', en: 'Completed' })}</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-amber-600">{stats.pendingOrders}</p>
                            <p className="text-sm text-muted-foreground">{t({ id: 'Menunggu', en: 'Pending' })}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Orders */}
                <Card className="rounded-2xl shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-secondary flex items-center gap-2">
                                <PackageIcon className="h-5 w-5" />
                                {t({ id: 'Pesanan Terbaru', en: 'Recent Orders' })}
                            </CardTitle>
                            <CardDescription>
                                {t({ id: 'Riwayat pemesanan Anda', en: 'Your order history' })}
                            </CardDescription>
                        </div>
                        {orders.length > 0 && (
                            <Button variant="outline" size="sm" onClick={() => router.push('/orders')}>
                                {t({ id: 'Lihat Semua', en: 'View All' })}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {ordersLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loading03Icon className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12">
                                <PackageIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground mb-4">
                                    {t({ id: 'Belum ada pesanan', en: 'No orders yet' })}
                                </p>
                                <Button onClick={() => router.push('/products')}>
                                    <ShoppingBag01Icon className="mr-2 h-4 w-4" />
                                    {t({ id: 'Mulai Belanja', en: 'Start Shopping' })}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex justify-between items-center p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-secondary">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </p>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {order.order_items?.map(item => `${item.product_title} (${item.quantity}x)`).join(', ') || '-'}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">
                                                Rp {order.total_amount.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Role Badge */}
                <div className="mt-6 text-center">
                    <Badge variant="outline" className="text-xs">
                        {role === 'admin' ? 'Administrator' : 'User'}
                    </Badge>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
