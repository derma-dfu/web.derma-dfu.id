"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Mail01Icon,
  CallIcon,
  Location01Icon,
  Alert02Icon,
  SecurityCheckIcon,
  LicenseDraftIcon
} from 'hugeicons-react';
// Using logo from public folder
import metadermaLogo from '@/assets/partners/metaderma-logo.png';

const Footer = () => {
  const { t } = useLanguage();
  const pathname = usePathname();

  if (pathname?.startsWith('/auth')) return null;

  return (
    <footer className="bg-slate-50 border-t border-blue-100/50 mt-20 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary/50" />
      <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-[200px] -left-[200px] w-[500px] h-[500px] bg-pink-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Emergency Hotline Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-200">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 p-3 rounded-full">
              <Alert02Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-1">
                {t({ id: 'Darurat Medis 24/7', en: 'Medical Emergency 24/7' })}
              </h3>
              <p className="text-sm text-red-700">
                {t({ id: 'Untuk kondisi darurat diabetes, hubungi:', en: 'For diabetes emergencies, contact:' })}
              </p>
            </div>
            <a href="tel:+6285181709098988" className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg">
              <CallIcon className="inline h-5 w-5 mr-2" />
              +62 851-8709-8988
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          {/* Company Info - Wider Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/">
              <img
                src="/logo/logo-derma-dfu-panjang.png"
                alt="DERMA-DFU.ID"
                className="h-14 w-auto object-contain mb-4 transition-transform hover:scale-105"
              />
            </Link>
            <p className="text-slate-600 leading-relaxed text-sm">
              {t({
                id: 'Platform inovatif terdepan untuk manajemen luka diabetes di Indonesia. Kami menghubungkan pasien dengan perawatan medis terbaik.',
                en: 'Leading innovative platform for diabetic wound management in Indonesia. Connecting patients with the best medical care.'
              })}
            </p>

            {/* Certifications */}
            <div className="pt-4 border-t border-slate-200">
              <h5 className="text-xs font-semibold text-slate-500 uppercase mb-3">
                {t({ id: 'Sertifikasi & Lisensi', en: 'Certifications & License' })}
              </h5>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <SecurityCheckIcon className="h-3 w-3" />
                  {t({ id: 'Kemenkes Terdaftar', en: 'MOH Registered' })}
                </span>
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <LicenseDraftIcon className="h-3 w-3" />
                  ISO 13485
                </span>
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  BPOM Approved
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6 text-slate-800 tracking-tight">
              {t({ id: 'Menu Utama', en: 'Main Menu' })}
            </h4>
            <ul className="space-y-4">
              {[
                { label: { id: 'Beranda', en: 'Home' }, href: '/' },
                { label: { id: 'Produk', en: 'Products' }, href: '/products' },
                { label: { id: 'Edukasi', en: 'Education' }, href: '/education' },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href} className="text-primary hover:text-secondary transition-colors text-sm font-semibold flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-3 group-hover:bg-secondary transition-colors" />
                    {t(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-6 text-slate-800 tracking-tight">
              {t({ id: 'Dukungan', en: 'Support' })}
            </h4>
            <ul className="space-y-4">
              {[
                { label: { id: 'Mitra', en: 'Partners' }, href: '/partners' },
                { label: { id: 'Bantuan', en: 'Help Center' }, href: '/help' },
                { label: { id: 'Tentang Kami', en: 'About Us' }, href: '/about' },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href} className="text-primary hover:text-secondary transition-colors text-sm font-semibold flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-3 group-hover:bg-secondary transition-colors" />
                    {t(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-6 text-slate-800 tracking-tight">
              {t({ id: 'Hubungi Kami', en: 'Contact Us' })}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-slate-600 group">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow text-primary border border-slate-100">
                  <Mail01Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-400">Email</span>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">info@derma-dfu.id</span>
                </div>
              </li>
              <li className="flex items-start space-x-3 text-slate-600 group">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow text-primary border border-slate-100">
                  <CallIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-400">Phone</span>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">+62 851-8709-8988</span>
                </div>
              </li>
              <li className="flex items-start space-x-3 text-slate-600 group">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow text-primary border border-slate-100">
                  <Location01Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-400">Location</span>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">Jakarta, Indonesia</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="mb-8 p-6 bg-amber-50/50 rounded-xl border border-amber-200/50">
          <h4 className="font-bold text-sm text-amber-900 mb-2 flex items-center gap-2">
            <SecurityCheckIcon className="h-4 w-4" />
            {t({ id: 'Disclaimer Medis', en: 'Medical Disclaimer' })}
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            {t({
              id: 'Informasi yang disediakan di platform ini hanya untuk tujuan edukasi dan tidak menggantikan konsultasi medis profesional. Selalu konsultasikan dengan dokter berlisensi untuk diagnosis dan perawatan. Semua layanan konsultasi dilakukan oleh tenaga medis terdaftar di Konsil Kedokteran Indonesia (KKI).',
              en: 'Information provided on this platform is for educational purposes only and does not replace professional medical consultation. Always consult with licensed doctors for diagnosis and treatment. All consultation services are provided by medical professionals registered with the Indonesian Medical Council (KKI).'
            })}
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-2">
                © 2025 DERMA-DFU.ID. {t({ id: 'Hak Cipta Dilindungi.', en: 'All Rights Reserved.' })}
              </p>
              <p className="text-xs text-slate-400">
                {t({
                  id: 'Data pasien dilindungi dengan enkripsi SSL/TLS dan sesuai standar keamanan data kesehatan.',
                  en: 'Patient data protected with SSL/TLS encryption and compliant with health data security standards.'
                })}
              </p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
              <span className="text-slate-400 text-xs font-medium">Technology Partner</span>
              <a
                href="https://metaderma.id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <img
                  src={metadermaLogo.src}
                  alt="Metaderma"
                  className="h-4 w-auto object-contain"
                />
              </a>
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/privacy" className="text-secondary hover:text-primary transition-colors font-bold underline decoration-2">
              {t({ id: 'Kebijakan Privasi', en: 'Privacy Policy' })}
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/terms" className="text-secondary hover:text-primary transition-colors font-bold underline decoration-2">
              {t({ id: 'Syarat & Ketentuan', en: 'Terms & Conditions' })}
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/medical-disclaimer" className="text-secondary hover:text-primary transition-colors font-bold underline decoration-2">
              {t({ id: 'Disclaimer Medis', en: 'Medical Disclaimer' })}
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">
              {t({ id: 'Nomor Izin: [User perlu isi]', en: 'License No: [User needs to fill]' })}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
