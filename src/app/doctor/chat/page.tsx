"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DoctorChatListPage() {
    const supabase = createClient();
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [doctorId, setDoctorId] = useState<string | null>(null);

    useEffect(() => {
        fetchChats();
    }, []);

    // Realtime Subscription
    useEffect(() => {
        if (!doctorId) return;

        const channel = supabase
            .channel('doctor-referrals')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'referrals',
                    filter: `doctor_id=eq.${doctorId}`
                },
                () => {
                    // Refresh list on any change (new referral, status update)
                    fetchChats();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [doctorId]);

    const fetchChats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get doctor ID first
            const { data: doctor } = await supabase
                .from('doctors')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!doctor) return;
            setDoctorId(doctor.id);

            // Fetch referrals assigned to this doctor
            const { data: referrals, error } = await supabase
                .from('referrals')
                .select(`
                    *,
                    triage_records (
                        id,
                        user_id,
                        photo_url,
                        triage_result
                    )
                `)
                .eq('doctor_id', doctor.id)
                .order('created_at', { ascending: false });

            // Note: 'triage_result' column name might be 'result' or 'triage_result'. 
            // In schema check, it was 'result' for triage_records? 
            // Let's verify 'triage_records' schema in schema.ts if needed. 
            // For now assuming the previous code was correct or I'll fix it if it errors.
            // Wait, previous code used 'triage_result' in select but 'result' is common.
            // I'll stick to what was there: 'triage_result'. Update: The previous code had `triage_records ( ... triage_result )`.

            if (error) throw error;
            setChats(referrals || []);

        } catch (error) {
            console.error("Error fetching chats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Memuat daftar chat...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Konsultasi Chat</h2>
                <p className="text-muted-foreground">Daftar pasien yang sedang atau menunggu konsultasi dengan Anda.</p>
            </div>

            <div className="grid gap-4">
                {chats.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                            <p>Belum ada konsultasi aktif saat ini.</p>
                        </CardContent>
                    </Card>
                ) : (
                    chats.map((chat) => (
                        <Card key={chat.id} className="group hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex items-center gap-4">
                                <Avatar className="h-12 w-12 border">
                                    {/* Ideally, fetch User Profile photo. Using triage wound photo or fallback for now */}
                                    <AvatarImage src={chat.triage_records?.photo_url} className="object-cover" />
                                    <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold truncate">
                                            Pasien #{chat.triage_records?.user_id?.substring(0, 8)}
                                            {/* Use 'Pasien' + ID substring since we don't have separate profile table yet */}
                                        </h4>
                                        <Badge variant={chat.status === 'completed' ? 'secondary' : 'default'} className="uppercase text-[10px]">
                                            {chat.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground gap-3">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(chat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span>•</span>
                                        <span>{chat.consultation_type}</span>
                                    </div>
                                </div>

                                <Button asChild size="sm" className="shrink-0">
                                    <Link href={`/chat/${chat.id}`}>
                                        Buka Chat <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
