"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Loading03Icon,
    Search01Icon,
    FilterIcon,
    ViewIcon,
    Tick02Icon,
    Time01Icon,
    DeliveryTruck01Icon,
    Cancel01Icon,
    ArrowLeft02Icon,
    ArrowRight02Icon,
    PackageIcon
} from 'hugeicons-react';

interface OrderItem {
    product_title: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    created_at: string;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    order_items: OrderItem[];
}

type StatusFilter = 'all' | 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

const ITEMS_PER_PAGE = 10;

export const OrderManagement = () => {
    const { t } = useLanguage();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            // Fetch orders
            const { data: ordersData, error } = await (supabase as any)
                .from('orders')
                .select('id, user_id, total_amount, status, created_at, shipping_name, shipping_phone, shipping_address')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch order items
            if (ordersData && ordersData.length > 0) {
                const orderIds = ordersData.map((o: Order) => o.id);
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
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        setUpdatingStatus(orderId);
        try {
            const { error } = await (supabase as any)
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            // Update local state
            setOrders(prev =>
                prev.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );

            // Update selected order if open
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Filter and search
    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesSearch = searchQuery === '' ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.shipping_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.shipping_phone.includes(searchQuery);
        return matchesStatus && matchesSearch;
    });

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const configs: Record<string, { color: string; icon: any; label: { id: string; en: string } }> = {
            pending: { color: 'bg-amber-100 text-amber-700', icon: Time01Icon, label: { id: 'Menunggu', en: 'Pending' } },
            paid: { color: 'bg-green-100 text-green-700', icon: Tick02Icon, label: { id: 'Dibayar', en: 'Paid' } },
            shipped: { color: 'bg-blue-100 text-blue-700', icon: DeliveryTruck01Icon, label: { id: 'Dikirim', en: 'Shipped' } },
            completed: { color: 'bg-emerald-100 text-emerald-700', icon: Tick02Icon, label: { id: 'Selesai', en: 'Completed' } },
            cancelled: { color: 'bg-red-100 text-red-600', icon: Cancel01Icon, label: { id: 'Dibatalkan', en: 'Cancelled' } }
        };
        const config = configs[status] || { color: 'bg-gray-100 text-gray-700', icon: Time01Icon, label: { id: status, en: status } };
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3" />
                {t(config.label)}
            </span>
        );
    };

    const getNextStatus = (currentStatus: string): string | null => {
        const flow: Record<string, string> = {
            pending: 'paid',
            paid: 'shipped',
            shipped: 'completed'
        };
        return flow[currentStatus] || null;
    };

    const statusOptions = [
        { value: 'all', label: { id: 'Semua Status', en: 'All Status' } },
        { value: 'pending', label: { id: 'Menunggu', en: 'Pending' } },
        { value: 'paid', label: { id: 'Dibayar', en: 'Paid' } },
        { value: 'shipped', label: { id: 'Dikirim', en: 'Shipped' } },
        { value: 'completed', label: { id: 'Selesai', en: 'Completed' } },
        { value: 'cancelled', label: { id: 'Dibatalkan', en: 'Cancelled' } }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loading03Icon className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder={t({ id: 'Cari order ID, nama, atau telepon...', en: 'Search order ID, name, or phone...' })}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select
                        value={statusFilter}
                        onValueChange={(value: StatusFilter) => {
                            setStatusFilter(value);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full md:w-48">
                            <FilterIcon className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {t(option.label)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-16">
                        <PackageIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">
                            {t({ id: 'Tidak ada pesanan ditemukan', en: 'No orders found' })}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                                            {t({ id: 'Order ID', en: 'Order ID' })}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                                            {t({ id: 'Customer', en: 'Customer' })}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                                            {t({ id: 'Total', en: 'Total' })}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                                            {t({ id: 'Status', en: 'Status' })}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                                            {t({ id: 'Tanggal', en: 'Date' })}
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                                            {t({ id: 'Aksi', en: 'Actions' })}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedOrders.map((order) => (
                                        <tr key={order.id} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-sm font-medium text-slate-800">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">{order.shipping_name}</p>
                                                    <p className="text-xs text-slate-500">{order.shipping_phone}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-semibold text-slate-800">
                                                    {formatCurrency(order.total_amount)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600">
                                                    {formatDate(order.created_at)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setIsDetailOpen(true);
                                                        }}
                                                    >
                                                        <ViewIcon className="h-4 w-4" />
                                                    </Button>
                                                    {getNextStatus(order.status) && (
                                                        <Button
                                                            size="sm"
                                                            disabled={updatingStatus === order.id}
                                                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                                                        >
                                                            {updatingStatus === order.id ? (
                                                                <Loading03Icon className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    {order.status === 'pending' && t({ id: 'Konfirmasi', en: 'Confirm' })}
                                                                    {order.status === 'paid' && t({ id: 'Kirim', en: 'Ship' })}
                                                                    {order.status === 'shipped' && t({ id: 'Selesai', en: 'Complete' })}
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
                                <p className="text-sm text-slate-600">
                                    {t({ id: `Menampilkan ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} dari ${filteredOrders.length}`, en: `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of ${filteredOrders.length}` })}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                    >
                                        <ArrowLeft02Icon className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-slate-600">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                    >
                                        <ArrowRight02Icon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Order Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PackageIcon className="h-5 w-5 text-primary" />
                            {t({ id: 'Detail Pesanan', en: 'Order Details' })}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-4">
                            {/* Order Info */}
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-mono text-lg font-bold text-slate-800">
                                            #{selectedOrder.id.slice(0, 8).toUpperCase()}
                                        </p>
                                        <p className="text-sm text-slate-500">{formatDate(selectedOrder.created_at)}</p>
                                    </div>
                                    {getStatusBadge(selectedOrder.status)}
                                </div>
                                <p className="text-xl font-bold text-primary">
                                    {formatCurrency(selectedOrder.total_amount)}
                                </p>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2">
                                    {t({ id: 'Informasi Pelanggan', en: 'Customer Information' })}
                                </h4>
                                <div className="bg-blue-50 p-4 rounded-xl space-y-1 text-sm">
                                    <p><span className="text-slate-500">{t({ id: 'Nama:', en: 'Name:' })}</span> {selectedOrder.shipping_name}</p>
                                    <p><span className="text-slate-500">{t({ id: 'Telepon:', en: 'Phone:' })}</span> {selectedOrder.shipping_phone}</p>
                                    <p><span className="text-slate-500">{t({ id: 'Alamat:', en: 'Address:' })}</span> {selectedOrder.shipping_address}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2">
                                    {t({ id: 'Produk', en: 'Products' })}
                                </h4>
                                <div className="space-y-2">
                                    {selectedOrder.order_items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                            <div>
                                                <p className="font-medium text-slate-800">{item.product_title}</p>
                                                <p className="text-sm text-slate-500">
                                                    {item.quantity}x @ {formatCurrency(item.price)}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-slate-800">
                                                {formatCurrency(item.quantity * item.price)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status Update */}
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2">
                                    {t({ id: 'Update Status', en: 'Update Status' })}
                                </h4>
                                <Select
                                    value={selectedOrder.status}
                                    onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                                    disabled={updatingStatus === selectedOrder.id}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.filter(o => o.value !== 'all').map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {t(option.label)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
