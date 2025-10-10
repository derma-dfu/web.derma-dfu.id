import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Products = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (mounted) {
          setProducts(data || []);
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        if (mounted) {
          toast({
            title: t({ id: 'Error', en: 'Error' }),
            description: error.message,
            variant: 'destructive',
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadProducts();
    
    return () => {
      mounted = false;
    };
  }, [toast, t]);


  const categories = [
    { value: 'all', label: { id: 'Semua Produk', en: 'All Products' } },
    { value: 'dressing', label: { id: 'Pembalut Luka', en: 'Wound Dressings' } },
    { value: 'monitoring', label: { id: 'Monitoring', en: 'Monitoring' } },
    { value: 'consultation', label: { id: 'Konsultasi', en: 'Consultation' } }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleOrderWhatsApp = (productTitle: string) => {
    const message = encodeURIComponent(`Halo, saya tertarik untuk memesan ${productTitle}`);
    const whatsappNumber = '6281234567890'; // Update with actual WhatsApp number
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-secondary">
            {t({ id: 'Produk & Layanan', en: 'Products & Services' })}
          </h1>
          <p className="text-lg text-foreground/80">
            {t({ 
              id: 'Temukan produk dan layanan terbaik untuk perawatan luka diabetes',
              en: 'Find the best products and services for diabetic wound care'
            })}
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-64 min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {t(cat.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-col rounded-2xl shadow-md hover-scale">
              <CardHeader>
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={t({ id: product.title_id, en: product.title_en })} 
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="text-6xl mb-4">🩹</div>
                )}
                <CardTitle className="text-secondary">
                  {t({ id: product.title_id, en: product.title_en })}
                </CardTitle>
                <CardDescription>
                  {t({ id: product.description_id, en: product.description_en })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {product.features_id?.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm">
                      <span className="text-primary">✓</span>
                      <span>{t({ id: feature, en: product.features_en[idx] })}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full min-h-[44px]"
                  onClick={() => handleOrderWhatsApp(t({ id: product.title_id, en: product.title_en }))}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t({ id: 'Pesan Sekarang', en: 'Order Now' })}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Policy Info */}
        <div className="mt-12 p-6 bg-muted/30 rounded-2xl">
          <h3 className="text-xl font-bold mb-4 text-secondary">
            {t({ id: 'Kebijakan Pembelian', en: 'Purchase Policy' })}
          </h3>
          <ul className="space-y-2 text-foreground/80">
            <li>✓ {t({ id: 'Pengiriman gratis untuk pembelian di atas Rp 500.000', en: 'Free shipping for orders above Rp 500,000' })}</li>
            <li>✓ {t({ id: 'Garansi produk 30 hari', en: '30-day product warranty' })}</li>
            <li>✓ {t({ id: 'Konsultasi gratis untuk setiap pembelian', en: 'Free consultation with every purchase' })}</li>
            <li>✓ {t({ id: 'Pembayaran aman dengan berbagai metode', en: 'Secure payment with various methods' })}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Products;
