"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Award02Icon, Building03Icon, UserIcon } from 'hugeicons-react';
import Image from 'next/image';
import { supabase } from '@/integrations/supabase/client';

type Doctor = {
    id: string;
    name: string;
    role_id: string;
    role_en: string;
    specialty_id: string;
    specialty_en: string;
    image_url: string;
    experience_id: string;
    experience_en: string;
    credentials: string[] | null;
};

const MedicalTeamSection = () => {
    const { t, language } = useLanguage();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const { data, error } = await supabase
                    .from('doctors' as any)
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: true });

                if (error) {
                    console.error('Error fetching doctors:', error);
                } else {
                    setDoctors((data as unknown as Doctor[]) || []);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    if (isLoading) {
        return (
            <section className="py-16 px-4 bg-background">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-96 bg-slate-100 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 px-4 bg-background">
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        {t({ id: 'Tim Medis Profesional', en: 'Professional Medical Team' })}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary">
                        {t({ id: 'Dipercaya oleh Ahli Medis Terbaik', en: 'Trusted by Top Medical Experts' })}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {t({
                            id: 'Tim dokter spesialis bersertifikat dengan pengalaman puluhan tahun di bidang perawatan luka diabetes.',
                            en: 'Certified specialist doctors with decades of experience in diabetic wound care.'
                        })}
                    </p>
                </div>

                {/* Team Grid or Empty State */}
                {doctors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {doctors.map((member) => (
                            <Card key={member.id} className="rounded-2xl border-border/50 hover:border-primary/20 hover:shadow-lg transition-all overflow-hidden group">
                                <div className="relative h-80 bg-gradient-to-br from-primary/5 to-secondary/5 flex items-start justify-center overflow-hidden">
                                    {/* Doctor image or placeholder */}
                                    {member.image_url ? (
                                        <Image
                                            src={member.image_url}
                                            alt={member.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            style={{ objectPosition: 'top center' }}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            quality={85}
                                        />
                                    ) : (
                                        <div className="h-40 w-40 rounded-full bg-white/80 flex items-center justify-center border-4 border-white shadow-lg mt-16">
                                            <span className="text-4xl font-bold text-primary">{member.name.charAt(0)}</span>
                                        </div>
                                    )}
                                    {/* Professional Badge */}
                                    {member.experience_id && (
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary/20 flex items-center gap-2">
                                            <Award02Icon className="h-4 w-4 text-primary" />
                                            <span className="text-xs font-semibold text-secondary">
                                                {language === 'id' ? member.experience_id : member.experience_en}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <CardContent className="p-6">
                                    <h3 className="text-lg font-bold text-secondary mb-2 group-hover:text-primary transition-colors">
                                        {member.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                        <Building03Icon className="h-4 w-4 text-primary" />
                                        {language === 'id' ? member.role_id : member.role_en}
                                    </p>
                                    <p className="text-sm font-medium text-primary mb-4">
                                        {language === 'id' ? member.specialty_id : member.specialty_en}
                                    </p>

                                    {/* Credentials */}
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                                        {member.credentials?.map((credential, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium"
                                            >
                                                {credential}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <UserIcon className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2 text-center">
                            {t({ id: 'Belum Ada Dokter Terdaftar', en: 'No Doctors Registered Yet' })}
                        </h3>
                        <p className="text-slate-500 text-center max-w-md">
                            {t({
                                id: 'Kami sedang memperbarui daftar tim medis kami. Silakan kembali lagi nanti untuk informasi terbaru.',
                                en: 'We are currently updating our medical team list. Please check back later for the latest information.'
                            })}
                        </p>
                    </div>
                )}

                {/* Medical Disclaimer */}
                <div className="mt-12 p-6 bg-muted/30 rounded-xl border border-border/50">
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                        <span className="font-semibold text-secondary">
                            {t({ id: 'Catatan Medis:', en: 'Medical Note:' })}
                        </span>{' '}
                        {t({
                            id: 'Semua layanan konsultasi dilakukan oleh tenaga medis berlisensi dan terdaftar di Konsil Kedokteran Indonesia (KKI).',
                            en: 'All consultation services are provided by licensed medical professionals registered with the Indonesian Medical Council (KKI).'
                        })}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default MedicalTeamSection;
