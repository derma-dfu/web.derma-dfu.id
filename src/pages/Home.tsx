import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, CheckCircle, Heart, Shield, Users } from 'lucide-react';
import heroImage from '@/assets/hero-nurse-patient.png';

const Home = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: { id: 'Triase Cepat', en: 'Quick Triage' },
      description: { 
        id: 'Sistem triase berbasis AI untuk penilaian cepat kondisi luka',
        en: 'AI-powered triage system for quick wound assessment'
      }
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: { id: 'Perawatan Terintegrasi', en: 'Integrated Care' },
      description: { 
        id: 'Akses ke produk dan layanan perawatan luka terpadu',
        en: 'Access to comprehensive wound care products and services'
      }
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: { id: 'Dukungan Profesional', en: 'Professional Support' },
      description: { 
        id: 'Konsultasi dengan tenaga medis profesional',
        en: 'Consultation with professional medical staff'
      }
    }
  ];

  const products = [
    {
      title: { id: 'Pembalut Luka Canggih', en: 'Advanced Wound Dressings' },
      description: { 
        id: 'Pembalut khusus untuk luka diabetes dengan teknologi penyembuhan modern',
        en: 'Specialized dressings for diabetic wounds with modern healing technology'
      },
      image: '🩹'
    },
    {
      title: { id: 'Sistem Monitoring', en: 'Monitoring System' },
      description: { 
        id: 'Pantau perkembangan luka dengan teknologi digital',
        en: 'Track wound progress with digital technology'
      },
      image: '📊'
    },
    {
      title: { id: 'Konsultasi Online', en: 'Online Consultation' },
      description: { 
        id: 'Konsultasi jarak jauh dengan spesialis perawatan luka',
        en: 'Remote consultation with wound care specialists'
      },
      image: '💬'
    }
  ];

  const benefits = [
    { id: 'Akses ke pasar yang lebih luas', en: 'Access to wider market' },
    { id: 'Dukungan pemasaran & edukasi', en: 'Marketing & educational support' },
    { id: 'Platform digital terintegrasi', en: 'Integrated digital platform' },
    { id: 'Jaringan profesional kesehatan', en: 'Healthcare professional network' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden min-h-[700px] flex items-center bg-gradient-to-b from-background to-muted/30">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background from-30% via-background/80 via-45% to-background/10" />
        </div>

        {/* Content */}
        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-secondary leading-tight">
              {t({ 
                id: 'Solusi Terpadu',
                en: 'Comprehensive'
              })}
              <br />
              {t({ 
                id: 'Perawatan Luka Diabetes',
                en: 'Diabetic Wound Care Solution'
              })}
            </h1>
            <p className="text-base md:text-lg mb-8 leading-relaxed font-medium" style={{ color: '#cda6d4' }}>
              {t({ 
                id: 'Platform inovatif yang menghubungkan',
                en: 'Innovative platform connecting'
              })}
              <br />
              {t({ 
                id: 'pasien, mitra, dan profesional kesehatan',
                en: 'patients, partners, and healthcare professionals'
              })}
            </p>
            <a href="https://derma-dfu.id/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="min-h-[56px] text-lg px-10 bg-cta hover:bg-cta/90 shadow-lg">
                {t({ id: 'Coba Triase Sekarang', en: 'Try Triage Now' })}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-secondary">
            {t({ id: 'Cara Kerja', en: 'How It Works' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="text-center hover-scale rounded-2xl shadow-md">
                <CardHeader>
                  <div className="flex justify-center mb-4">{step.icon}</div>
                  <CardTitle className="text-secondary">{t(step.title)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{t(step.description)}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Catalog Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold text-secondary">
              {t({ id: 'Produk & Layanan', en: 'Products & Services' })}
            </h2>
            <Link to="/products">
              <Button variant="outline" className="min-h-[44px]">
                {t({ id: 'Lihat Semua', en: 'View All' })}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <Card key={index} className="hover-scale rounded-2xl shadow-md flex flex-col">
                <CardHeader>
                  <div className="text-6xl mb-4">{product.image}</div>
                  <CardTitle className="text-secondary">{t(product.title)}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <CardDescription className="text-base flex-grow">{t(product.description)}</CardDescription>
                  <Link to="/products">
                    <Button className="mt-4 w-full min-h-[44px]">
                      {t({ id: 'Pelajari Lebih Lanjut', en: 'Learn More' })}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-secondary">
                {t({ id: 'Bergabung Sebagai Mitra', en: 'Join as a Partner' })}
              </h2>
              <p className="text-lg text-foreground/80 mb-6">
                {t({ 
                  id: 'Kembangkan bisnis kesehatan Anda bersama platform kami',
                  en: 'Grow your healthcare business with our platform'
                })}
              </p>
              <ul className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{t(benefit)}</span>
                  </li>
                ))}
              </ul>
              <Link to="/partners">
                <Button size="lg" className="min-h-[48px] bg-primary hover:bg-primary/90">
                  {t({ id: 'Daftar Sebagai Mitra', en: 'Register as Partner' })}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 shadow-lg">
                <div className="text-6xl mb-4">🤝</div>
                <h3 className="text-2xl font-bold mb-2 text-secondary">
                  {t({ id: 'Mitra Terpercaya', en: 'Trusted Partners' })}
                </h3>
                <p className="text-foreground/70">
                  {t({ 
                    id: 'Bergabung dengan jaringan profesional kesehatan di seluruh Indonesia',
                    en: 'Join the network of healthcare professionals across Indonesia'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-secondary">
            {t({ id: 'Pusat Edukasi', en: 'Education Center' })}
          </h2>
          <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
            {t({ 
              id: 'Akses informasi dan panduan lengkap tentang perawatan luka diabetes',
              en: 'Access comprehensive information and guides on diabetic wound care'
            })}
          </p>
          <Link to="/education">
            <Button variant="outline" size="lg" className="min-h-[48px]">
              {t({ id: 'Jelajahi Edukasi', en: 'Explore Education' })}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
