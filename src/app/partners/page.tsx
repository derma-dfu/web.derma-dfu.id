"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Building02Icon,
    Mail01Icon,
    CallIcon,
    File01Icon,
    CheckmarkCircle02Icon,
    ChartBarLineIcon,
    Download01Icon,
    Loading03Icon
} from 'hugeicons-react';
import { supabase } from '@/integrations/supabase/client';
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

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('partner_submissions')
                .insert([
                    {
                        company_name: formData.companyName,
                        contact_person: formData.contactPerson,
                        email: formData.email,
                        phone: formData.phone,
                        message: formData.description
                    }
                ]);

            if (error) throw error;

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
        } catch (error: any) {
            console.error('Submission error:', error);
            toast({
                title: t({ id: 'Gagal Mengirim', en: 'Submission Failed' }),
                description: t({
                    id: 'Terjadi kesalahan. Silakan coba lagi.',
                    en: 'An error occurred. Please try again.'
                }),
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const benefits = [
        {
            icon: <Building02Icon className="h-6 w-6 text-primary" />,
            title: { id: 'Platform Terintegrasi', en: 'Integrated Platform' },
            description: {
                id: 'Akses ke sistem manajemen dan pemesanan terintegrasi',
                en: 'Access to integrated management and ordering system'
            }
        },
        {
            icon: <CheckmarkCircle02Icon className="h-6 w-6 text-primary" />,
            title: { id: 'Dukungan Pemasaran', en: 'Marketing Support' },
            description: {
                id: 'Promosi produk dan layanan Anda ke seluruh jaringan',
                en: 'Promote your products and services across the network'
            }
        },
        {
            icon: <File01Icon className="h-6 w-6 text-primary" />,
            title: { id: 'Pelatihan & Sertifikasi', en: 'Training & Certification' },
            description: {
                id: 'Program pelatihan berkelanjutan dan sertifikasi',
                en: 'Continuous training programs and certification'
            }
        }
    ];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-br from-primary/5 to-transparent -z-10" />

            <div className="container mx-auto px-4 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16 max-w-3xl mx-auto animate-fade-in">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        {t({ id: 'Kolaborasi', en: 'Collaboration' })}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-secondary tracking-tight">
                        {t({ id: 'Kemitraan DERMA-DFU.ID', en: 'DERMA-DFU.ID Partnership' })}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        {t({
                            id: 'Bergabunglah dengan jaringan profesional kesehatan terbesar di Indonesia dan tingkatkan layanan Anda.',
                            en: 'Join the largest healthcare professional network in Indonesia and elevate your services.'
                        })}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Left Column: Benefits & Partners */}
                    <div className="space-y-12">
                        {/* Benefits Grid */}
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-secondary">
                                {t({ id: 'Benefit Mitra', en: 'Partner Benefits' })}
                            </h2>
                            <div className="grid gap-6">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-md transition-all">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-4">
                                            {benefit.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-secondary mb-1">{t(benefit.title)}</h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed">{t(benefit.description)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Partner Materials */}
                        <Card className="rounded-2xl shadow-sm border-border/50 bg-gradient-to-br from-white to-muted/20">
                            <CardHeader>
                                <CardTitle className="text-xl text-secondary flex items-center gap-2">
                                    <Download01Icon className="h-5 w-5 text-primary" />
                                    {t({ id: 'Materi Mitra', en: 'Partner Materials' })}
                                </CardTitle>
                                <CardDescription>
                                    {t({
                                        id: 'Unduh dokumen panduan lengkap untuk mempelajari lebih lanjut.',
                                        en: 'Download complete guide documents to learn more.'
                                    })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all group">
                                    <File01Icon className="h-5 w-5 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <div className="text-left">
                                        <p className="font-medium text-sm">{t({ id: 'Panduan Kemitraan.pdf', en: 'Partnership Guide.pdf' })}</p>
                                        <p className="text-xs text-muted-foreground group-hover:text-primary/70">{t({ id: 'Klik untuk unduh', en: 'Click to download' })}</p>
                                    </div>
                                </Button>
                                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all group">
                                    <ChartBarLineIcon className="h-5 w-5 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <div className="text-left">
                                        <p className="font-medium text-sm">{t({ id: 'Presentasi Program.pptx', en: 'Program Presentation.pptx' })}</p>
                                        <p className="text-xs text-muted-foreground group-hover:text-primary/70">{t({ id: 'Klik untuk unduh', en: 'Click to download' })}</p>
                                    </div>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Registration Form */}
                    <div className="lg:sticky lg:top-8">
                        <Card className="rounded-3xl shadow-xl border-t-4 border-t-primary overflow-hidden">
                            <div className="bg-primary/5 p-6 border-b border-border/50">
                                <CardTitle className="text-2xl text-secondary mb-2">
                                    {t({ id: 'Daftar Sekarang', en: 'Register Now' })}
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {t({
                                        id: 'Mulai perjalanan sukses Anda bersama kami.',
                                        en: 'Start your successful journey with us.'
                                    })}
                                </CardDescription>
                            </div>
                            <CardContent className="p-6 md:p-8">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName" className="text-sm font-medium">
                                            {t({ id: 'Nama Perusahaan / Instansi', en: 'Company / Institution Name' })}
                                        </Label>
                                        <Input
                                            id="companyName"
                                            placeholder={t({ id: 'Contoh: Klinik Sehat Sentosa', en: 'Ex: Klinik Sehat Sentosa' })}
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            required
                                            className="h-11 rounded-lg focus-visible:ring-primary"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contactPerson" className="text-sm font-medium">
                                            {t({ id: 'Nama Lengkap', en: 'Full Name' })}
                                        </Label>
                                        <Input
                                            id="contactPerson"
                                            placeholder={t({ id: 'Nama Penanggung Jawab', en: 'Person in Charge Name' })}
                                            value={formData.contactPerson}
                                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                            required
                                            className="h-11 rounded-lg focus-visible:ring-primary"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium">
                                                {t({ id: 'Email', en: 'Email' })}
                                            </Label>
                                            <div className="relative">
                                                <Mail01Icon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="email@example.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                    className="pl-10 h-11 rounded-lg focus-visible:ring-primary"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-sm font-medium">
                                                {t({ id: 'No. WhatsApp', en: 'WhatsApp No.' })}
                                            </Label>
                                            <div className="relative">
                                                <CallIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="0812..."
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    required
                                                    className="pl-10 h-11 rounded-lg focus-visible:ring-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-medium">
                                            {t({ id: 'Pesan / Tujuan Kemitraan', en: 'Message / Partnership Goal' })}
                                        </Label>
                                        <Textarea
                                            id="description"
                                            placeholder={t({
                                                id: 'Jelaskan profil singkat bisnis Anda dan tujuan bermitra dengan kami...',
                                                en: 'Describe your business profile briefly and your partnership goals...'
                                            })}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required
                                            className="min-h-[120px] rounded-lg focus-visible:ring-primary resize-none"
                                        />
                                    </div>

                                    <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/50 transition-all hover:scale-[1.01]">
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <Loading03Icon className="h-5 w-5 animate-spin" />
                                                <span>{t({ id: 'Mengirim...', en: 'Sending...' })}</span>
                                            </div>
                                        ) : (
                                            t({ id: 'Kirim Pengajuan', en: 'Submit Application' })
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Partner Logos Section */}
                <div className="mt-20 py-12 border-t border-border/40">
                    <h2 className="text-2xl font-bold text-center mb-10 text-secondary">
                        {t({ id: 'Dipercaya Oleh', en: 'Trusted By' })}
                    </h2>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-center">
                        {partnerLogos.map((partner, index) => (
                            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-border/50 hover:border-primary/20 hover:shadow-md transition-all w-40 h-24 flex items-center justify-center">
                                <img
                                    src={partner.logo.src}
                                    alt={partner.name}
                                    className="max-h-16 w-auto object-contain transition-all duration-300 transform hover:scale-105"
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
