"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import {
    PackageIcon,
    News01Icon,
    UserGroupIcon,
    Calendar03Icon,
    ShoppingCart01Icon,
    MoneyBag01Icon,
    Time01Icon,
    Tick02Icon,
    DeliveryTruck01Icon,
    ChartLineData01Icon
} from 'hugeicons-react';
import dynamic from 'next/dynamic';

// Dynamic import for Recharts to avoid SSR issues
const SalesChart = dynamic(() => import('./SalesChart').then(mod => mod.SalesChart), {
    ssr: false,
    loading: () => <div className="h-64 bg-slate-100 animate-pulse rounded-lg"></div>
});

interface Order {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    shipping_name: string;
}

interface OrderItem {
    product_id: string;
    product_title: string;
    quantity: number;
}

interface DailyRevenue {
    date: string;
    revenue: number;
    orders: number;
}

interface TopProduct {
    product_title: string;
    total_sold: number;
    revenue: number;
}

export const DashboardOverview = () => {
    const { t } = useLanguage();
    const [contentStats, setContentStats] = useState({
        products: 0,
        articles: 0,
        partners: 0,
        webinars: 0
    });
    const [orderStats, setOrderStats] = useState({
        total: 0,
        pending: 0,
        paid: 0,
        shipped: 0,
        completed: 0,
        cancelled: 0
    });
    const [revenueStats, setRevenueStats] = useState({
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        allTime: 0
    });
    const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Content Counts
                const [productsCount, articlesCount, partnersCount, webinarsCount] = await Promise.all([
                    supabase.from('products').select('*', { count: 'exact', head: true }),
                    supabase.from('articles').select('*', { count: 'exact', head: true }),
                    supabase.from('partners').select('*', { count: 'exact', head: true }),
                    supabase.from('webinars').select('*', { count: 'exact', head: true })
                ]);

                setContentStats({
                    products: productsCount.count || 0,
                    articles: articlesCount.count || 0,
                    partners: partnersCount.count || 0,
                    webinars: webinarsCount.count || 0
                });

                // Fetch Orders
                const { data: ordersData } = await (supabase as any)
                    .from('orders')
                    .select('id, total_amount, status, created_at, shipping_name')
                    .order('created_at', { ascending: false });

                if (ordersData) {
                    // Order Stats
                    const stats = {
                        total: ordersData.length,
                        pending: ordersData.filter((o: Order) => o.status === 'pending').length,
                        paid: ordersData.filter((o: Order) => o.status === 'paid').length,
                        shipped: ordersData.filter((o: Order) => o.status === 'shipped').length,
                        completed: ordersData.filter((o: Order) => o.status === 'completed').length,
                        cancelled: ordersData.filter((o: Order) => o.status === 'cancelled').length
                    };
                    setOrderStats(stats);

                    // Revenue Stats
                    const now = new Date();
                    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

                    const paidOrders = ordersData.filter((o: Order) =>
                        ['paid', 'shipped', 'completed'].includes(o.status)
                    );

                    const revenue = {
                        today: paidOrders
                            .filter((o: Order) => new Date(o.created_at) >= todayStart)
                            .reduce((sum: number, o: Order) => sum + o.total_amount, 0),
                        thisWeek: paidOrders
                            .filter((o: Order) => new Date(o.created_at) >= weekStart)
                            .reduce((sum: number, o: Order) => sum + o.total_amount, 0),
                        thisMonth: paidOrders
                            .filter((o: Order) => new Date(o.created_at) >= monthStart)
                            .reduce((sum: number, o: Order) => sum + o.total_amount, 0),
                        allTime: paidOrders
                            .reduce((sum: number, o: Order) => sum + o.total_amount, 0)
                    };
                    setRevenueStats(revenue);

                    // Daily Revenue Chart (Last 7 days)
                    const dailyData: DailyRevenue[] = [];
                    for (let i = 6; i >= 0; i--) {
                        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                        const dateStr = date.toISOString().split('T')[0];
                        const dayOrders = paidOrders.filter((o: Order) =>
                            o.created_at.startsWith(dateStr)
                        );
                        dailyData.push({
                            date: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
                            revenue: dayOrders.reduce((sum: number, o: Order) => sum + o.total_amount, 0),
                            orders: dayOrders.length
                        });
                    }
                    setDailyRevenue(dailyData);

                    // Recent Orders
                    setRecentOrders(ordersData.slice(0, 5));
                }

                // Fetch Top Products
                const { data: orderItems } = await (supabase as any)
                    .from('order_items')
                    .select('product_id, product_title, quantity, price');

                if (orderItems) {
                    const productMap = new Map<string, TopProduct>();
                    orderItems.forEach((item: OrderItem & { price: number }) => {
                        const key = item.product_title;
                        const existing = productMap.get(key);
                        if (existing) {
                            existing.total_sold += item.quantity;
                            existing.revenue += item.quantity * item.price;
                        } else {
                            productMap.set(key, {
                                product_title: item.product_title,
                                total_sold: item.quantity,
                                revenue: item.quantity * item.price
                            });
                        }
                    });
                    const sorted = Array.from(productMap.values())
                        .sort((a, b) => b.total_sold - a.total_sold)
                        .slice(0, 5);
                    setTopProducts(sorted);
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; label: { id: string; en: string } }> = {
            pending: { color: 'bg-amber-100 text-amber-700', label: { id: 'Menunggu', en: 'Pending' } },
            paid: { color: 'bg-green-100 text-green-700', label: { id: 'Dibayar', en: 'Paid' } },
            shipped: { color: 'bg-blue-100 text-blue-700', label: { id: 'Dikirim', en: 'Shipped' } },
            completed: { color: 'bg-emerald-100 text-emerald-700', label: { id: 'Selesai', en: 'Completed' } },
            cancelled: { color: 'bg-red-100 text-red-600', label: { id: 'Dibatalkan', en: 'Cancelled' } }
        };
        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700', label: { id: status, en: status } };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {t(config.label)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm h-28"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Revenue Stats */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <MoneyBag01Icon className="h-6 w-6 text-green-600" />
                    {t({ id: 'Statistik Penjualan', en: 'Sales Statistics' })}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-md text-white">
                        <p className="text-green-100 text-sm font-medium mb-1">{t({ id: 'Pendapatan Hari Ini', en: 'Revenue Today' })}</p>
                        <h3 className="text-2xl font-bold">{formatCurrency(revenueStats.today)}</h3>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-md text-white">
                        <p className="text-blue-100 text-sm font-medium mb-1">{t({ id: 'Minggu Ini', en: 'This Week' })}</p>
                        <h3 className="text-2xl font-bold">{formatCurrency(revenueStats.thisWeek)}</h3>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-md text-white">
                        <p className="text-purple-100 text-sm font-medium mb-1">{t({ id: 'Bulan Ini', en: 'This Month' })}</p>
                        <h3 className="text-2xl font-bold">{formatCurrency(revenueStats.thisMonth)}</h3>
                    </div>
                    <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-2xl shadow-md text-white">
                        <p className="text-slate-300 text-sm font-medium mb-1">{t({ id: 'Total Sepanjang Masa', en: 'All Time' })}</p>
                        <h3 className="text-2xl font-bold">{formatCurrency(revenueStats.allTime)}</h3>
                    </div>
                </div>
            </div>

            {/* Order Status Stats */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ShoppingCart01Icon className="h-6 w-6 text-primary" />
                    {t({ id: 'Status Pesanan', en: 'Order Status' })}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                        <p className="text-3xl font-bold text-slate-800">{orderStats.total}</p>
                        <p className="text-sm text-slate-500">{t({ id: 'Total', en: 'Total' })}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-amber-500 text-center">
                        <p className="text-3xl font-bold text-amber-600">{orderStats.pending}</p>
                        <p className="text-sm text-slate-500">{t({ id: 'Menunggu', en: 'Pending' })}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 text-center">
                        <p className="text-3xl font-bold text-green-600">{orderStats.paid}</p>
                        <p className="text-sm text-slate-500">{t({ id: 'Dibayar', en: 'Paid' })}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 text-center">
                        <p className="text-3xl font-bold text-blue-600">{orderStats.shipped}</p>
                        <p className="text-sm text-slate-500">{t({ id: 'Dikirim', en: 'Shipped' })}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500 text-center">
                        <p className="text-3xl font-bold text-emerald-600">{orderStats.completed}</p>
                        <p className="text-sm text-slate-500">{t({ id: 'Selesai', en: 'Completed' })}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 text-center">
                        <p className="text-3xl font-bold text-red-600">{orderStats.cancelled}</p>
                        <p className="text-sm text-slate-500">{t({ id: 'Batal', en: 'Cancelled' })}</p>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <ChartLineData01Icon className="h-5 w-5 text-primary" />
                        {t({ id: 'Pendapatan 7 Hari Terakhir', en: 'Revenue Last 7 Days' })}
                    </h3>
                    <SalesChart
                        data={dailyRevenue}
                        formatCurrency={formatCurrency}
                        revenueLabel={t({ id: 'Pendapatan', en: 'Revenue' })}
                    />
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <PackageIcon className="h-5 w-5 text-primary" />
                        {t({ id: 'Produk Terlaris', en: 'Top Products' })}
                    </h3>
                    {topProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            {t({ id: 'Belum ada data penjualan.', en: 'No sales data yet.' })}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map((product, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center justify-center">
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800 line-clamp-1">{product.product_title}</p>
                                            <p className="text-xs text-slate-500">{product.total_sold} {t({ id: 'terjual', en: 'sold' })}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-green-600">{formatCurrency(product.revenue)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders & Content Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Time01Icon className="h-5 w-5 text-primary" />
                        {t({ id: 'Pesanan Terbaru', en: 'Recent Orders' })}
                    </h3>
                    {recentOrders.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            {t({ id: 'Belum ada pesanan.', en: 'No orders yet.' })}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs text-slate-500 border-b">
                                        <th className="pb-3 font-medium">{t({ id: 'Order ID', en: 'Order ID' })}</th>
                                        <th className="pb-3 font-medium">{t({ id: 'Customer', en: 'Customer' })}</th>
                                        <th className="pb-3 font-medium">{t({ id: 'Total', en: 'Total' })}</th>
                                        <th className="pb-3 font-medium">{t({ id: 'Status', en: 'Status' })}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b last:border-0">
                                            <td className="py-3 text-sm font-medium text-slate-800">
                                                #{order.id.slice(0, 8).toUpperCase()}
                                            </td>
                                            <td className="py-3 text-sm text-slate-600">{order.shipping_name}</td>
                                            <td className="py-3 text-sm font-semibold text-slate-800">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="py-3">{getStatusBadge(order.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Content Stats */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <News01Icon className="h-5 w-5 text-primary" />
                        {t({ id: 'Konten', en: 'Content' })}
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <PackageIcon className="h-5 w-5 text-blue-600" />
                                <span className="text-sm text-slate-700">{t({ id: 'Produk', en: 'Products' })}</span>
                            </div>
                            <span className="text-lg font-bold text-blue-600">{contentStats.products}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <News01Icon className="h-5 w-5 text-pink-600" />
                                <span className="text-sm text-slate-700">{t({ id: 'Artikel', en: 'Articles' })}</span>
                            </div>
                            <span className="text-lg font-bold text-pink-600">{contentStats.articles}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <UserGroupIcon className="h-5 w-5 text-purple-600" />
                                <span className="text-sm text-slate-700">{t({ id: 'Mitra', en: 'Partners' })}</span>
                            </div>
                            <span className="text-lg font-bold text-purple-600">{contentStats.partners}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Calendar03Icon className="h-5 w-5 text-orange-600" />
                                <span className="text-sm text-slate-700">{t({ id: 'Webinar', en: 'Webinars' })}</span>
                            </div>
                            <span className="text-lg font-bold text-orange-600">{contentStats.webinars}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
