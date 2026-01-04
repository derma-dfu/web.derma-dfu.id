"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Calendar03Icon,
    Clock01Icon,
    VideoReplayIcon,
    LinkSquare02Icon,
    SparklesIcon
} from "hugeicons-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

type Speaker = {
    name: string;
    role: string;
};

type Webinar = {
    id: string;
    title: string;
    description: string | null;
    date: string;
    time: string;
    platform: string;
    speakers: Speaker[] | null;
    moderator: string | null;
    price: string | null;
    image_url: string | null;
    registration_url: string | null;
};

const WebinarSection = () => {
    const { t } = useLanguage();
    const [webinar, setWebinar] = useState<Webinar | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLatestWebinar = async () => {
            try {
                const { data, error } = await supabase
                    .from("webinars")
                    .select("*")
                    .eq("is_active", true)
                    .order("date", { ascending: false })
                    .limit(1)
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    console.error("Error fetching webinar:", error);
                } else if (data) {
                    const formattedWebinar = {
                        ...data,
                        speakers: data.speakers as unknown as Speaker[]
                    };
                    setWebinar(formattedWebinar);
                } else {
                    setWebinar(null); // Explicitly set null if no data
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLatestWebinar();
    }, []);

    if (isLoading) return null; // Or a skeleton loader

    // Empty State for Webinar
    if (!webinar) {
        return (
            <section className="py-12 px-4 bg-muted/30">
                <div className="container mx-auto">
                    <div className="bg-card rounded-2xl shadow-sm border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Calendar03Icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-secondary mb-2">
                            {t({ id: 'Belum Ada Jadwal Webinar', en: 'No Upcoming Webinars' })}
                        </h3>
                        <p className="text-muted-foreground max-w-lg mb-6">
                            {t({
                                id: 'Kami sedang mempersiapkan webinar menarik berikutnya. Pantau terus halaman ini untuk update terbaru.',
                                en: 'We are preparing our next exciting webinar. Stay tuned for updates.'
                            })}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    const webinarDate = new Date(webinar.date);
    const formattedDate = webinarDate.toLocaleDateString(t({ id: 'id-ID', en: 'en-US' }), {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <section className="py-12 px-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
            <div className="container mx-auto">
                <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Poster Image */}
                        <div className="relative min-h-[300px] lg:min-h-full">
                            {webinar.image_url ? (
                                <Image
                                    src={webinar.image_url}
                                    alt={webinar.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                    <span className="text-slate-400">No Image</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <span className="bg-cta text-cta-foreground px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg">
                                    {webinar.price || 'GRATIS'}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex flex-col justify-center">
                            <div className="mb-4">
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="h-4 w-4 text-primary" />
                                    <span className="text-primary font-semibold text-sm uppercase tracking-wide">
                                        {t({ id: 'Webinar Terbaru', en: 'Latest Webinar' })}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-secondary mb-4 leading-tight">
                                {webinar.title}
                            </h3>
                            <p className="text-foreground/70 mb-6 text-sm leading-relaxed whitespace-pre-wrap">
                                {webinar.description}
                            </p>

                            <div className="flex flex-wrap gap-4 mb-6 text-sm">
                                <div className="flex items-center gap-2 text-foreground/80">
                                    <Calendar03Icon className="h-4 w-4 text-primary" />
                                    <span>{formattedDate}</span>
                                </div>
                                <div className="flex items-center gap-2 text-foreground/80">
                                    <Clock01Icon className="h-4 w-4 text-primary" />
                                    <span>{webinar.time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-foreground/80">
                                    <VideoReplayIcon className="h-4 w-4 text-primary" />
                                    <span>{webinar.platform}</span>
                                </div>
                            </div>

                            {(webinar.speakers && webinar.speakers.length > 0) && (
                                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                                    <p className="text-xs text-foreground/60 mb-2 font-medium">
                                        {t({ id: 'Narasumber:', en: 'Speakers:' })}
                                    </p>
                                    <ul className="text-sm text-foreground/80 space-y-1">
                                        {webinar.speakers.map((speaker, idx) => (
                                            <li key={idx}>• {speaker.name} {speaker.role ? `(${speaker.role})` : ''}</li>
                                        ))}
                                    </ul>
                                    {webinar.moderator && (
                                        <p className="text-xs text-foreground/60 mt-2">
                                            {t({ id: 'Moderator:', en: 'Moderator:' })} {webinar.moderator}
                                        </p>
                                    )}
                                </div>
                            )}

                            {webinar.registration_url && (
                                <a
                                    href={webinar.registration_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block"
                                >
                                    <Button size="lg" className="min-h-[52px] text-base px-8 bg-cta hover:bg-cta/90 shadow-lg group w-full md:w-auto">
                                        {t({ id: 'Daftar Sekarang', en: 'Register Now' })}
                                        <LinkSquare02Icon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2 text-center md:text-left">
                                        {t({ id: 'Via Google Form', en: 'Via Google Form' })}
                                    </p>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WebinarSection;
