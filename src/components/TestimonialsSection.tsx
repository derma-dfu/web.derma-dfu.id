"use client";

import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Note02Icon, StarIcon, CheckmarkBadge02Icon } from 'hugeicons-react';

const TestimonialsSection = () => {
    const { t } = useLanguage();

    // Anonymized patient testimonials (HIPAA compliant)
    const testimonials = [
        {
            initials: 'R.S',
            age: 58,
            condition: { id: 'Diabetes Tipe 2 dengan DFU', en: 'Type 2 Diabetes with DFU' },
            rating: 5,
            testimonial: {
                id: 'Setelah 3 bulan menggunakan layanan DERMA-DFU, luka saya sembuh sempurna. Tim medis sangat profesional dan responsif terhadap setiap pertanyaan saya.',
                en: 'After 3 months using DERMA-DFU services, my wound healed completely. The medical team was very professional and responsive to all my questions.'
            },
            outcome: { id: 'Luka Sembuh Total', en: 'Complete Wound Healing' },
            verified: true
        },
        {
            initials: 'A.W',
            age: 62,
            condition: { id: 'DFU Wagner Grade 2', en: 'DFU Wagner Grade 2' },
            rating: 5,
            testimonial: {
                id: 'Sistem monitoring digital sangat membantu saya memantau perkembangan luka. Dokter dapat melihat progress secara real-time dan memberikan saran yang tepat.',
                en: 'The digital monitoring system was very helpful in tracking my wound progress. Doctors could see real-time progress and provide appropriate advice.'
            },
            outcome: { id: 'Perbaikan Signifikan', en: 'Significant Improvement' },
            verified: true
        },
        {
            initials: 'D.L',
            age: 55,
            condition: { id: 'Diabetes dengan Neuropati', en: 'Diabetes with Neuropathy' },
            rating: 5,
            testimonial: {
                id: 'Produk perawatan luka yang direkomendasikan berkualitas tinggi dan customer service sangat membantu. Harga reasonable untuk kualitas yang didapat.',
                en: 'The recommended wound care products are high quality and customer service was very helpful. Reasonable price for the quality received.'
            },
            outcome: { id: 'Pencegahan Efektif', en: 'Effective Prevention' },
            verified: true
        }
    ];

    return (
        <section className="py-16 px-4 bg-background">
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        {t({ id: 'Testimoni Pasien', en: 'Patient Testimonials' })}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary">
                        {t({ id: 'Kisah Kesembuhan Pasien Kami', en: 'Our Patients\' Healing Stories' })}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {t({
                            id: 'Ribuan pasien telah merasakan manfaat perawatan profesional kami.',
                            en: 'Thousands of patients have experienced the benefits of our professional care.'
                        })}
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="rounded-2xl border-border/50 hover:border-primary/20 hover:shadow-lg transition-all relative overflow-hidden">
                            {/* Quote Icon Background */}
                            <div className="absolute top-4 right-4 opacity-10">
                                <Note02Icon className="h-16 w-16 text-primary" />
                            </div>

                            <CardContent className="p-6 relative">
                                {/* Rating Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <StarIcon key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>

                                {/* Testimonial Text */}
                                <p className="text-gray-700 leading-relaxed mb-6 italic">
                                    "{t(testimonial.testimonial)}"
                                </p>

                                {/* Patient Info (Anonymous) */}
                                <div className="pt-4 border-t border-border/50">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-secondary">{testimonial.initials}</h4>
                                                {testimonial.verified && (
                                                    <CheckmarkBadge02Icon className="h-5 w-5 text-primary" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {t({ id: `${testimonial.age} Tahun`, en: `${testimonial.age} Years Old` })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Condition & Outcome */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">{t({ id: 'Kondisi:', en: 'Condition:' })}</span>
                                            <span className="font-medium text-secondary">{t(testimonial.condition)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">{t({ id: 'Hasil:', en: 'Outcome:' })}</span>
                                            <span className="font-semibold text-primary">{t(testimonial.outcome)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { number: '95%', label: { id: 'Tingkat Kepuasan', en: 'Satisfaction Rate' } },
                        { number: '3,500+', label: { id: 'Pasien Ditangani', en: 'Patients Treated' } },
                        { number: '87%', label: { id: 'Tingkat Kesembuhan', en: 'Healing Rate' } },
                        { number: '24/7', label: { id: 'Dukungan Medis', en: 'Medical Support' } }
                    ].map((stat, index) => (
                        <div key={index} className="text-center p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-border/40">
                            <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</p>
                            <p className="text-sm text-muted-foreground font-medium">{t(stat.label)}</p>
                        </div>
                    ))}
                </div>

                {/* Privacy Note */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground italic">
                        {t({
                            id: 'Semua testimoni telah dianonimkan untuk melindungi privasi pasien sesuai regulasi perlindungan data kesehatan.',
                            en: 'All testimonials have been anonymized to protect patient privacy in accordance with health data protection regulations.'
                        })}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
