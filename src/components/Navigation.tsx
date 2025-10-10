import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';
import logoImage from '@/assets/logo-derma-dfu.jpeg';

const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              className="h-12 md:h-14 w-auto object-contain"
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
            
            <Link to="/auth">
              <Button variant="outline" className="min-h-[44px]">
                {t({ id: 'Masuk', en: 'Login' })}
              </Button>
            </Link>
            
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
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full min-h-[44px]">
                {t({ id: 'Masuk', en: 'Login' })}
              </Button>
            </Link>
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
