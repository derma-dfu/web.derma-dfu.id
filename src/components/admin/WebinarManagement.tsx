"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
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
    Calendar03Icon,
    LinkSquare02Icon,
    Image02Icon
} from "hugeicons-react";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { useLanguage } from '@/contexts/LanguageContext';

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
    is_active: boolean;
    created_at: string;
};

export const WebinarManagement = () => {
    const { t } = useLanguage();
    const [webinars, setWebinars] = useState<Webinar[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Form State
    const [formData, setFormData] = useState<Partial<Webinar>>({
        title: "",
        description: "",
        date: "",
        time: "",
        platform: "Via Zoom",
        speakers: [],
        moderator: "",
        price: "GRATIS",
        image_url: "",
        registration_url: "",
        is_active: true,
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempSpeaker, setTempSpeaker] = useState<Speaker>({ name: "", role: "" });

    // Fetch Webinars
    const fetchWebinars = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("webinars")
            .select("*")
            .order("date", { ascending: false });

        if (error) {
            toast({
                title: "Error fetching webinars",
                description: error.message,
                variant: "destructive",
            });
        } else {
            // Safe cast for speakers jsonb
            const formattedData = data?.map(item => ({
                ...item,
                speakers: item.speakers as unknown as Speaker[]
            })) || [];
            setWebinars(formattedData);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchWebinars();
    }, []);

    // Handle Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `webinars/${fileName}`;

        setIsSubmitting(true);
        const { error: uploadError } = await supabase.storage
            .from('webinar-images') // Ensure this bucket exists or use a generic one
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
            .from('webinar-images')
            .getPublicUrl(filePath);

        setFormData(prev => ({ ...prev, image_url: publicUrl }));
        setIsSubmitting(false);
    };

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            ...formData,
            title: formData.title || "",
            date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
            time: formData.time || "",
            platform: formData.platform || "Via Zoom",
            speakers: formData.speakers as unknown as Json,
            is_active: formData.is_active ?? true
        };

        let error;

        if (editingId) {
            const { error: updateError } = await supabase
                .from("webinars")
                .update(payload)
                .eq("id", editingId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from("webinars")
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
                description: `Webinar ${editingId ? "updated" : "created"} successfully.`,
            });
            setIsDialogOpen(false);
            fetchWebinars();
            resetForm();
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this webinar?")) return;

        const { error } = await supabase
            .from("webinars")
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
                description: "Webinar deleted successfully.",
            });
            fetchWebinars();
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            date: "",
            time: "",
            platform: "Via Zoom",
            speakers: [],
            moderator: "",
            price: "GRATIS",
            image_url: "",
            registration_url: "",
            is_active: true,
        });
        setEditingId(null);
        setTempSpeaker({ name: "", role: "" });
    };

    const handleEdit = (webinar: Webinar) => {
        setFormData({
            ...webinar,
            // Convert ISO date back to YYYY-MM-DD for input if needed, depends on input type
            date: new Date(webinar.date).toISOString().split('T')[0]
        });
        setEditingId(webinar.id);
        setIsDialogOpen(true);
    };

    const addSpeaker = () => {
        if (tempSpeaker.name && tempSpeaker.role) {
            setFormData(prev => ({
                ...prev,
                speakers: [...(prev.speakers || []), tempSpeaker]
            }));
            setTempSpeaker({ name: "", role: "" });
        }
    };

    const removeSpeaker = (index: number) => {
        setFormData(prev => ({
            ...prev,
            speakers: prev.speakers?.filter((_, i) => i !== index)
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
                            {t({ id: 'Tambah Webinar', en: 'Add Webinar' })}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingId
                                    ? t({ id: 'Edit Webinar', en: 'Edit Webinar' })
                                    : t({ id: 'Tambah Webinar Baru', en: 'Add New Webinar' })}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Webinar Title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time (e.g., 13.00 - 16.00 WIB)</Label>
                                    <Input
                                        required
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Platform</Label>
                                    <Input
                                        required
                                        value={formData.platform}
                                        onChange={e => setFormData({ ...formData, platform: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Price</Label>
                                    <Input
                                        value={formData.price || ''}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="GRATIS or Rp 50.000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Moderator</Label>
                                    <Input
                                        value={formData.moderator || ''}
                                        onChange={e => setFormData({ ...formData, moderator: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            {/* Speakers Section */}
                            <div className="space-y-2 border p-4 rounded-lg bg-slate-50">
                                <Label>Speakers</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Name (e.g., Dr. John Doe)"
                                        value={tempSpeaker.name}
                                        onChange={e => setTempSpeaker({ ...tempSpeaker, name: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Role/Specialty"
                                        value={tempSpeaker.role}
                                        onChange={e => setTempSpeaker({ ...tempSpeaker, role: e.target.value })}
                                    />
                                    <Button type="button" onClick={addSpeaker} variant="secondary">Add</Button>
                                </div>
                                <ul className="space-y-2 mt-2">
                                    {formData.speakers?.map((speaker, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-white p-2 rounded border">
                                            <span className="text-sm">
                                                <strong>{speaker.name}</strong> - {speaker.role}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSpeaker(idx)}
                                                className="h-6 w-6 p-0 text-red-500"
                                            >
                                                <Delete02Icon className="h-4 w-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <Label>Google Form Link (Registration URL)</Label>
                                <div className="flex items-center gap-2">
                                    <LinkSquare02Icon className="h-5 w-5 text-slate-400" />
                                    <Input
                                        value={formData.registration_url || ''}
                                        onChange={e => setFormData({ ...formData, registration_url: e.target.value })}
                                        placeholder="https://forms.gle/..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Poster Image</Label>
                                <div className="flex items-center gap-4">
                                    {formData.image_url && (
                                        <div className="relative h-20 w-20 rounded-lg overflow-hidden border">
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
                                <Label>Active / Published</Label>
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loading03Icon className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Webinar"
                                )}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                <Table className="min-w-[800px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Registration Link</TableHead>
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
                        ) : webinars.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {t({ id: 'Belum ada data webinar.', en: 'No webinars found.' })}
                                </TableCell>
                            </TableRow>
                        ) : (
                            webinars.map((webinar) => (
                                <TableRow key={webinar.id}>
                                    <TableCell>
                                        <div className="h-12 w-12 relative rounded overflow-hidden bg-slate-100">
                                            {webinar.image_url ? (
                                                <Image
                                                    src={webinar.image_url}
                                                    alt={webinar.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <Image02Icon className="h-6 w-6 m-auto text-slate-400 absolute inset-0" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{new Date(webinar.date).toLocaleDateString()}</div>
                                        <div className="text-xs text-muted-foreground">{webinar.time}</div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate" title={webinar.title}>
                                        {webinar.title}
                                    </TableCell>
                                    <TableCell>
                                        {webinar.registration_url ? (
                                            <a
                                                href={webinar.registration_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                                            >
                                                <LinkSquare02Icon className="h-3 w-3" /> Link
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${webinar.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {webinar.is_active ? 'Active' : 'Draft'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(webinar)}
                                            >
                                                <PencilEdit02Icon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(webinar.id)}
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
