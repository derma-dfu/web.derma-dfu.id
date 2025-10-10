import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin } from 'lucide-react';
import logoImage from '@/assets/logo-derma-dfu.png';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-secondary text-secondary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <img 
              src={logoImage} 
              alt="DERMA-DFU.ID" 
              className="h-12 w-auto object-contain mb-4"
            />
            <p className="text-secondary-foreground/80 mb-4">
              {t({ 
                id: 'Platform inovatif untuk penanganan luka diabetes di Indonesia',
                en: 'Innovative platform for diabetic wound care in Indonesia'
              })}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-secondary-foreground">
              {t({ id: 'Tautan Cepat', en: 'Quick Links' })}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-secondary-foreground/80 hover:text-primary">
                  {t({ id: 'Produk & Layanan', en: 'Products & Services' })}
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-secondary-foreground/80 hover:text-primary">
                  {t({ id: 'Menjadi Mitra', en: 'Become a Partner' })}
                </Link>
              </li>
              <li>
                <Link to="/education" className="text-secondary-foreground/80 hover:text-primary">
                  {t({ id: 'Pusat Edukasi', en: 'Education Center' })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-4 text-secondary-foreground">
              {t({ id: 'Hubungi Kami', en: 'Contact Us' })}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-secondary-foreground/80">
                <Mail className="h-4 w-4" />
                <span>info@derma-dfu.id</span>
              </li>
              <li className="flex items-center space-x-2 text-secondary-foreground/80">
                <Phone className="h-4 w-4" />
                <span>+62 21 1234 5678</span>
              </li>
              <li className="flex items-center space-x-2 text-secondary-foreground/80">
                <MapPin className="h-4 w-4" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-secondary-foreground/80 text-sm">
            © 2025 DERMA-DFU.ID. {t({ id: 'Hak Cipta Dilindungi', en: 'All Rights Reserved' })}.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-secondary-foreground/80 hover:text-primary text-sm">
              {t({ id: 'Kebijakan Privasi', en: 'Privacy Policy' })}
            </Link>
            <Link to="/terms" className="text-secondary-foreground/80 hover:text-primary text-sm">
              {t({ id: 'Syarat & Ketentuan', en: 'Terms & Conditions' })}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
