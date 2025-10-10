import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import hydroDressing from '@/assets/products/hydrocolloid-dressing.jpg';
import digitalMonitoring from '@/assets/products/digital-monitoring.jpg';
import consultation from '@/assets/products/consultation-service.jpg';
import foamDressing from '@/assets/products/foam-dressing.jpg';

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
  }, []);


  const categories = [
    { value: 'all', label: { id: 'Semua Produk', en: 'All Products' } },
    { value: 'dressing', label: { id: 'Pembalut Luka', en: 'Wound Dressings' } },
    { value: 'monitoring', label: { id: 'Monitoring', en: 'Monitoring' } },
    { value: 'consultation', label: { id: 'Konsultasi', en: 'Consultation' } }
  ];

  // Map product images based on title
  const getProductImage = (titleId: string) => {
    const imageMap: Record<string, string> = {
      'Pembalut Hidrokoloid Premium': hydroDressing,
      'Sistem Monitoring Digital': digitalMonitoring,
      'Paket Konsultasi Profesional': consultation,
      'Pembalut Foam Antibakteri': foamDressing,
    };
    return imageMap[titleId] || null;
  };

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
    <div className="min-h-screen py-12 px-4 bg-background">
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
              <div className="p-6">
                {product.image_url || getProductImage(product.title_id) ? (
                  <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                    <img 
                      src={product.image_url || getProductImage(product.title_id)} 
                      alt={t({ id: product.title_id, en: product.title_en })} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-6xl mb-4 text-center">🩹</div>
                )}
                <h3 className="text-secondary text-xl font-semibold min-h-[56px] flex items-center mb-2">
                  {t({ id: product.title_id, en: product.title_en })}
                </h3>
                <p className="text-muted-foreground text-sm min-h-[60px] mb-4">
                  {t({ id: product.description_id, en: product.description_en })}
                </p>
                <ul className="space-y-2 mb-6 flex-grow">
                  {product.features_id?.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2 text-sm">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{t({ id: feature, en: product.features_en[idx] })}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full min-h-[44px]"
                  onClick={() => handleOrderWhatsApp(t({ id: product.title_id, en: product.title_en }))}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t({ id: 'Pesan Sekarang', en: 'Order Now' })}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Policy Info */}
        <div className="mt-12 p-6 bg-background rounded-2xl border border-border">
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
