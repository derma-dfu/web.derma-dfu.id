"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
    PlusSignIcon,
    PencilEdit02Icon,
    Delete02Icon,
    Loading03Icon,
    Image02Icon,
    UserIcon
} from "hugeicons-react";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

type Doctor = {
    id: string;
    name: string;
    role_id: string;
    role_en: string;
    specialty_id: string;
    specialty_en: string;
    image_url: string | null;
    bio_id: string | null;
    bio_en: string | null;
    experience_id: string | null;
    experience_en: string | null;
    credentials: string[] | null;
    is_active: boolean;
};

export const DoctorManagement = () => {
    const { t } = useLanguage();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Form State
    const [formData, setFormData] = useState<Partial<Doctor>>({
        name: "",
        role_id: "",
        role_en: "",
        specialty_id: "",
        specialty_en: "",
        image_url: "",
        bio_id: "",
        bio_en: "",
        experience_id: "",
        experience_en: "",
        credentials: [],
        is_active: true,
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempCredential, setTempCredential] = useState("");

    const [refreshKey, setRefreshKey] = useState(0);

    // Fetch Doctors - Defined inside useEffect to avoid dependency issues
    useEffect(() => {
        const fetchDoctors = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("doctors" as any)
                .select("*")
                .order("created_at", { ascending: true });

            if (error) {
                toast({
                    title: "Error fetching doctors",
                    description: error.message,
                    variant: "destructive",
                });
            } else {
                setDoctors((data as unknown as Doctor[]) || []);
            }
            setIsLoading(false);
        };

        fetchDoctors();
    }, [refreshKey, toast]);

    // Handle Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `doctors/${fileName}`;

        setIsSubmitting(true);
        // Ensure bucket exists or create it manually in Supabase if getting 404
        const { error: uploadError } = await supabase.storage
            .from('doctor-images')
            .upload(filePath, file);

        if (uploadError) {
            toast({
                title: "Upload Failed",
                description: uploadError.message,
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('doctor-images')
            .getPublicUrl(filePath);

        setFormData(prev => ({ ...prev, image_url: publicUrl }));
        setIsSubmitting(false);
    };

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Use English values if provided, otherwise fallback to Indonesian
        const payload = {
            ...formData,
            role_en: formData.role_en || formData.role_id,
            specialty_en: formData.specialty_en || formData.specialty_id,
            bio_en: formData.bio_en || formData.bio_id,
            experience_en: formData.experience_en || formData.experience_id,
            is_active: formData.is_active ?? true
        };

        let error;

        if (editingId) {
            const { error: updateError } = await supabase
                .from("doctors" as any)
                .update(payload)
                .eq("id", editingId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from("doctors" as any)
                .insert([payload]);
            error = insertError;
        }

        if (error) {
            toast({
                title: "Operation Failed",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: `Doctor ${editingId ? "updated" : "added"} successfully.`,
            });
            setIsDialogOpen(false);
            setRefreshKey(prev => prev + 1);
            resetForm();
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this doctor?")) return;

        const { error } = await supabase
            .from("doctors" as any)
            .delete()
            .eq("id", id);

        if (error) {
            toast({
                title: "Delete Failed",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Deleted",
                description: "Doctor deleted successfully.",
            });
            setRefreshKey(prev => prev + 1);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            role_id: "",
            role_en: "",
            specialty_id: "",
            specialty_en: "",
            image_url: "",
            bio_id: "",
            bio_en: "",
            experience_id: "",
            experience_en: "",
            credentials: [],
            is_active: true,
        });
        setEditingId(null);
        setTempCredential("");
    };

    const handleEdit = (doctor: Doctor) => {
        setFormData(doctor);
        setEditingId(doctor.id);
        setIsDialogOpen(true);
    };

    const addCredential = () => {
        if (tempCredential) {
            setFormData(prev => ({
                ...prev,
                credentials: [...(prev.credentials || []), tempCredential]
            }));
            setTempCredential("");
        }
    };

    const removeCredential = (index: number) => {
        setFormData(prev => ({
            ...prev,
            credentials: prev.credentials?.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                {/* Title removed, handled by layout */}
                <div className="flex-1"></div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusSignIcon className="mr-2 h-4 w-4" />
                            {t({ id: 'Tambah Dokter', en: 'Add Doctor' })}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingId
                                    ? t({ id: 'Edit Dokter', en: 'Edit Doctor' })
                                    : t({ id: 'Tambah Dokter Baru', en: 'Add New Doctor' })}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Info banner */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                                💡 {t({ id: 'Field English bersifat opsional. Jika dikosongkan, akan menggunakan teks Indonesia.', en: 'English fields are optional. If left empty, Indonesian text will be used.' })}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label>{t({ id: 'Nama (Gelar & Nama Lengkap)', en: 'Name (Title & Full Name)' })} *</Label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. dr. Andrew Suprayogi, Sp.PD."
                                    />
                                </div>

                                {/* Roles */}
                                <div className="space-y-2">
                                    <Label>{t({ id: 'Jabatan (ID)', en: 'Job Role (ID)' })} *</Label>
                                    <Input
                                        required
                                        value={formData.role_id}
                                        onChange={e => setFormData({ ...formData, role_id: e.target.value })}
                                        placeholder="e.g. Spesialis Penyakit Dalam"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t({ id: 'Jabatan (EN)', en: 'Job Role (EN)' })}</Label>
                                    <Input
                                        value={formData.role_en}
                                        onChange={e => setFormData({ ...formData, role_en: e.target.value })}
                                        placeholder={t({ id: 'Opsional - gunakan Indonesia jika kosong', en: 'Optional - uses Indonesian if empty' })}
                                    />
                                </div>

                                {/* Specialization */}
                                <div className="space-y-2">
                                    <Label>{t({ id: 'Spesialisasi (ID)', en: 'Specialization (ID)' })} *</Label>
                                    <Input
                                        required
                                        value={formData.specialty_id}
                                        onChange={e => setFormData({ ...formData, specialty_id: e.target.value })}
                                        placeholder="e.g. Diabetes & Metabolisme"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t({ id: 'Spesialisasi (EN)', en: 'Specialization (EN)' })}</Label>
                                    <Input
                                        value={formData.specialty_en}
                                        onChange={e => setFormData({ ...formData, specialty_en: e.target.value })}
                                        placeholder={t({ id: 'Opsional - gunakan Indonesia jika kosong', en: 'Optional - uses Indonesian if empty' })}
                                    />
                                </div>

                                {/* Experience */}
                                <div className="space-y-2">
                                    <Label>{t({ id: 'Pengalaman (ID)', en: 'Experience (ID)' })}</Label>
                                    <Input
                                        value={formData.experience_id || ''}
                                        onChange={e => setFormData({ ...formData, experience_id: e.target.value })}
                                        placeholder="e.g. 15+ Tahun"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t({ id: 'Pengalaman (EN)', en: 'Experience (EN)' })}</Label>
                                    <Input
                                        value={formData.experience_en || ''}
                                        onChange={e => setFormData({ ...formData, experience_en: e.target.value })}
                                        placeholder={t({ id: 'Opsional - gunakan Indonesia jika kosong', en: 'Optional - uses Indonesian if empty' })}
                                    />
                                </div>
                            </div>

                            {/* Credentials Section */}
                            <div className="space-y-2 border p-4 rounded-lg bg-slate-50">
                                <Label>Credentials / Degrees</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. Sp.PD"
                                        value={tempCredential}
                                        onChange={e => setTempCredential(e.target.value)}
                                    />
                                    <Button type="button" onClick={addCredential} variant="secondary">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.credentials?.map((cred, idx) => (
                                        <div key={idx} className="flex items-center bg-white px-3 py-1 rounded border shadow-sm text-sm">
                                            <span className="mr-2">{cred}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeCredential(idx)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Profile Photo</Label>
                                <div className="flex items-center gap-4">
                                    {formData.image_url && (
                                        <div className="relative h-24 w-24 rounded-full overflow-hidden border">
                                            <Image
                                                src={formData.image_url}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="max-w-xs"
                                    />
                                </div>
                                {isSubmitting && <p className="text-xs text-blue-500">Uploading image...</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={val => setFormData({ ...formData, is_active: val })}
                                />
                                <Label>Active / Visible</Label>
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loading03Icon className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Doctor"
                                )}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                <Table className="min-w-[700px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Photo</TableHead>
                            <TableHead>Name / Credentials</TableHead>
                            <TableHead>Specialty</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <Loading03Icon className="h-8 w-8 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : doctors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {t({ id: 'Belum ada data dokter.', en: 'No doctors found.' })}
                                </TableCell>
                            </TableRow>
                        ) : (
                            doctors.map((doctor) => (
                                <TableRow key={doctor.id}>
                                    <TableCell>
                                        <div className="h-12 w-12 relative rounded-full overflow-hidden bg-slate-100">
                                            {doctor.image_url ? (
                                                <Image
                                                    src={doctor.image_url}
                                                    alt={doctor.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <UserIcon className="h-6 w-6 m-auto text-slate-400 absolute inset-0" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold">{doctor.name}</div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {doctor.credentials?.slice(0, 3).map((c, i) => (
                                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">{doctor.specialty_id}</div>
                                        <div className="text-xs text-muted-foreground">{doctor.role_id}</div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                                            {doctor.experience_id}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${doctor.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {doctor.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(doctor)}
                                            >
                                                <PencilEdit02Icon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(doctor.id)}
                                            >
                                                <Delete02Icon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
