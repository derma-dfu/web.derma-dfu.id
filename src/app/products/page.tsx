"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    ShoppingCart01Icon,
    Loading03Icon,
    BandageIcon, // For bandaid emoji
    Tick02Icon   // For checkmark
} from 'hugeicons-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import hydroDressing from '@/assets/products/hydrocolloid-dressing.jpg';
import digitalMonitoring from '@/assets/products/digital-monitoring.jpg';
import consultation from '@/assets/products/consultation-service.jpg';
import foamDressing from '@/assets/products/foam-dressing.jpg';
import sepatuCtev from '@/assets/products/sepatu-ctev.png';

const Products = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [products, setProducts] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    }, []); // eslint-disable-next-line react-hooks/exhaustive-deps


    const categories = [
        { value: 'all', label: { id: 'Semua', en: 'All' } },
        { value: 'dressing', label: { id: 'Pembalut Luka', en: 'Wound Dressings' } },
        { value: 'monitoring', label: { id: 'Monitoring', en: 'Monitoring' } },
        { value: 'consultation', label: { id: 'Konsultasi', en: 'Consultation' } }
    ];

    // Map product images based on title
    const getProductImage = (titleId: string) => {
        const imageMap: Record<string, any> = {
            'Pembalut Hidrokoloid Premium': hydroDressing,
            'Sistem Monitoring Digital': digitalMonitoring,
            'Paket Konsultasi Profesional': consultation,
            'Pembalut Foam Antibakteri': foamDressing,
            'Sepatu CTEV': sepatuCtev,
        };
        return imageMap[titleId] || null;
    };

    const getFilteredProducts = (category: string) => {
        return category === 'all'
            ? products
            : products.filter(p => p.category === category);
    };

    const handleAddToCart = (product: any) => {
        // Store product in localStorage for cart
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');

        // Check if product already in cart
        const existingIndex = cartItems.findIndex((item: any) => item.product_id === product.id);

        if (existingIndex >= 0) {
            cartItems[existingIndex].quantity += 1;
        } else {
            // Get image URL - from database or from static assets
            let imageUrl = product.image_url;
            if (!imageUrl) {
                const staticImage = getProductImage(product.title_id);
                // StaticImageData.src is a string path like /_next/static/media/...
                imageUrl = staticImage?.src || null;
            }

            cartItems.push({
                id: crypto.randomUUID(),
                product_id: product.id,
                title: { id: product.title_id, en: product.title_en },
                price: product.price,
                quantity: 1,
                image_url: imageUrl
            });
        }

        localStorage.setItem('cartItems', JSON.stringify(cartItems));

        toast({
            title: t({ id: 'Ditambahkan ke Keranjang', en: 'Added to Cart' }),
            description: t({ id: product.title_id, en: product.title_en }),
        });

        // Redirect to cart
        router.push('/cart');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loading03Icon className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10" />

            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        {t({ id: 'Solusi Terpercaya', en: 'Trusted Solutions' })}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-secondary tracking-tight">
                        {t({ id: 'Produk & Layanan Kesehatan', en: 'Health Products & Services' })}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        {t({
                            id: 'Temukan berbagai solusi perawatan luka diabetes modern dengan standar medis internasional.',
                            en: 'Discover various modern diabetic wound care solutions with international medical standards.'
                        })}
                    </p>
                </div>

                {/* Filter Tabs */}
                <Tabs defaultValue="all" className="mb-12" onValueChange={setSelectedCategory}>
                    <div className="flex justify-center mb-10">
                        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/50 rounded-full gap-2">
                            {categories.map((cat) => (
                                <TabsTrigger
                                    key={cat.value}
                                    value={cat.value}
                                    className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-sm font-medium"
                                >
                                    {t(cat.label)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <TabsContent value={selectedCategory} className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {getFilteredProducts(selectedCategory).map((product) => (
                                <Card key={product.id} className="group flex flex-col rounded-3xl border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm">
                                    <div className="relative h-64 overflow-hidden bg-muted/20">
                                        {product.image_url || getProductImage(product.title_id) ? (
                                            <img
                                                src={product.image_url || getProductImage(product.title_id)?.src}
                                                alt={t({ id: product.title_id, en: product.title_en })}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BandageIcon className="h-20 w-20 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4">
                                            <Badge variant="secondary" className="backdrop-blur-md bg-white/90 hover:bg-white text-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider shadow-sm">
                                                {product.category}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                            {t({ id: product.title_id, en: product.title_en })}
                                        </h3>
                                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow leading-relaxed">
                                            {t({ id: product.description_id, en: product.description_en })}
                                        </p>

                                        {/* Price Display */}
                                        {product.price > 0 && (
                                            <div className="mb-4">
                                                <span className="text-2xl font-bold text-primary">
                                                    Rp {product.price.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        )}

                                        <div className="space-y-3 mb-6">
                                            {product.features_id?.slice(0, 3).map((feature: string, idx: number) => (
                                                <div key={idx} className="flex items-start space-x-3 text-sm text-gray-600">
                                                    <div className="mt-0.5 min-w-[16px] flex justify-center">
                                                        <Tick02Icon className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span>{t({ id: feature, en: product.features_en[idx] })}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            className="w-full rounded-xl h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                                            onClick={() => handleAddToCart(product)}
                                        >
                                            <ShoppingCart01Icon className="mr-2 h-5 w-5" />
                                            {t({ id: 'Tambah ke Keranjang', en: 'Add to Cart' })}
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        {getFilteredProducts(selectedCategory).length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-muted-foreground text-lg">{t({ id: 'Tidak ada produk ditemukan', en: 'No products found' })}</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Policy Info */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { icon: <Tick02Icon className="h-6 w-6 text-primary" />, text: { id: 'Pengiriman Gratis > 500rb', en: 'Free Shipping > 500k' }, sub: { id: 'Seluruh Indonesia', en: 'All Indonesia' } },
                        { icon: <Tick02Icon className="h-6 w-6 text-primary" />, text: { id: 'Garansi 30 Hari', en: '30 Days Warranty' }, sub: { id: 'Jaminan kepuasan', en: 'Satisfaction guaranteed' } },
                        { icon: <Tick02Icon className="h-6 w-6 text-primary" />, text: { id: 'Konsultasi Gratis', en: 'Free Consultation' }, sub: { id: 'Dengan ahli medis', en: 'With medical experts' } },
                        { icon: <Tick02Icon className="h-6 w-6 text-primary" />, text: { id: 'Pembayaran Aman', en: 'Secure Payment' }, sub: { id: 'Berbagai metode', en: 'Various methods' } },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 transition-colors">
                            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm text-primary">
                                {item.icon}
                            </div>
                            <div>
                                <h4 className="font-semibold text-secondary text-sm">{t(item.text)}</h4>
                                <p className="text-xs text-muted-foreground">{t(item.sub)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Products;
