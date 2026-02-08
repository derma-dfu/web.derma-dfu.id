"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, AlertCircle, AlertTriangle, CheckCircle, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

interface TriageRecord {
    id: string;
    created_at: string;
    triage_result: "red" | "yellow" | "green";
    photo_url: string | null;
    wound_location: string | null;
    notes: string | null;
    infection_prob: string | null;
    ischaemia_prob: string | null;
    referrals?: { id: string; status: string; consultation_type: string }[];
}

export default function TriageHistoryPage() {
    const router = useRouter();
    const supabase = createClient();

    const [records, setRecords] = useState<TriageRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkAuthAndFetch();
    }, []);

    const checkAuthAndFetch = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/auth");
            return;
        }
        setUser(user);
        await fetchRecords(user.id);
    };

    const fetchRecords = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("triage_records")
                .select(`
          *,
          referrals (id, status, consultation_type)
        `)
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setRecords(data || []);
        } catch (err) {
            console.error("Error fetching records:", err);
        } finally {
            setLoading(false);
        }
    };

    const getTriageIcon = (result: string) => {
        switch (result) {
            case "red": return <AlertCircle className="h-5 w-5 text-red-500" />;
            case "yellow": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case "green": return <CheckCircle className="h-5 w-5 text-green-500" />;
            default: return null;
        }
    };

    const getTriageBadge = (result: string) => {
        switch (result) {
            case "red": return <Badge className="bg-red-500">Merah - Darurat</Badge>;
            case "yellow": return <Badge className="bg-yellow-500 text-black">Kuning - Konsultasi</Badge>;
            case "green": return <Badge className="bg-green-500">Hijau - Mandiri</Badge>;
            default: return null;
        }
    };

    const getLocationLabel = (loc: string | null) => {
        switch (loc) {
            case "toes": return "Jari Kaki";
            case "midfoot": return "Tengah Kaki";
            case "heel": return "Tumit";
            default: return loc || "-";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">Memuat riwayat...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/triage">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold">Riwayat Triage</h1>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {records.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground mb-4">Belum ada riwayat triage</p>
                            <Link href="/triage">
                                <Button>Mulai Penilaian Baru</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {records.map((record) => (
                            <Card key={record.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        {/* Photo thumbnail */}
                                        {record.photo_url && (
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                <img
                                                    src={record.photo_url}
                                                    alt="Wound"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getTriageIcon(record.triage_result)}
                                                {getTriageBadge(record.triage_result)}
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(record.created_at), "dd MMMM yyyy, HH:mm", { locale: localeID })}
                                            </div>

                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Lokasi: </span>
                                                {getLocationLabel(record.wound_location)}
                                            </div>

                                            {record.infection_prob && (
                                                <div className="text-sm mt-1">
                                                    <span className="text-muted-foreground">Risiko: </span>
                                                    Infeksi {Math.round(parseFloat(record.infection_prob) * 100)}%,
                                                    Iskemia {Math.round(parseFloat(record.ischaemia_prob || "0") * 100)}%
                                                </div>
                                            )}

                                            {/* Referral status */}
                                            {record.referrals && record.referrals.length > 0 && (
                                                <div className="mt-2 flex gap-2">
                                                    {record.referrals.map((ref) => (
                                                        <Link key={ref.id} href={`/chat/${ref.id}`}>
                                                            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                                                                <MessageCircle className="h-3 w-3 mr-1" />
                                                                {ref.consultation_type === "teleconsultation" ? "Chat" : "Rujukan"} - {ref.status}
                                                            </Badge>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
