"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Activity,
    Users,
    MessageSquare,
    Calendar,
    ArrowUpRight,
    Clock
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DoctorDashboard() {
    const supabase = createClient();
    const [stats, setStats] = useState({
        totalPatients: 0,
        activeChats: 0,
        todayConsultations: 0,
        rating: 0,
    });
    const [loading, setLoading] = useState(true);
    const [recentConsultations, setRecentConsultations] = useState<any[]>([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get Doctor ID
            const { data: doctor } = await supabase
                .from('doctors')
                .select('id, rating')
                .eq('user_id', user.id)
                .single();

            if (!doctor) return;

            // Mock stats for now (Realtime counts would require more complex queries)
            // In production, you'd want aggregate queries or robust counters.

            // Get real 'active chats' count (referrals with pending status)
            const { count: activeCount } = await supabase
                .from('referrals')
                .select('*', { count: 'exact', head: true })
                .eq('doctor_id', doctor.id)
                .eq('status', 'active'); // Assuming 'active' status for ongoing chats

            setStats({
                totalPatients: 125, // Mock
                activeChats: activeCount || 0,
                todayConsultations: 4, // Mock
                rating: doctor.rating || 5.0,
            });

            setLoading(false);

        } catch (error) {
            console.error("Error fetching doctor stats:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Selamat datang kembali, Dok.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/doctor/chat">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Buka Chat
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pasien</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPatients}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chat Aktif</CardTitle>
                        <MessageSquare className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeChats}</div>
                        <p className="text-xs text-muted-foreground">Menunggu respon</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Konsultasi Hari Ini</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.todayConsultations}</div>
                        <p className="text-xs text-muted-foreground">4 Selesai</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rating Pasien</CardTitle>
                        <Activity className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.rating}</div>
                        <p className="text-xs text-muted-foreground">Dari 5.0</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Permintaan Konsultasi Terbaru</CardTitle>
                        <CardDescription>
                            Daftar pasien yang baru saja mengajukan konsultasi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div className="flex items-center justify-center p-8 text-muted-foreground">
                                Belum ada permintaan konsultasi baru.
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Jadwal Mendatang</CardTitle>
                        <CardDescription>
                            Agenda konsultasi minggu ini
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Rapat Tim Medis</p>
                                    <p className="text-sm text-muted-foreground">Senin, 09:00 - 10:00</p>
                                </div>
                                <Badge className="ml-auto" variant="outline">Zoom</Badge>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Visite Pasien VIP</p>
                                    <p className="text-sm text-muted-foreground">Selasa, 14:00 - 15:00</p>
                                </div>
                                <Badge className="ml-auto" variant="outline">RS</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
