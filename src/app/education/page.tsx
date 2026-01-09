"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    BookOpen01Icon,
    Loading03Icon,
    LibraryIcon,
    Mortarboard01Icon
} from 'hugeicons-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Education = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadArticles = async () => {
            try {
                const { data, error } = await supabase
                    .from('articles')
                    .select('*')
                    .eq('is_published', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (mounted) {
                    setArticles((data as any[]) || []);
                }
            } catch (error: any) {
                console.error('Error fetching articles:', error);
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

        loadArticles();

        return () => {
            mounted = false;
        };
    }, [t, toast]);


    const categories = [
        { value: 'all', label: { id: 'Semua', en: 'All' } },
        { value: 'wound_care', label: { id: 'Perawatan Luka', en: 'Wound Care' } },
        { value: 'treatment', label: { id: 'Perawatan', en: 'Treatment' } },
        { value: 'prevention', label: { id: 'Pencegahan', en: 'Prevention' } },
        { value: 'lifestyle', label: { id: 'Gaya Hidup', en: 'Lifestyle' } }
    ];

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
                <div className="text-center mb-16 max-w-3xl mx-auto animate-fade-in">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        {t({ id: 'Pusat Pengetahuan', en: 'Knowledge Hub' })}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-secondary tracking-tight">
                        {t({ id: 'Edukasi Kesehatan', en: 'Health Education' })}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        {t({
                            id: 'Pelajari wawasan terbaru tentang perawatan luka diabetes dari dokter dan ahli medis terpercaya.',
                            en: 'Learn the latest insights on diabetic wound care from trusted doctors and medical experts.'
                        })}
                    </p>
                </div>

                {/* Category Tabs */}
                <Tabs defaultValue="all" className="mb-12">
                    <div className="flex justify-center mb-10 overflow-x-auto pb-4 md:pb-0">
                        <TabsList className="inline-flex h-auto p-1 bg-muted/50 rounded-full gap-2">
                            {categories.map((cat) => (
                                <TabsTrigger
                                    key={cat.value}
                                    value={cat.value}
                                    className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-sm font-medium whitespace-nowrap"
                                >
                                    {t(cat.label)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {categories.map((cat) => (
                        <TabsContent key={cat.value} value={cat.value} className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {(cat.value === 'all'
                                    ? articles
                                    : articles.filter(a => a.category === cat.value)
                                ).map((article) => (
                                    <Card
                                        key={article.id}
                                        className="group rounded-3xl border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm cursor-pointer flex flex-col h-full"
                                    >
                                        <div className="relative h-56 overflow-hidden bg-muted/20">
                                            {article.image_url ? (
                                                <img
                                                    src={article.image_url}
                                                    alt={t({ id: article.title_id, en: article.title_en })}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                    <BookOpen01Icon className="h-12 w-12 text-gray-300" />
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent">
                                                <div className="flex items-center space-x-2 text-white/90">
                                                    <div className="bg-primary/90 p-1 rounded-full">
                                                        <BookOpen01Icon className="h-3 w-3 text-white" />
                                                    </div>
                                                    <span className="text-xs font-semibold uppercase tracking-wider">{article.category.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <CardHeader className="pb-3 px-6 pt-6">
                                            <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                                                {t({ id: article.title_id, en: article.title_en })}
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="px-6 pb-6 flex-grow">
                                            <CardDescription className="text-base line-clamp-3 leading-relaxed">
                                                {article.excerpt_id
                                                    ? t({ id: article.excerpt_id, en: article.excerpt_en })
                                                    : t({ id: article.content_id, en: article.content_en }).substring(0, 150) + '...'}
                                            </CardDescription>
                                            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
                                                <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                                <span className="group-hover:translate-x-1 transition-transform text-primary font-medium flex items-center">
                                                    {t({ id: 'Baca Lebih Lanjut', en: 'Read More' })} &rarr;
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {(cat.value === 'all' && articles.length === 0) && (
                                <div className="text-center py-20 bg-muted/20 rounded-3xl">
                                    <BookOpen01Icon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="text-muted-foreground text-lg font-medium">{t({ id: 'Belum ada artikel', en: 'No articles yet' })}</p>
                                    <p className="text-sm text-muted-foreground/70">{t({ id: 'Silakan cek kembali nanti', en: 'Please check back later' })}</p>
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>

                {/* Featured Section */}
                <div className="mt-20 relative rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-700 to-sky-600 z-0" />
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 z-0" />

                    <div className="relative z-10 p-8 md:p-12 text-white">
                        <h2 className="text-3xl font-bold mb-8 text-center md:text-left">
                            {t({ id: 'Materi Belajar Unggulan', en: 'Featured Learning Materials' })}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-all cursor-pointer group">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                        <LibraryIcon className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary-foreground transition-colors">
                                            {t({ id: 'Panduan Lengkap DFU', en: 'Complete DFU Guide' })}
                                        </h3>
                                        <p className="text-white/80 leading-relaxed mb-4">
                                            {t({
                                                id: 'E-book komprehensif tentang penanganan Diabetic Foot Ulcer dari tingkat dasar hingga lanjut.',
                                                en: 'Comprehensive e-book on Diabetic Foot Ulcer management from basic to advanced levels.'
                                            })}
                                        </p>
                                        <span className="text-sm font-semibold text-primary-foreground/90 group-hover:translate-x-1 inline-flex items-center transition-transform">
                                            {t({ id: 'Unduh E-Book', en: 'Download E-Book' })} &rarr;
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-all cursor-pointer group">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                        <Mortarboard01Icon className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary-foreground transition-colors">
                                            {t({ id: 'Webinar & Workshop', en: 'Webinar & Workshop' })}
                                        </h3>
                                        <p className="text-white/80 leading-relaxed mb-4">
                                            {t({
                                                id: 'Daftar untuk sesi webinar bulanan dan workshop langsung bersama para ahli medis top.',
                                                en: 'Register for monthly webinars and live workshops with top medical experts.'
                                            })}
                                        </p>
                                        <span className="text-sm font-semibold text-primary-foreground/90 group-hover:translate-x-1 inline-flex items-center transition-transform">
                                            {t({ id: 'Lihat Jadwal', en: 'View Schedule' })} &rarr;
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Education;
