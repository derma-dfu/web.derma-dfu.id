"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loading03Icon } from 'hugeicons-react';

// Static fallback logos
import kemenkesLogo from '@/assets/partners/kemenkes.png';
import risetaMedicaLogo from '@/assets/partners/riseta-medica.png';
import metadermaLogo from '@/assets/partners/metaderma.png';
import docprenLogo from '@/assets/partners/docpren.png';

interface Partner {
    id: string;
    name: string;
    logo_url: string | null;
    website_url: string | null;
    is_active: boolean;
}

const PartnerLogos = () => {
    const { t } = useLanguage();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);

    const staticPartners = [
        { name: 'Kemenkes', logo: kemenkesLogo },
        { name: 'Riseta Medica', logo: risetaMedicaLogo },
        { name: 'Metaderma', logo: metadermaLogo },
        { name: 'Docpren', logo: docprenLogo },
    ];

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const { data, error } = await supabase
                    .from('partners')
                    .select('id, name, logo_url, website_url, is_active')
                    .eq('is_active', true)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setPartners((data as Partner[]) || []);
            } catch (error) {
                console.error('Error fetching partners:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPartners();
    }, []);

    return (
        <section className="py-12 bg-muted/20 border-t border-border/30">
            <div className="container mx-auto px-4">
                <h3 className="text-xl font-semibold text-center mb-8 text-secondary">
                    {t({ id: 'Dipercaya Oleh', en: 'Trusted By' })}
                </h3>
                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
                    {loading ? (
                        <Loading03Icon className="h-6 w-6 animate-spin text-primary" />
                    ) : partners.length > 0 ? (
                        partners.map((partner) => (
                            <a
                                key={partner.id}
                                href={partner.website_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white p-3 rounded-lg shadow-sm border border-border/40 hover:border-primary/30 hover:shadow-md transition-all h-16 w-32 flex items-center justify-center"
                            >
                                {partner.logo_url ? (
                                    <img
                                        src={partner.logo_url}
                                        alt={partner.name}
                                        className="max-h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                                    />
                                ) : (
                                    <span className="text-xs font-medium text-secondary text-center">{partner.name}</span>
                                )}
                            </a>
                        ))
                    ) : (
                        staticPartners.map((partner, index) => (
                            <div
                                key={index}
                                className="bg-white p-3 rounded-lg shadow-sm border border-border/40 h-16 w-32 flex items-center justify-center"
                            >
                                <img
                                    src={partner.logo.src}
                                    alt={partner.name}
                                    className="max-h-10 w-auto object-contain opacity-80"
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default PartnerLogos;
