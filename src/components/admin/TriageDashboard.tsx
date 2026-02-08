"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Search, RefreshCw, Eye, MessageCircle, AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { toast } from "sonner";

interface TriageRecord {
    id: string;
    created_at: string;
    user_id: string;
    triage_result: "red" | "yellow" | "green";
    photo_url: string | null;
    wound_location: string | null;
    infection_prob: string | null;
    ischaemia_prob: string | null;
    notes: string | null;
    user?: { name: string; email: string; image: string | null };
    referrals?: { id: string; status: string; consultation_type: string }[];
}

interface Stats {
    total: number;
    red: number;
    yellow: number;
    green: number;
    pending_referrals: number;
}

export function TriageDashboard() {
    const { t } = useLanguage();
    const [records, setRecords] = useState<TriageRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [stats, setStats] = useState<Stats>({ total: 0, red: 0, yellow: 0, green: 0, pending_referrals: 0 });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const supabase = createClient();

        const fetchRecords = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("triage_records")
                    .select(`
                        *,
                        user:user!triage_records_user_id_user_id_fk (name, email, image),
                        referrals (id, status, consultation_type)
                    `)
                    .order("created_at", { ascending: false })
                    .limit(100);

                if (error) throw error;
                setRecords((data as TriageRecord[]) || []);
            } catch (err) {
                console.error("Error fetching records:", err);
                toast.error(t({ id: "Gagal memuat data", en: "Failed to load data" }));
            } finally {
                setLoading(false);
            }
        };

        const fetchStats = async () => {
            try {
                // Get total count
                const { count: total } = await supabase
                    .from("triage_records")
                    .select("*", { count: "exact", head: true });

                // Get counts by result
                const { count: red } = await supabase
                    .from("triage_records")
                    .select("*", { count: "exact", head: true })
                    .eq("triage_result", "red");

                const { count: yellow } = await supabase
                    .from("triage_records")
                    .select("*", { count: "exact", head: true })
                    .eq("triage_result", "yellow");

                const { count: green } = await supabase
                    .from("triage_records")
                    .select("*", { count: "exact", head: true })
                    .eq("triage_result", "green");

                // Get pending referrals
                const { count: pending } = await supabase
                    .from("referrals")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "pending");

                setStats({
                    total: total || 0,
                    red: red || 0,
                    yellow: yellow || 0,
                    green: green || 0,
                    pending_referrals: pending || 0,
                });
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };

        fetchRecords();
        fetchStats();
    }, [t]);

    const refresh = () => {
        // Trigger re-fetch by remounting effect
        window.location.reload();
    };


    const exportToCSV = () => {
        const filtered = getFilteredRecords();
        const csvContent = [
            ["ID", "Tanggal", "Nama", "Email", "Hasil", "Lokasi", "Infeksi%", "Iskemia%", "Catatan"].join(","),
            ...filtered.map(r => [
                r.id,
                format(new Date(r.created_at), "yyyy-MM-dd HH:mm"),
                r.user?.name || "-",
                r.user?.email || "-",
                r.triage_result.toUpperCase(),
                r.wound_location || "-",
                r.infection_prob ? Math.round(parseFloat(r.infection_prob) * 100) : "-",
                r.ischaemia_prob ? Math.round(parseFloat(r.ischaemia_prob) * 100) : "-",
                `"${(r.notes || "").replace(/"/g, '""')}"`,
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `triage_records_${format(new Date(), "yyyyMMdd")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(t({ id: "Data berhasil diekspor", en: "Data exported successfully" }));
    };

    const getFilteredRecords = () => {
        return records.filter(r => {
            const matchesFilter = filter === "all" || r.triage_result === filter;
            const matchesSearch = !search ||
                r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
                r.user?.email?.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    };

    const getTriageIcon = (result: string) => {
        switch (result) {
            case "red": return <AlertCircle className="h-4 w-4 text-red-500" />;
            case "yellow": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case "green": return <CheckCircle className="h-4 w-4 text-green-500" />;
            default: return null;
        }
    };

    const getTriageBadge = (result: string) => {
        switch (result) {
            case "red": return <Badge className="bg-red-500 text-white">Merah</Badge>;
            case "yellow": return <Badge className="bg-yellow-500 text-black">Kuning</Badge>;
            case "green": return <Badge className="bg-green-500 text-white">Hijau</Badge>;
            default: return null;
        }
    };

    const filteredRecords = getFilteredRecords();

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">{t({ id: "Total Triage", en: "Total Triage" })}</p>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50/50">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">{stats.red}</div>
                        <p className="text-xs text-red-600/70">{t({ id: "Merah (Darurat)", en: "Red (Emergency)" })}</p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50/50">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-600">{stats.yellow}</div>
                        <p className="text-xs text-yellow-600/70">{t({ id: "Kuning (Konsultasi)", en: "Yellow (Consult)" })}</p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{stats.green}</div>
                        <p className="text-xs text-green-600/70">{t({ id: "Hijau (Mandiri)", en: "Green (Self-care)" })}</p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{stats.pending_referrals}</div>
                        <p className="text-xs text-blue-600/70">{t({ id: "Rujukan Pending", en: "Pending Referrals" })}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Actions */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t({ id: "Cari nama/email...", en: "Search name/email..." })}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t({ id: "Semua", en: "All" })}</SelectItem>
                                    <SelectItem value="red">{t({ id: "Merah", en: "Red" })}</SelectItem>
                                    <SelectItem value="yellow">{t({ id: "Kuning", en: "Yellow" })}</SelectItem>
                                    <SelectItem value="green">{t({ id: "Hijau", en: "Green" })}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                                {t({ id: "Refresh", en: "Refresh" })}
                            </Button>
                            <Button variant="outline" size="sm" onClick={exportToCSV}>
                                <Download className="h-4 w-4 mr-2" />
                                {t({ id: "Export CSV", en: "Export CSV" })}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Records Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>{t({ id: "Pasien", en: "Patient" })}</TableHead>
                                    <TableHead>{t({ id: "Tanggal", en: "Date" })}</TableHead>
                                    <TableHead>{t({ id: "Hasil", en: "Result" })}</TableHead>
                                    <TableHead>{t({ id: "Lokasi", en: "Location" })}</TableHead>
                                    <TableHead>{t({ id: "Risiko", en: "Risk" })}</TableHead>
                                    <TableHead>{t({ id: "Status", en: "Status" })}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredRecords.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            {t({ id: "Tidak ada data", en: "No data found" })}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRecords.map((record, idx) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-mono text-xs">{idx + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={record.user?.image || undefined} />
                                                        <AvatarFallback>{record.user?.name?.substring(0, 2) || "?"}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <div className="font-medium truncate">{record.user?.name || "-"}</div>
                                                        <div className="text-xs text-muted-foreground truncate">{record.user?.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {format(new Date(record.created_at), "dd MMM yyyy, HH:mm", { locale: localeID })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {getTriageIcon(record.triage_result)}
                                                    {getTriageBadge(record.triage_result)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm capitalize">
                                                {record.wound_location?.replace("_", " ") || "-"}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {record.infection_prob && (
                                                    <div className="space-y-0.5">
                                                        <div>Inf: {Math.round(parseFloat(record.infection_prob) * 100)}%</div>
                                                        <div>Isk: {Math.round(parseFloat(record.ischaemia_prob || "0") * 100)}%</div>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {record.referrals && record.referrals.length > 0 ? (
                                                    <div className="flex gap-1 flex-wrap">
                                                        {record.referrals.map((ref) => (
                                                            <Badge key={ref.id} variant="outline" className="text-xs">
                                                                <MessageCircle className="h-3 w-3 mr-1" />
                                                                {ref.status}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
