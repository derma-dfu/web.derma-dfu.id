"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export default function DoctorProfilePage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [doctor, setDoctor] = useState<any>(null);

    // Form states
    const [isOnline, setIsOnline] = useState(false);
    const [price, setPrice] = useState("");
    const [experience, setExperience] = useState("");
    const [specialtyId, setSpecialtyId] = useState("");
    const [specialtyEn, setSpecialtyEn] = useState("");

    // Image upload
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('doctors')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                setDoctor(data);
                setIsOnline(data.is_online);
                setPrice(data.price?.toString() || "");
                setExperience(data.experience_years?.toString() || "");
                setSpecialtyId(data.specialty_id || "");
                setSpecialtyEn(data.specialty_en || "");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Gagal memuat profil dokter.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!doctor) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('doctors')
                .update({
                    is_online: isOnline,
                    price: parseInt(price) || 0,
                    experience_years: parseInt(experience) || 0,
                    specialty_id: specialtyId,
                    specialty_en: specialtyEn,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', doctor.id);

            if (error) throw error;
            toast.success("Profil berhasil diperbarui!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Gagal menyimpan perubahan.");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${doctor.id}-${Date.now()}.${fileExt}`;
        const filePath = `doctor-avatars/${fileName}`;

        try {
            // 1. Upload to Storage
            // Ideally we should have a 'avatars' bucket or folder
            const { error: uploadError } = await supabase.storage
                .from('wound-photos') // Using existing bucket for now, ideally separate 'avatars'
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('wound-photos')
                .getPublicUrl(filePath);

            // 3. Update Doctor Record
            const { error: dbError } = await supabase
                .from('doctors')
                .update({ image_url: publicUrl })
                .eq('id', doctor.id);

            if (dbError) throw dbError;

            // 4. Update local state
            setDoctor({ ...doctor, image_url: publicUrl });
            toast.success("Foto profil berhasil diubah!");

        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Gagal mengupload foto.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Memuat profil...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Pengaturan Profil</h2>
                <p className="text-muted-foreground">Kelola informasi publik dan status praktik Anda.</p>
            </div>

            {/* Online Status Card */}
            <Card className="border-l-4 border-l-primary/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle>Status Praktik</CardTitle>
                        <CardDescription>
                            {isOnline ? "Anda sedang ONLINE dan terlihat oleh pasien." : "Anda sedang OFFLINE. Pasien tidak dapat memilih Anda."}
                        </CardDescription>
                    </div>
                    <Switch checked={isOnline} onCheckedChange={setIsOnline} />
                </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Col: Photo & Basic Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Foto Profil</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <Avatar className="h-32 w-32 border-4 border-slate-100 dark:border-slate-800">
                                    <AvatarImage src={doctor?.image_url} className="object-cover" />
                                    <AvatarFallback className="text-4xl">{doctor?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                                >
                                    {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                            </div>
                            <p className="text-sm text-center text-muted-foreground">
                                Klik pada foto untuk mengubah.<br />JPG, PNG atau WEBP. Max 2MB.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Details Form */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Dokter</CardTitle>
                            <CardDescription>Informasi ini akan tampil di kartu nama Anda.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nama Lengkap (Read-only)</Label>
                                <Input value={doctor?.name} disabled className="bg-slate-50 dark:bg-slate-900" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Spesialisasi (ID)</Label>
                                    <Input value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)} placeholder="Contoh: Spesialis Kulit" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Specialty (EN)</Label>
                                    <Input value={specialtyEn} onChange={(e) => setSpecialtyEn(e.target.value)} placeholder="Example: Dermatologist" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Pengalaman (Tahun)</Label>
                                    <Input
                                        type="number"
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Biaya Konsultasi (Rp)</Label>
                                    <Input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end border-t pt-6">
                            <Button onClick={handleSave} disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan Perubahan
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
