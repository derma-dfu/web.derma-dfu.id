"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import {
    PackageIcon,
    News01Icon,
    UserGroupIcon,
    Calendar03Icon
} from 'hugeicons-react';

export const DashboardOverview = () => {
    const { t } = useLanguage();
    const [stats, setStats] = useState({
        products: 0,
        articles: 0,
        partners: 0,
        webinars: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Counts
                const [productsCount, articlesCount, partnersCount, webinarsCount] = await Promise.all([
                    supabase.from('products').select('*', { count: 'exact', head: true }),
                    supabase.from('articles').select('*', { count: 'exact', head: true }),
                    supabase.from('partners').select('*', { count: 'exact', head: true }),
                    supabase.from('webinars').select('*', { count: 'exact', head: true })
                ]);

                setStats({
                    products: productsCount.count || 0,
                    articles: articlesCount.count || 0,
                    partners: partnersCount.count || 0,
                    webinars: webinarsCount.count || 0
                });

                // Fetch Recent Activity
                const [recentProducts, recentArticles, recentPartners, recentWebinars] = await Promise.all([
                    supabase.from('products').select('id, title_en, created_at').order('created_at', { ascending: false }).limit(3),
                    supabase.from('articles').select('id, title_en, created_at').order('created_at', { ascending: false }).limit(3),
                    supabase.from('partners').select('id, name, created_at').order('created_at', { ascending: false }).limit(3),
                    supabase.from('webinars').select('id, title, created_at').order('created_at', { ascending: false }).limit(3)
                ]);

                const activities = [
                    ...(recentProducts.data || []).map(i => ({ ...i, type: 'product', label: i.title_en })),
                    ...(recentArticles.data || []).map(i => ({ ...i, type: 'article', label: i.title_en })),
                    ...(recentPartners.data || []).map(i => ({ ...i, type: 'partner', label: i.name })),
                    ...(recentWebinars.data || []).map(i => ({ ...i, type: 'webinar', label: i.title }))
                ].sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
                    .slice(0, 5);

                setRecentActivity(activities);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const statItems = [
        {
            label: { id: 'Total Produk', en: 'Total Products' },
            value: stats.products,
            color: 'bg-blue-500',
            icon: PackageIcon
        },
        {
            label: { id: 'Artikel Terbit', en: 'Published Articles' },
            value: stats.articles,
            color: 'bg-pink-500',
            icon: News01Icon
        },
        {
            label: { id: 'Mitra Aktif', en: 'Active Partners' },
            value: stats.partners,
            color: 'bg-purple-500',
            icon: UserGroupIcon
        },
        {
            label: { id: 'Total Webinar', en: 'Total Webinars' },
            value: stats.webinars,
            color: 'bg-orange-500',
            icon: Calendar03Icon
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center h-32 animate-pulse">
                        <div className="h-8 w-24 bg-slate-100 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">
                {t({ id: 'Ringkasan Data', en: 'Data Overview' })}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statItems.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-1">{t(stat.label)}</p>
                            <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                            <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Statistics Chart Placeholder */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[300px] flex flex-col items-center justify-center text-slate-400">
                    <div className="bg-slate-50 p-8 rounded-full mb-4">
                        <Calendar03Icon className="h-10 w-10 text-slate-300" />
                    </div>
                    <p>{t({ id: 'Grafik Statistik (Segera Hadir)', en: 'Statistics Chart (Coming Soon)' })}</p>
                </div>

                {/* Activity Log */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-slate-800 mb-4">
                        {t({ id: 'Aktivitas Terbaru', en: 'Recent Activity' })}
                    </h3>
                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                {t({ id: 'Belum ada aktivitas.', en: 'No recent activity.' })}
                            </p>
                        ) : (
                            recentActivity.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                                    <div className={`mt-1 h-2 w-2 rounded-full ${item.type === 'product' ? 'bg-blue-500' :
                                        item.type === 'article' ? 'bg-pink-500' :
                                            item.type === 'partner' ? 'bg-purple-500' : 'bg-orange-500'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.label}</p>
                                        <p className="text-xs text-slate-500">
                                            {item.type === 'product' && t({ id: 'Produk Baru', en: 'New Product' })}
                                            {item.type === 'article' && t({ id: 'Artikel Baru', en: 'New Article' })}
                                            {item.type === 'partner' && t({ id: 'Mitra Baru', en: 'New Partner' })}
                                            {item.type === 'webinar' && t({ id: 'Webinar Baru', en: 'New Webinar' })}
                                            {' • '}
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
