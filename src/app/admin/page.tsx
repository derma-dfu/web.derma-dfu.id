"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Loading03Icon,
    PackageIcon,
    News01Icon,
    UserGroupIcon,
    DashboardSquare01Icon,
    Logout03Icon,
    UserCircleIcon,
    Menu01Icon,
    Calendar03Icon,
    ShoppingBasket01Icon
} from 'hugeicons-react';
import { supabase } from '@/integrations/supabase/client';
import { ProductManagement } from '@/components/admin/ProductManagement';
import { ArticleManagement } from '@/components/admin/ArticleManagement';
import { PartnerManagement } from '@/components/admin/PartnerManagement';
import { WebinarManagement } from '@/components/admin/WebinarManagement';
import { DoctorManagement } from '@/components/admin/DoctorManagement';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { OrderManagement } from '@/components/admin/OrderManagement';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

const Admin = () => {
    const { t } = useLanguage();
    const { isAdmin, isLoading } = useUserRole();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, isLoading, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const handleMenuClick = (menuId: string) => {
        setActiveTab(menuId);
        setMobileMenuOpen(false); // Close mobile menu after navigation
    };

    if (!mounted) return null;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loading03Icon className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdmin) return null;

    const MENU_ITEMS = [
        { id: 'dashboard', label: { id: 'Dashboard', en: 'Dashboard' }, icon: DashboardSquare01Icon },
        { id: 'orders', label: { id: 'Pesanan', en: 'Orders' }, icon: ShoppingBasket01Icon },
        { id: 'products', label: { id: 'Produk', en: 'Products' }, icon: PackageIcon },
        { id: 'articles', label: { id: 'Artikel', en: 'Articles' }, icon: News01Icon },
        { id: 'webinars', label: { id: 'Webinar', en: 'Webinars' }, icon: Calendar03Icon },
        { id: 'doctors', label: { id: 'Tim Medis', en: 'Medical Team' }, icon: UserCircleIcon },
        { id: 'partners', label: { id: 'Mitra', en: 'Partners' }, icon: UserGroupIcon },
    ];

    // Get current page title for mobile header
    const currentItem = MENU_ITEMS.find(i => i.id === activeTab);
    const currentTitle = currentItem ? t(currentItem.label) : 'Admin';

    // Shared sidebar content component
    const SidebarContent = ({ onItemClick }: { onItemClick?: (id: string) => void }) => (
        <>
            <div className="px-6 mb-8">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    {t({ id: 'Manajemen', en: 'Management' })}
                </h2>
                <div className="space-y-2">
                    {MENU_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onItemClick ? onItemClick(item.id) : setActiveTab(item.id)}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-primary/10 text-primary shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {t(item.label)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 mt-auto space-y-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                    <Logout03Icon className="mr-3 h-5 w-5" />
                    {t({ id: 'Keluar', en: 'Logout' })}
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <Menu01Icon className="h-6 w-6 text-slate-700" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0 pt-10">
                        <SheetTitle className="sr-only">
                            {t({ id: 'Menu Navigasi', en: 'Navigation Menu' })}
                        </SheetTitle>
                        <SidebarContent onItemClick={handleMenuClick} />
                    </SheetContent>
                </Sheet>

                <h1 className="font-semibold text-lg text-slate-900">{currentTitle}</h1>

                <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                    <Logout03Icon className="h-5 w-5" />
                </button>
            </header>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 fixed h-full pt-10 pb-10 overflow-y-auto z-50">
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-10 transition-all">
                <div className="max-w-7xl mx-auto">
                    {/* Dynamic Header - Hidden on mobile since we have the sticky header */}
                    <div className="mb-6 lg:mb-8 hidden lg:block">
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            {(() => {
                                const ItemIcon = MENU_ITEMS.find(i => i.id === activeTab)?.icon || DashboardSquare01Icon;
                                return <ItemIcon className="h-7 w-7 lg:h-8 lg:w-8 text-primary" />;
                            })()}
                            {currentTitle}
                        </h1>
                        {activeTab === 'dashboard' && (
                            <p className="text-slate-500 mt-2 ml-10 lg:ml-11">
                                {t({ id: 'Selamat datang kembali, Admin.', en: 'Welcome back, Admin.' })}
                            </p>
                        )}
                    </div>

                    {/* Mobile Header for Dashboard welcome message */}
                    {activeTab === 'dashboard' && (
                        <p className="text-slate-500 mb-4 lg:hidden text-sm">
                            {t({ id: 'Selamat datang kembali, Admin.', en: 'Welcome back, Admin.' })}
                        </p>
                    )}

                    {/* Dynamic Content Area */}
                    {activeTab === 'dashboard' ? (
                        <DashboardOverview />
                    ) : (
                        <div className="min-h-[400px] lg:min-h-[500px]">
                            {activeTab === 'orders' && <OrderManagement />}
                            {activeTab === 'products' && <ProductManagement />}
                            {activeTab === 'articles' && <ArticleManagement />}
                            {activeTab === 'partners' && <PartnerManagement />}
                            {activeTab === 'webinars' && <WebinarManagement />}
                            {activeTab === 'doctors' && <DoctorManagement />}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Admin;
