import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, CheckCircle, Heart, Shield, Users, Calendar, Clock, Video, ExternalLink } from 'lucide-react';
import heroImage from '@/assets/hero-nurse-patient-new.png';
import webinarPoster from '@/assets/webinar-dfu-poster.jpg';

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
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight" style={{ color: '#7ab8dc' }}>
                {t({ 
                  id: 'Solusi Terpadu',
                  en: 'Comprehensive'
                })}
                <br />
                {t({ 
                  id: 'Perawatan Luka Diabetes',
                  en: 'Diabetic Wound Care'
                })}
              </h1>
              <p className="text-base md:text-lg mb-8 leading-relaxed font-medium" style={{ color: '#d9738e' }}>
                {t({ 
                  id: 'Platform inovatif yang menghubungkan pasien, mitra, dan profesional kesehatan',
                  en: 'Innovative platform connecting patients, partners, and healthcare professionals'
                })}
              </p>
              <a href="https://derma-dfu.id/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="min-h-[56px] text-lg px-10 bg-cta hover:bg-cta/90 shadow-lg">
                  {t({ id: 'Coba Triase Sekarang', en: 'Try Triage Now' })}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>

            {/* Right Column - Image */}
            <div className="animate-fade-in">
              <img 
                src={heroImage} 
                alt="Nurse with patient" 
                className="w-full h-auto scale-110"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Webinar Promotion Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto">
          <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Poster Image */}
              <div className="relative">
                <img 
                  src={webinarPoster} 
                  alt="Webinar Diabetic Foot Ulcer" 
                  className="w-full h-full object-cover min-h-[300px]"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-cta text-cta-foreground px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg">
                    GRATIS
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8 flex flex-col justify-center">
                <div className="mb-4">
                  <span className="text-primary font-semibold text-sm uppercase tracking-wide">
                    ✨ Webinar Gratis
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-secondary mb-4 leading-tight">
                  Inovasi Terkini Penanganan Diabetic Foot Ulcer (DFU)
                </h3>
                <p className="text-foreground/70 mb-6 text-sm leading-relaxed">
                  Webinar ini bertujuan memberikan pemahaman terbaru tentang pencegahan luka kaki diabetik, 
                  deteksi dini DFU, inovasi terbaru dalam penanganan luka & teknologi kesehatan, 
                  serta pendekatan klinis oleh para dokter spesialis.
                </p>
                
                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-foreground/80">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Kamis, 11 Desember 2025</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/80">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>13.00 – 16.00 WIB</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/80">
                    <Video className="h-4 w-4 text-primary" />
                    <span>Via Zoom</span>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-foreground/60 mb-2 font-medium">Narasumber:</p>
                  <ul className="text-sm text-foreground/80 space-y-1">
                    <li>• dr. Andrew Suprayogi, Sp.PD., M.M., FINASIM</li>
                    <li>• Dr. dr. Reza Y Purwoko, Sp.DVE., FINSDV., FAADV</li>
                  </ul>
                  <p className="text-xs text-foreground/60 mt-2">Moderator: dr. Sonia Wibisono</p>
                </div>
                
                <a 
                  href="https://bit.ly/PendaftaranWebinarDFU" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button size="lg" className="min-h-[52px] text-base px-8 bg-cta hover:bg-cta/90 shadow-lg group">
                    Daftar Sekarang
                    <ExternalLink className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              </div>
            </div>
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
