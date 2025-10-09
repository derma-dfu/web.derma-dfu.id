import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Products = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: { id: 'Semua Produk', en: 'All Products' } },
    { value: 'dressing', label: { id: 'Pembalut Luka', en: 'Wound Dressings' } },
    { value: 'monitoring', label: { id: 'Monitoring', en: 'Monitoring' } },
    { value: 'consultation', label: { id: 'Konsultasi', en: 'Consultation' } }
  ];

  const products = [
    {
      id: 1,
      category: 'dressing',
      title: { id: 'Pembalut Hidrokoloid Premium', en: 'Premium Hydrocolloid Dressing' },
      description: { 
        id: 'Pembalut canggih dengan teknologi penyerapan superior untuk luka diabetes',
        en: 'Advanced dressing with superior absorption technology for diabetic wounds'
      },
      price: 'Rp 250.000',
      image: '🩹',
      features: [
        { id: 'Penyerapan optimal', en: 'Optimal absorption' },
        { id: 'Melindungi dari infeksi', en: 'Infection protection' },
        { id: 'Mudah digunakan', en: 'Easy to use' }
      ]
    },
    {
      id: 2,
      category: 'monitoring',
      title: { id: 'Sistem Monitoring Digital', en: 'Digital Monitoring System' },
      description: { 
        id: 'Pantau perkembangan luka dengan aplikasi mobile terintegrasi',
        en: 'Track wound progress with integrated mobile app'
      },
      price: 'Rp 1.500.000',
      image: '📱',
      features: [
        { id: 'Tracking real-time', en: 'Real-time tracking' },
        { id: 'Laporan lengkap', en: 'Comprehensive reports' },
        { id: 'Notifikasi otomatis', en: 'Automatic notifications' }
      ]
    },
    {
      id: 3,
      category: 'consultation',
      title: { id: 'Paket Konsultasi Profesional', en: 'Professional Consultation Package' },
      description: { 
        id: 'Konsultasi online dengan spesialis perawatan luka bersertifikat',
        en: 'Online consultation with certified wound care specialists'
      },
      price: 'Rp 500.000',
      image: '👨‍⚕️',
      features: [
        { id: 'Konsultasi 30 menit', en: '30-minute consultation' },
        { id: 'Rekomendasi perawatan', en: 'Care recommendations' },
        { id: 'Follow-up gratis', en: 'Free follow-up' }
      ]
    },
    {
      id: 4,
      category: 'dressing',
      title: { id: 'Pembalut Foam Antibakteri', en: 'Antibacterial Foam Dressing' },
      description: { 
        id: 'Pembalut foam dengan perlindungan antibakteri untuk luka yang terinfeksi',
        en: 'Foam dressing with antibacterial protection for infected wounds'
      },
      price: 'Rp 350.000',
      image: '🧴',
      features: [
        { id: 'Antibakteri aktif', en: 'Active antibacterial' },
        { id: 'Nyaman dipakai', en: 'Comfortable wear' },
        { id: 'Tahan air', en: 'Waterproof' }
      ]
    }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleAddToCart = (productTitle: { id: string; en: string }) => {
    toast({
      title: t({ id: 'Ditambahkan ke Keranjang', en: 'Added to Cart' }),
      description: `${t(productTitle)} ${t({ id: 'telah ditambahkan', en: 'has been added' })}`,
    });
  };

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
                <div className="text-6xl mb-4">{product.image}</div>
                <CardTitle className="text-secondary">{t(product.title)}</CardTitle>
                <CardDescription>{t(product.description)}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm">
                      <span className="text-primary">✓</span>
                      <span>{t(feature)}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-2xl font-bold text-primary mt-4">{product.price}</p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full min-h-[44px]"
                  onClick={() => handleAddToCart(product.title)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {t({ id: 'Tambah ke Keranjang', en: 'Add to Cart' })}
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
