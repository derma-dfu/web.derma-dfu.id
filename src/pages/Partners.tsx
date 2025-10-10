import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, Mail, Phone, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import kemenkesLogo from '@/assets/partners/kemenkes.png';
import risetaMedicaLogo from '@/assets/partners/riseta-medica.png';
import metadermaLogo from '@/assets/partners/metaderma.png';
import docprenLogo from '@/assets/partners/docpren.png';

const Partners = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    description: ''
  });

  const partnerLogos = [
    { name: 'Kemenkes', logo: kemenkesLogo },
    { name: 'Riseta Medica Inovasia', logo: risetaMedicaLogo },
    { name: 'Metaderma', logo: metadermaLogo },
    { name: 'Docpren', logo: docprenLogo },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t({ id: 'Pendaftaran Berhasil!', en: 'Registration Successful!' }),
      description: t({ 
        id: 'Tim kami akan menghubungi Anda segera',
        en: 'Our team will contact you shortly'
      }),
    });
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      description: ''
    });
  };

  const benefits = [
    {
      icon: <Building2 className="h-8 w-8 text-primary" />,
      title: { id: 'Platform Terintegrasi', en: 'Integrated Platform' },
      description: { 
        id: 'Akses ke sistem manajemen dan pemesanan terintegrasi',
        en: 'Access to integrated management and ordering system'
      }
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: { id: 'Dukungan Pemasaran', en: 'Marketing Support' },
      description: { 
        id: 'Promosi produk dan layanan Anda ke seluruh jaringan',
        en: 'Promote your products and services across the network'
      }
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: { id: 'Pelatihan & Sertifikasi', en: 'Training & Certification' },
      description: { 
        id: 'Program pelatihan berkelanjutan dan sertifikasi',
        en: 'Continuous training programs and certification'
      }
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-secondary">
            {t({ id: 'Kemitraan DERMA-DFU.ID', en: 'DERMA-DFU.ID Partnership' })}
          </h1>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            {t({ 
              id: 'Bergabunglah dengan jaringan profesional kesehatan terbesar di Indonesia',
              en: 'Join the largest healthcare professional network in Indonesia'
            })}
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center rounded-2xl shadow-md hover-scale">
              <CardHeader>
                <div className="flex justify-center mb-4">{benefit.icon}</div>
                <CardTitle className="text-secondary">{t(benefit.title)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{t(benefit.description)}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Registration Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary">
                {t({ id: 'Daftar Sebagai Mitra', en: 'Register as Partner' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  id: 'Lengkapi formulir di bawah ini untuk memulai kemitraan',
                  en: 'Complete the form below to start partnership'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    {t({ id: 'Nama Perusahaan', en: 'Company Name' })}
                  </Label>
                  <Input
                    id="companyName"
                    placeholder={t({ id: 'PT. Contoh Perusahaan', en: 'PT. Example Company' })}
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                    className="min-h-[44px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">
                    {t({ id: 'Nama Kontak Person', en: 'Contact Person Name' })}
                  </Label>
                  <Input
                    id="contactPerson"
                    placeholder={t({ id: 'John Doe', en: 'John Doe' })}
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                    className="min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {t({ id: 'Email', en: 'Email' })}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@perusahaan.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="pl-10 min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {t({ id: 'Telepon', en: 'Phone' })}
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+62 812 3456 7890"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="pl-10 min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    {t({ id: 'Deskripsi Bisnis', en: 'Business Description' })}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={t({ 
                      id: 'Ceritakan tentang bisnis Anda...',
                      en: 'Tell us about your business...'
                    })}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full min-h-[48px] text-lg">
                  {t({ id: 'Kirim Pendaftaran', en: 'Submit Registration' })}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Partner Materials */}
          <Card className="mt-8 rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="text-secondary">
                {t({ id: 'Materi Mitra', en: 'Partner Materials' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  id: 'Download materi pendukung untuk mitra',
                  en: 'Download support materials for partners'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <p className="font-medium">📄 {t({ id: 'Panduan Kemitraan', en: 'Partnership Guide' })}</p>
                <p className="text-sm text-muted-foreground">
                  {t({ id: '📥 Unggah PDF di sini', en: '📥 Upload PDF here' })}
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <p className="font-medium">📊 {t({ id: 'Presentasi Program', en: 'Program Presentation' })}</p>
                <p className="text-sm text-muted-foreground">
                  {t({ id: '📥 Unggah file di sini', en: '📥 Upload file here' })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partner Logos Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-secondary">
            {t({ id: 'Mitra Kami', en: 'Our Partners' })}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {partnerLogos.map((partner, index) => (
              <div key={index} className="bg-card rounded-2xl p-4 flex items-center justify-center hover-scale shadow-md">
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className="h-28 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;
