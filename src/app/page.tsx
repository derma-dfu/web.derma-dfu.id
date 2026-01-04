"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    ArrowRight01Icon,
    Tick02Icon,
    FavouriteIcon,
    ShieldBlockchainIcon,
    UserMultiple02Icon,
    Calendar03Icon,
    Clock01Icon,
    VideoReplayIcon,
    LinkSquare02Icon,
    ChartHistogramIcon,
    Message02Icon,
    MedicalMaskIcon,
    Clapping01Icon,
    SparklesIcon
} from "hugeicons-react";
import heroImage from "@/assets/hero-nurse-patient-new.png";
import Image from "next/image";
import TrustBadges from "@/components/TrustBadges";
import dynamic from 'next/dynamic';

const WebinarSection = dynamic(() => import('@/components/WebinarSection'), {
    loading: () => <div className="py-12 bg-gray-50 animate-pulse h-[400px]"></div>
});

// Lazy load heavy components for better performance
const MedicalTeamSection = dynamic(() => import('@/components/MedicalTeamSection'), {
    loading: () => <div className="py-16 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
});
const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'), {
    loading: () => <div className="py-16 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
});

const Home = () => {
    const { t } = useLanguage();

    const steps = [
        {
            icon: <Tick02Icon className="h-8 w-8 text-primary" />,
            title: { id: 'Triase Cepat', en: 'Quick Triage' },
            description: {
                id: 'Sistem triase berbasis AI untuk penilaian cepat kondisi luka',
                en: 'AI-powered triage system for quick wound assessment'
            }
        },
        {
            icon: <FavouriteIcon className="h-8 w-8 text-primary" />,
            title: { id: 'Perawatan Terintegrasi', en: 'Integrated Care' },
            description: {
                id: 'Akses ke produk dan layanan perawatan luka terpadu',
                en: 'Access to comprehensive wound care products and services'
            }
        },
        {
            icon: <UserMultiple02Icon className="h-8 w-8 text-primary" />,
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
            icon: <MedicalMaskIcon className="h-16 w-16 text-primary" />
        },
        {
            title: { id: 'Sistem Monitoring', en: 'Monitoring System' },
            description: {
                id: 'Pantau perkembangan luka dengan teknologi digital',
                en: 'Track wound progress with digital technology'
            },
            icon: <ChartHistogramIcon className="h-16 w-16 text-primary" />
        },
        {
            title: { id: 'Konsultasi Online', en: 'Online Consultation' },
            description: {
                id: 'Konsultasi jarak jauh dengan spesialis perawatan luka',
                en: 'Remote consultation with wound care specialists'
            },
            icon: <Message02Icon className="h-16 w-16 text-primary" />
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
                            <div className="space-y-4">
                                <a href="https://derma-dfu.id/" target="_blank" rel="noopener noreferrer">
                                    <Button size="lg" className="min-h-[56px] text-lg px-10 bg-cta hover:bg-cta/90 shadow-lg">
                                        {t({ id: 'Konsultasi dengan Ahli', en: 'Consult with Experts' })}
                                        <ArrowRight01Icon className="ml-2 h-5 w-5" />
                                    </Button>
                                </a>
                                <p className="text-xs text-muted-foreground italic">
                                    {t({
                                        id: 'Konsultasikan dengan tenaga medis berlisensi kami',
                                        en: 'Consult with our licensed medical professionals'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Right Column - Image */}
                        <div className="animate-fade-in">
                            <Image
                                src={heroImage}
                                alt="Nurse with patient"
                                className="w-full h-auto scale-110"
                                priority
                                placeholder="blur"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Badges Section */}
            <TrustBadges />



            {/* Webinar Promotion Section (Dynamic) */}
            <WebinarSection />

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
                        <Link href="/products">
                            <Button variant="outline" className="min-h-[44px]">
                                {t({ id: 'Lihat Semua', en: 'View All' })}
                                <ArrowRight01Icon className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {products.map((product, index) => (
                            <Card key={index} className="hover-scale rounded-2xl shadow-md flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-center mb-4">{product.icon}</div>
                                    <CardTitle className="text-secondary">{t(product.title)}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col">
                                    <CardDescription className="text-base flex-grow">{t(product.description)}</CardDescription>
                                    <Link href="/products">
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

            {/* Medical Team Preview */}
            <MedicalTeamSection />

            {/* Patient Testimonials */}
            <TestimonialsSection />

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
                                        <ShieldBlockchainIcon className="h-5 w-5 text-primary flex-shrink-0" />
                                        <span>{t(benefit)}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/partners">
                                <Button size="lg" className="min-h-[48px] bg-primary hover:bg-primary/90">
                                    {t({ id: 'Daftar Sebagai Mitra', en: 'Register as Partner' })}
                                    <ArrowRight01Icon className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 shadow-lg">
                                <div className="flex justify-center mb-4">
                                    <Clapping01Icon className="h-16 w-16 text-primary" />
                                </div>
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
                    <Link href="/education">
                        <Button variant="outline" size="lg" className="min-h-[48px]">
                            {t({ id: 'Jelajahi Edukasi', en: 'Explore Education' })}
                            <ArrowRight01Icon className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
