import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import logoImage from '@/assets/logo-derma-dfu.png';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: t({ id: 'Berhasil keluar', en: 'Logged out successfully' }),
        description: t({ id: 'Anda telah keluar dari akun', en: 'You have been logged out' }),
      });
      navigate('/');
    } catch (error) {
      toast({
        title: t({ id: 'Gagal keluar', en: 'Logout failed' }),
        description: t({ id: 'Terjadi kesalahan', en: 'An error occurred' }),
        variant: 'destructive',
      });
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
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoImage} 
              alt="DERMA-DFU.ID" 
              className="h-16 md:h-20 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-foreground hover:text-primary font-medium"
              >
                {t(link.label)}
              </Link>
            ))}
            
            {!isAuthenticated ? (
              <Link to="/auth">
                <Button variant="outline" className="min-h-[44px]">
                  {t({ id: 'Masuk', en: 'Login' })}
                </Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-h-[44px]">
                    <User className="h-4 w-4 mr-2" />
                    {user?.email?.split('@')[0] || t({ id: 'Akun', en: 'Account' })}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    {t({ id: 'Dashboard', en: 'Dashboard' })}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t({ id: 'Keluar', en: 'Logout' })}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="min-h-[44px] min-w-[44px]"
              aria-label="Toggle language"
            >
              <Globe className="h-5 w-5" />
              <span className="ml-1 text-sm font-medium">{language.toUpperCase()}</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden min-h-[44px] min-w-[44px]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 text-foreground hover:text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(link.label)}
              </Link>
            ))}
            
            {!isAuthenticated ? (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full min-h-[44px]">
                  {t({ id: 'Masuk', en: 'Login' })}
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full min-h-[44px] justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/dashboard');
                  }}
                >
                  <User className="h-5 w-5 mr-2" />
                  {user?.email?.split('@')[0] || t({ id: 'Akun', en: 'Account' })}
                </Button>
                <Button
                  variant="outline"
                  className="w-full min-h-[44px] justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  {t({ id: 'Keluar', en: 'Logout' })}
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="w-full min-h-[44px] justify-start"
            >
              <Globe className="h-5 w-5 mr-2" />
              {t({ id: 'Bahasa: Indonesia', en: 'Language: English' })}
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
