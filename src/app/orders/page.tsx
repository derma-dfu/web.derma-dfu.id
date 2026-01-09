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
    PackageIcon,
    ArrowLeft02Icon,
    Tick02Icon,
    Time01Icon,
    DeliveryTruck01Icon,
    Cancel01Icon,
    FilterIcon
} from 'hugeicons-react';

interface OrderItem {
    product_title: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    order_items: OrderItem[];
}

type StatusFilter = 'all' | 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

const OrdersPage = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const { isLoading, userId } = useUserRole();
    const [mounted, setMounted] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch user orders from database
    useEffect(() => {
        if (!mounted || !userId || isLoading) return;

        const fetchOrders = async () => {
            try {
                // Fetch orders
                const { data: ordersData, error } = await (supabase as any)
                    .from('orders')
                    .select('id, total_amount, status, created_at, shipping_name, shipping_phone, shipping_address')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Fetch order items for each order
                if (ordersData && ordersData.length > 0) {
                    const orderIds = ordersData.map((o: any) => o.id);
                    const { data: itemsData } = await (supabase as any)
                        .from('order_items')
                        .select('order_id, product_title, quantity, price')
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

    // Filter orders by status
    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(order => order.status === statusFilter);

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
                return <Badge variant="secondary" className="bg-red-100 text-red-600"><Cancel01Icon className="w-3 h-3 mr-1" /> {t({ id: 'Dibatalkan', en: 'Cancelled' })}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statusFilters: { key: StatusFilter; label: { id: string; en: string } }[] = [
        { key: 'all', label: { id: 'Semua', en: 'All' } },
        { key: 'pending', label: { id: 'Menunggu', en: 'Pending' } },
        { key: 'paid', label: { id: 'Dibayar', en: 'Paid' } },
        { key: 'shipped', label: { id: 'Dikirim', en: 'Shipped' } },
        { key: 'completed', label: { id: 'Selesai', en: 'Completed' } },
        { key: 'cancelled', label: { id: 'Dibatalkan', en: 'Cancelled' } }
    ];

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loading03Icon className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-slate-50 to-background">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-4 -ml-2"
                        onClick={() => router.push('/dashboard')}
                    >
                        <ArrowLeft02Icon className="h-4 w-4 mr-2" />
                        {t({ id: 'Kembali ke Dashboard', en: 'Back to Dashboard' })}
                    </Button>
                    <h1 className="text-3xl font-bold mb-1 text-secondary flex items-center gap-3">
                        <PackageIcon className="h-8 w-8 text-primary" />
                        {t({ id: 'Pesanan Saya', en: 'My Orders' })}
                    </h1>
                    <p className="text-muted-foreground">
                        {t({ id: 'Lihat riwayat dan status pesanan Anda', en: 'View your order history and status' })}
                    </p>
                </div>

                {/* Filter Tabs */}
                <Card className="rounded-2xl shadow-sm mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <FilterIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">
                                {t({ id: 'Filter Status', en: 'Filter by Status' })}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {statusFilters.map((filter) => (
                                <Button
                                    key={filter.key}
                                    variant={statusFilter === filter.key ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setStatusFilter(filter.key)}
                                    className="rounded-full"
                                >
                                    {t(filter.label)}
                                    {filter.key !== 'all' && (
                                        <span className="ml-1 text-xs opacity-70">
                                            ({orders.filter(o => o.status === filter.key).length})
                                        </span>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Orders List */}
                {ordersLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loading03Icon className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <Card className="rounded-2xl shadow-md">
                        <CardContent className="text-center py-16">
                            <PackageIcon className="h-20 w-20 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-lg text-muted-foreground mb-4">
                                {statusFilter === 'all'
                                    ? t({ id: 'Belum ada pesanan', en: 'No orders yet' })
                                    : t({ id: 'Tidak ada pesanan dengan status ini', en: 'No orders with this status' })
                                }
                            </p>
                            <Button onClick={() => router.push('/products')}>
                                <ShoppingBag01Icon className="mr-2 h-4 w-4" />
                                {t({ id: 'Mulai Belanja', en: 'Start Shopping' })}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <Card
                                key={order.id}
                                className="rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden"
                            >
                                <CardHeader
                                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => setExpandedOrderId(
                                        expandedOrderId === order.id ? null : order.id
                                    )}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg text-secondary flex items-center gap-2">
                                                #{order.id.slice(0, 8).toUpperCase()}
                                                {getStatusBadge(order.status)}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {formatDate(order.created_at)}
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-primary">
                                                Rp {order.total_amount.toLocaleString('id-ID')}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {order.order_items.length} {t({ id: 'item', en: 'item(s)' })}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>

                                {/* Expanded Content */}
                                {expandedOrderId === order.id && (
                                    <CardContent className="border-t pt-4">
                                        {/* Order Items */}
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-secondary mb-2">
                                                {t({ id: 'Produk', en: 'Products' })}
                                            </h4>
                                            <div className="space-y-2">
                                                {order.order_items.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
                                                    >
                                                        <div>
                                                            <p className="font-medium">{item.product_title}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {item.quantity}x @ Rp {item.price.toLocaleString('id-ID')}
                                                            </p>
                                                        </div>
                                                        <p className="font-semibold">
                                                            Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Shipping Info */}
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-secondary mb-2">
                                                {t({ id: 'Informasi Pengiriman', en: 'Shipping Information' })}
                                            </h4>
                                            <div className="space-y-1 text-sm">
                                                <p><span className="text-muted-foreground">{t({ id: 'Nama:', en: 'Name:' })}</span> {order.shipping_name}</p>
                                                <p><span className="text-muted-foreground">{t({ id: 'Telepon:', en: 'Phone:' })}</span> {order.shipping_phone}</p>
                                                <p><span className="text-muted-foreground">{t({ id: 'Alamat:', en: 'Address:' })}</span> {order.shipping_address}</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons for Pending Orders */}
                                        {order.status === 'pending' && (
                                            <div className="mt-4 flex gap-2">
                                                <Button
                                                    className="flex-1"
                                                    onClick={() => {
                                                        // TODO: Navigate to payment page or show payment modal
                                                    }}
                                                >
                                                    {t({ id: 'Bayar Sekarang', en: 'Pay Now' })}
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

                {/* Summary */}
                {filteredOrders.length > 0 && (
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        {t({ id: `Menampilkan ${filteredOrders.length} dari ${orders.length} pesanan`, en: `Showing ${filteredOrders.length} of ${orders.length} orders` })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
