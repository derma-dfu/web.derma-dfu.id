import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Cart = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: { id: 'Pembalut Hidrokoloid Premium', en: 'Premium Hydrocolloid Dressing' },
      price: 250000,
      quantity: 2
    },
    {
      id: 2,
      title: { id: 'Pembalut Foam Antibakteri', en: 'Antibacterial Foam Dressing' },
      price: 350000,
      quantity: 1
    }
  ]);

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    toast({
      title: t({ id: 'Item Dihapus', en: 'Item Removed' }),
      description: t({ id: 'Produk telah dihapus dari keranjang', en: 'Product has been removed from cart' }),
    });
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    toast({
      title: t({ id: 'Checkout', en: 'Checkout' }),
      description: t({ 
        id: 'Gateway pembayaran (Midtrans/Xendit) akan diintegrasikan di sini',
        en: 'Payment gateway (Midtrans/Xendit) will be integrated here'
      }),
    });
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-secondary">
          {t({ id: 'Keranjang Belanja', en: 'Shopping Cart' })}
        </h1>

        {cartItems.length === 0 ? (
          <Card className="rounded-2xl shadow-md text-center py-12">
            <CardContent>
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-foreground/80 mb-4">
                {t({ id: 'Keranjang Anda kosong', en: 'Your cart is empty' })}
              </p>
              <Button onClick={() => window.location.href = '/products'} className="min-h-[44px]">
                {t({ id: 'Mulai Belanja', en: 'Start Shopping' })}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-secondary mb-2">
                          {t(item.title)}
                        </h3>
                        <p className="text-foreground/70">
                          {t({ id: 'Jumlah', en: 'Quantity' })}: {item.quantity}
                        </p>
                        <p className="text-xl font-bold text-primary mt-2">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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

                  <Button onClick={handleCheckout} className="w-full min-h-[48px] text-lg bg-cta hover:bg-cta/90">
                    {t({ id: 'Lanjutkan ke Pembayaran', en: 'Proceed to Payment' })}
                  </Button>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>💳 {t({ id: 'Gateway: Midtrans / Xendit', en: 'Gateway: Midtrans / Xendit' })}</p>
                    <p>🔒 {t({ id: 'Pembayaran aman & terenkripsi', en: 'Secure & encrypted payment' })}</p>
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
