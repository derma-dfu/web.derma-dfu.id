"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Globe02Icon,
  Menu01Icon,
  Cancel01Icon,
  Logout03Icon,
  UserIcon,
  Loading03Icon
} from 'hugeicons-react';
import { useState } from 'react';
// Using logo from public folder
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { forceLogout } from '@/utils/forceLogout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const authState = useUserRole();
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();

  if (pathname?.startsWith('/auth') || pathname?.startsWith('/admin')) return null;

  const { isAuthenticated, user, isLoading } = authState;

  const handleLogout = async () => {
    console.log('Logout button clicked');
    setMobileMenuOpen(false);

    try {
      console.log('Signing out...');

      // Logout from Supabase
      await supabase.auth.signOut();

      console.log('Sign out complete, reloading...');
      window.location.href = '/';
    } catch (error: any) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const navLinks = [
    {
      path: '/',
      label: { id: 'Beranda', en: 'Home' }
    },
    {
      path: '/products',
      label: { id: 'Produk & Layanan', en: 'Products & Services' }
    },
    {
      path: '/partners',
      label: { id: 'Mitra', en: 'Partners' }
    },
    {
      path: '/education',
      label: { id: 'Edukasi', en: 'Education' }
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <img
            src="/logo/logo-derma-dfu-panjang.png"
            alt="DERMA-DFU.ID"
            className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {!pathname?.startsWith('/admin') ? (
            navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="relative text-gray-600 hover:text-primary font-medium transition-colors group py-2"
              >
                {t(link.label)}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left ease-out duration-200" />
              </Link>
            ))
          ) : (
            <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium border border-slate-200">
              Admin Console
            </div>
          )}

          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle language"
            >
              <Globe02Icon className="h-5 w-5 text-gray-600" />
              <span className="sr-only">{language.toUpperCase()}</span>
            </Button>

            {isLoading ? (
              <Button variant="outline" className="rounded-full px-6" disabled>
                <Loading03Icon className="mr-2 h-4 w-4 animate-spin" />
              </Button>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full pl-2 pr-4 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <span className="max-w-[100px] truncate text-gray-700">
                      {user?.email?.split('@')[0] || t({ id: 'Akun', en: 'Account' })}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-gray-100 animate-in fade-in-0 zoom-in-95">
                  <DropdownMenuItem onClick={() => router.push('/dashboard')} className="rounded-lg cursor-pointer py-2.5">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-blue-600">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <span>{t({ id: 'Dashboard', en: 'Dashboard' })}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                    className="rounded-lg cursor-pointer py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50"
                  >
                    <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center mr-3 text-red-600">
                      <Logout03Icon className="h-4 w-4" />
                    </div>
                    <span>{t({ id: 'Keluar', en: 'Logout' })}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="rounded-full px-8 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all bg-primary hover:bg-primary/90 text-white">
                  {t({ id: 'Masuk / Daftar', en: 'Sign In / Register' })}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <Cancel01Icon className="h-6 w-6" /> : <Menu01Icon className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl animate-in slide-in-from-top-5">
          <div className="p-4 space-y-4">
            {!pathname?.startsWith('/admin') && navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="block p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(link.label)}
              </Link>
            ))}
            <div className="h-px bg-gray-100 my-2" />

            <div className="flex items-center justify-between p-3">
              <span className="text-sm font-medium text-gray-500">{t({ id: 'Bahasa', en: 'Language' })}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                className="rounded-full bg-gray-100"
              >
                <Globe02Icon className="h-4 w-4 mr-2" />
                {language.toUpperCase()}
              </Button>
            </div>

            {isLoading ? (
              <Button variant="outline" className="w-full rounded-xl" disabled>Loading...</Button>
            ) : isAuthenticated ? (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl h-12"
                  onClick={() => { setMobileMenuOpen(false); router.push('/dashboard'); }}
                >
                  <UserIcon className="h-5 w-5 mr-3 text-primary" />
                  {user?.email?.split('@')[0]}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl h-12 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                >
                  <Logout03Icon className="h-5 w-5 mr-3" />
                  {t({ id: 'Keluar', en: 'Logout' })}
                </Button>
              </div>
            ) : (
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-xl h-12 shadow-lg shadow-primary/20">{t({ id: 'Masuk', en: 'Login' })}</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
