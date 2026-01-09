"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Delete02Icon,
    ShoppingCart01Icon,
    CreditCardIcon,
    SecurityCheckIcon,
    Loading03Icon,
    Location01Icon,
    Image01Icon,
    PlusSignIcon,
    MinusSignIcon
} from 'hugeicons-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
    id: string;
    product_id: string;
    title: { id: string; en: string };
    price: number;
    quantity: number;
    image_url?: string;
}

const Cart = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Cart items - loaded from localStorage
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Shipping form
    const [shippingForm, setShippingForm] = useState({
        name: '',
        phone: '',
        address: '',
        notes: ''
    });

    const [showShippingForm, setShowShippingForm] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);

        // Load cart items from localStorage
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            try {
                const items = JSON.parse(savedCart);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCartItems(items);
            } catch (e) {
                console.error('Failed to parse cart items', e);
            }
        }

        // Check user session
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUser(session.user);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setShippingForm(prev => ({
                    ...prev,
                    name: session.user.user_metadata?.name || '',
                }));
            }
        };

        checkUser();
    }, []);

    const removeItem = (id: string) => {
        const newCart = cartItems.filter(item => item.id !== id);
        setCartItems(newCart);
        localStorage.setItem('cartItems', JSON.stringify(newCart));
        toast({
            title: t({ id: 'Item Dihapus', en: 'Item Removed' }),
            description: t({ id: 'Produk telah dihapus dari keranjang', en: 'Product has been removed from cart' }),
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        const newCart = cartItems.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCartItems(newCart);
        localStorage.setItem('cartItems', JSON.stringify(newCart));
    };

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleProceedToCheckout = () => {
        if (!user) {
            toast({
                title: t({ id: 'Login Diperlukan', en: 'Login Required' }),
                description: t({ id: 'Silakan login terlebih dahulu untuk melanjutkan pembayaran', en: 'Please login first to continue with payment' }),
                variant: 'destructive'
            });
            router.push('/auth');
            return;
        }
        setShowShippingForm(true);
    };

    const handleCheckout = async () => {
        // Validate shipping form
        if (!shippingForm.name || !shippingForm.phone || !shippingForm.address) {
            toast({
                title: t({ id: 'Lengkapi Data Pengiriman', en: 'Complete Shipping Info' }),
                description: t({ id: 'Nama, nomor telepon, dan alamat wajib diisi', en: 'Name, phone number, and address are required' }),
                variant: 'destructive'
            });
            return;
        }

        setLoading(true);

        try {
            // Get session token
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast({
                    title: t({ id: 'Sesi Berakhir', en: 'Session Expired' }),
                    description: t({ id: 'Silakan login kembali', en: 'Please login again' }),
                    variant: 'destructive'
                });
                router.push('/auth');
                return;
            }

            // Call create invoice API
            const response = await fetch('/api/payments/create-product-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    items: cartItems.map(item => ({
                        product_id: item.product_id || item.id,
                        quantity: item.quantity
                    })),
                    shipping_name: shippingForm.name,
                    shipping_phone: shippingForm.phone,
                    shipping_address: shippingForm.address,
                    notes: shippingForm.notes
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create invoice');
            }

            // Redirect to Xendit payment page
            if (data.invoice_url) {
                window.location.href = data.invoice_url;
            } else {
                throw new Error('No invoice URL received');
            }

        } catch (error: any) {
            console.error('Checkout error:', error);
            toast({
                title: t({ id: 'Checkout Gagal', en: 'Checkout Failed' }),
                description: error.message || t({ id: 'Terjadi kesalahan saat proses checkout', en: 'An error occurred during checkout' }),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-secondary">
                    {t({ id: 'Keranjang Belanja', en: 'Shopping Cart' })}
                </h1>

                {cartItems.length === 0 ? (
                    <Card className="rounded-2xl shadow-md text-center py-12">
                        <CardContent>
                            <ShoppingCart01Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-xl text-foreground/80 mb-4">
                                {t({ id: 'Keranjang Anda kosong', en: 'Your cart is empty' })}
                            </p>
                            <Button onClick={() => router.push('/products')} className="min-h-[44px]">
                                {t({ id: 'Mulai Belanja', en: 'Start Shopping' })}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <Card key={item.id} className="rounded-2xl shadow-md overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="flex">
                                            {/* Product Image */}
                                            <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-muted/20">
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={t(item.title)}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                                        <Image01Icon className="h-8 w-8 text-primary/40" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm sm:text-base text-secondary truncate">
                                                            {t(item.title)}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                                            Rp {item.price.toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeItem(item.id)}
                                                        className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 flex-shrink-0"
                                                    >
                                                        <Delete02Icon className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {/* Quantity Controls & Total */}
                                                <div className="flex justify-between items-center mt-2">
                                                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="h-7 w-7 rounded-md"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <MinusSignIcon className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-8 text-center text-sm font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="h-7 w-7 rounded-md"
                                                        >
                                                            <PlusSignIcon className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-base sm:text-lg font-bold text-primary">
                                                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Shipping Form */}
                            {showShippingForm && (
                                <Card className="rounded-2xl shadow-md border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="text-secondary flex items-center gap-2">
                                            <Location01Icon className="h-5 w-5" />
                                            {t({ id: 'Alamat Pengiriman', en: 'Shipping Address' })}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>{t({ id: 'Nama Penerima', en: 'Recipient Name' })} *</Label>
                                            <Input
                                                value={shippingForm.name}
                                                onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                                                placeholder={t({ id: 'Masukkan nama penerima', en: 'Enter recipient name' })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>{t({ id: 'Nomor Telepon', en: 'Phone Number' })} *</Label>
                                            <Input
                                                type="tel"
                                                value={shippingForm.phone}
                                                onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                                                placeholder="+628xxxxxxxxxx"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>{t({ id: 'Alamat Lengkap', en: 'Full Address' })} *</Label>
                                            <Textarea
                                                value={shippingForm.address}
                                                onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                                                placeholder={t({ id: 'Masukkan alamat lengkap termasuk kode pos', en: 'Enter full address including postal code' })}
                                                rows={3}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>{t({ id: 'Catatan (opsional)', en: 'Notes (optional)' })}</Label>
                                            <Input
                                                value={shippingForm.notes}
                                                onChange={(e) => setShippingForm({ ...shippingForm, notes: e.target.value })}
                                                placeholder={t({ id: 'Catatan untuk kurir', en: 'Notes for courier' })}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <Card className="rounded-2xl shadow-md sticky top-4">
                                <CardHeader>
                                    <CardTitle className="text-secondary">
                                        {t({ id: 'Ringkasan Pesanan', en: 'Order Summary' })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>{t({ id: 'Subtotal', en: 'Subtotal' })}</span>
                                            <span>Rp {total.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t({ id: 'Pengiriman', en: 'Shipping' })}</span>
                                            <span>{t({ id: 'Gratis', en: 'Free' })}</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                            <span>{t({ id: 'Total', en: 'Total' })}</span>
                                            <span className="text-primary">Rp {total.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>

                                    {!showShippingForm ? (
                                        <Button
                                            onClick={handleProceedToCheckout}
                                            className="w-full min-h-[44px] text-sm font-medium bg-cta hover:bg-cta/90"
                                        >
                                            {t({ id: 'Lanjutkan ke Pembayaran', en: 'Proceed to Payment' })}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleCheckout}
                                            disabled={loading}
                                            className="w-full min-h-[44px] text-sm font-medium bg-primary hover:bg-primary/90"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loading03Icon className="mr-2 h-4 w-4 animate-spin" />
                                                    {t({ id: 'Memproses...', en: 'Processing...' })}
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCardIcon className="mr-2 h-4 w-4" />
                                                    {t({ id: 'Bayar Sekarang', en: 'Pay Now' })}
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    <div className="text-xs text-muted-foreground space-y-2">
                                        <div className="flex items-center gap-2">
                                            <CreditCardIcon className="h-4 w-4" />
                                            <span>{t({ id: 'Powered by Xendit', en: 'Powered by Xendit' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <SecurityCheckIcon className="h-4 w-4" />
                                            <span>{t({ id: 'Pembayaran aman & terenkripsi', en: 'Secure & encrypted payment' })}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
