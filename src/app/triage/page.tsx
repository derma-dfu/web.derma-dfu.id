"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, AlertTriangle, CheckCircle, AlertCircle, Ruler, X, ArrowRight, ShoppingBag } from "lucide-react";
import { Loading03Icon } from "hugeicons-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CameraCapture } from "@/components/triage/CameraCapture";
import { ReferralModal } from "@/components/triage/ReferralModal";
import { ProductRecommendations } from "@/components/triage/ProductRecommendations";
import Link from "next/link";

// ONNX helpers
import { loadDFUModels, inferDFU } from "@/lib/dfu-onnx";

// Supabase
import { createClient } from "@/lib/supabase/client";

type TriageColor = "red" | "yellow" | "green";
const CLASS_IDX = { NONE: 0, INF: 1, ISCH: 2, BOTH: 3 } as const;

// Weights for AI score (internal)
const W_ISC = 0.45;
const W_INF = 0.45;
const W_AREA = 0.10;

interface TriageFormData {
    photo?: File;
    hasScaleCard: boolean;
    hasFever: boolean;
    hasSmellPus: boolean;
    hasSpreadingRedness: boolean;
    hasRestPain: boolean;
    hasFootPulse: boolean;
    woundDuration: string;
    woundLocation: string;
    diabetesHistory: string;
    kidneyCondition: string;
    abiValue: string;
    hasBlackColdSkin: boolean;
    notes: string;
}

async function makePreviewObjectURL(file: File, maxDim = 1280): Promise<string> {
    try {
        const bmp = await createImageBitmap(file);
        const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
        const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = true; ctx.drawImage(bmp, 0, 0, w, h);
        const blob = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/jpeg", 0.85));
        return URL.createObjectURL(blob);
    } catch {
        return URL.createObjectURL(file);
    }
}

async function ensureModelReadyOnce() {
    const g = globalThis as any;
    if (!g.__dfuLoadP) g.__dfuLoadP = loadDFUModels();
    await g.__dfuLoadP;
}

export default function TriagePage() {
    const router = useRouter();
    const supabase = createClient();

    const [formData, setFormData] = useState<TriageFormData>({
        hasScaleCard: false, hasFever: false, hasSmellPus: false, hasSpreadingRedness: false,
        hasRestPain: false, hasFootPulse: true, woundDuration: "", woundLocation: "",
        diabetesHistory: "", kidneyCondition: "none", abiValue: "", hasBlackColdSkin: false, notes: "",
    });

    const [preview, setPreview] = useState<string | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentTriageId, setCurrentTriageId] = useState<string | null>(null);

    // Calibration
    const imgRef = useRef<HTMLImageElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const [measuring, setMeasuring] = useState(false);
    const [p1, setP1] = useState<{ x: number; y: number; naturalX: number; naturalY: number } | null>(null);
    const [p2, setP2] = useState<{ x: number; y: number; naturalX: number; naturalY: number } | null>(null);
    const [pxDist, setPxDist] = useState<number | null>(null);
    const [unit, setUnit] = useState<"mm" | "cm">("cm");
    const [realLen, setRealLen] = useState<number>(3);

    // Results
    const [triageResult, setTriageResult] = useState<TriageColor | null>(null);
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [modelReady, setModelReady] = useState(false);
    const [loading, setLoading] = useState(false);

    const [publicSummary, setPublicSummary] = useState<{
        pInfPct?: number;
        pIscPct?: number;
        areaPx?: number;
        areaPct?: number;
        areaCm2?: number | null;
        why: string[];
        what: string[];
    } | null>(null);

    const inFlightRef = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Translation helper
    const t = (id: string, en: string) => id; // Indonesian by default

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [preview, blobUrl]);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setCurrentUser(user);
        }
    };

    const handlePhotoUpload = async (file: File) => {
        setFormData({ ...formData, photo: file });
        const url = await makePreviewObjectURL(file);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(url);
        setTriageResult(null);
        setPublicSummary(null);
        setP1(null);
        setP2(null);
        setPxDist(null);
    };

    const handleCameraCapture = (file: File) => {
        handlePhotoUpload(file);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await handlePhotoUpload(file);
        }
    };

    // Compute mm_per_px from calibration
    const mmPerPx = (): number | null => {
        if (!pxDist || pxDist <= 0) return null;
        const lenMm = unit === "mm" ? realLen : realLen * 10;
        return lenMm / pxDist;
    };

    const runDFUAnalysis = async () => {
        if (!formData.photo || !preview || inFlightRef.current) return;
        inFlightRef.current = true;
        setLoading(true);
        setTriageResult(null);
        setPublicSummary(null);

        try {
            await ensureModelReadyOnce();
            setModelReady(true);

            const calibMmPx = mmPerPx();
            const output = await inferDFU(preview, { mmPerPx: calibMmPx ?? undefined });

            // Determine triage color based on clinical + AI
            const { triage, summary } = determineTriage(output);

            setTriageResult(triage);
            setPublicSummary(summary);

            // Save to database if user is logged in
            if (currentUser) {
                await saveTriageToDatabase(triage, output, summary);
            }

            toast.success(t("Analisis selesai", "Analysis complete"));
        } catch (err: any) {
            console.error("DFU analysis error:", err);
            toast.error(t("Gagal menganalisis gambar", "Failed to analyze image"));
        } finally {
            setLoading(false);
            inFlightRef.current = false;
        }
    };

    const determineTriage = (output: any): { triage: TriageColor; summary: any } => {
        const why: string[] = [];
        const what: string[] = [];

        // Extract values from nested output
        const pInf = output.infection.pPresent;
        const pIsc = output.ischaemia.prob;
        const areaPx = output.seg.areaPx;
        const areaFrac = output.seg.areaFrac;
        const areaCm2 = output.seg.areaCm2;
        const topIdx = output.infection.topIdx;

        // Clinical danger signs → RED
        const hasClinicalDanger = formData.hasFever || formData.hasSmellPus ||
            formData.hasSpreadingRedness || formData.hasBlackColdSkin ||
            !formData.hasFootPulse;

        if (hasClinicalDanger) {
            why.push("Tanda klinis bahaya terdeteksi");
            what.push("Segera ke IGD atau fasilitas kesehatan terdekat");
            return {
                triage: "red",
                summary: {
                    pInfPct: Math.round(pInf * 100),
                    pIscPct: Math.round(pIsc * 100),
                    areaPx: areaPx,
                    areaPct: Math.round(areaFrac * 100),
                    areaCm2: areaCm2,
                    why, what
                }
            };
        }

        // High ischaemia probability → RED
        if (pIsc >= 0.6) {
            why.push("Risiko iskemia tinggi (kurang aliran darah)");
            what.push("Konsultasi segera dengan dokter spesialis");
            return {
                triage: "red",
                summary: {
                    pInfPct: Math.round(pInf * 100),
                    pIscPct: Math.round(pIsc * 100),
                    areaPx: areaPx,
                    areaPct: Math.round(areaFrac * 100),
                    areaCm2: areaCm2,
                    why, what
                }
            };
        }

        // Both infection and ischaemia → RED
        if (topIdx === CLASS_IDX.BOTH) {
            why.push("AI mendeteksi kombinasi infeksi dan iskemia");
            what.push("Perlu penanganan multidisiplin");
            return {
                triage: "red",
                summary: {
                    pInfPct: Math.round(pInf * 100),
                    pIscPct: Math.round(pIsc * 100),
                    areaPx: areaPx,
                    areaPct: Math.round(areaFrac * 100),
                    areaCm2: areaCm2,
                    why, what
                }
            };
        }

        // Moderate infection or ischaemia → YELLOW
        if (pInf >= 0.4 || pIsc >= 0.3) {
            why.push("Risiko infeksi/iskemia sedang");
            what.push("Konsultasi dengan perawat luka atau dokter");
            return {
                triage: "yellow",
                summary: {
                    pInfPct: Math.round(pInf * 100),
                    pIscPct: Math.round(pIsc * 100),
                    areaPx: areaPx,
                    areaPct: Math.round(areaFrac * 100),
                    areaCm2: areaCm2,
                    why, what
                }
            };
        }

        // Small wound, low risk → GREEN
        why.push("Risiko rendah berdasarkan AI dan data klinis");
        what.push("Perawatan mandiri dengan panduan");
        return {
            triage: "green",
            summary: {
                pInfPct: Math.round(pInf * 100),
                pIscPct: Math.round(pIsc * 100),
                areaPx: areaPx,
                areaPct: Math.round(areaFrac * 100),
                areaCm2: areaCm2,
                why, what
            }
        };
    };

    const saveTriageToDatabase = async (triage: TriageColor, output: any, summary: any) => {
        try {
            // Upload photo to storage
            let photoUrl = null;
            if (formData.photo) {
                const fileName = `${currentUser.id}/${Date.now()}.jpg`;
                const { data, error } = await supabase.storage
                    .from("wound-photos")
                    .upload(fileName, formData.photo);
                if (!error && data) {
                    const { data: urlData } = supabase.storage
                        .from("wound-photos")
                        .getPublicUrl(fileName);
                    photoUrl = urlData.publicUrl;
                }
            }

            // Extract values safely
            const infection = output.infection;
            const ischaemia = output.ischaemia;
            const seg = output.seg;
            const topProb = infection.probs[infection.topIdx];
            const topClassName = infection.labels[infection.topIdx];

            // Insert triage record
            const { data, error } = await supabase
                .from("triage_records")
                .insert({
                    user_id: currentUser.id,
                    photo_url: photoUrl,
                    has_scale_card: formData.hasScaleCard,
                    triage_result: triage,
                    has_fever: formData.hasFever,
                    has_smell_pus: formData.hasSmellPus,
                    has_spreading_redness: formData.hasSpreadingRedness,
                    has_rest_pain: formData.hasRestPain,
                    has_foot_pulse: formData.hasFootPulse,
                    has_black_cold_skin: formData.hasBlackColdSkin,
                    wound_duration: formData.woundDuration ? parseInt(formData.woundDuration) : null,
                    wound_location: formData.woundLocation || null,
                    diabetes_history: formData.diabetesHistory || null,
                    kidney_condition: formData.kidneyCondition,
                    abi_value: formData.abiValue || null,
                    notes: formData.notes || null,
                    infection_class: infection.topIdx,
                    infection_prob: infection.pPresent?.toString(),
                    ischaemia_prob: ischaemia.prob?.toString(),
                    top_class_name: topClassName,
                    top_class_prob: topProb?.toString(),
                    wound_area_px: seg.areaPx,
                    wound_area_pct: seg.areaFrac?.toString(),
                    wound_area_cm2: seg.areaCm2?.toString(),
                    calibration_mm_per_px: mmPerPx()?.toString(),
                    model_gated: ischaemia.gated,
                    ai_summary: summary,
                })
                .select()
                .single();

            if (!error && data) {
                setCurrentTriageId(data.id);
            } else {
                console.error("Supabase insert error:", error);
                toast.error(t("Gagal menyimpan data", "Failed to save data"));
            }
        } catch (err) {
            console.error("Error saving triage:", err);
            toast.error(t("Gagal menyimpan rujukan", "Failed to save referral"));
        }
    };

    const handleSaveReferral = async (facility: string, scheduledDate: string, consultationType: string) => {
        if (!currentTriageId) {
            toast.error(t("Belum ada hasil triage", "No triage result yet"));
            return;
        }

        try {
            // Check if it's a teleconsultation with doctor selection
            let doctorId = null;
            if (facility.startsWith("DOCTOR:")) {
                doctorId = facility.replace("DOCTOR:", "");
                facility = "Teleconsultation";
            }

            const { data, error } = await supabase
                .from("referrals")
                .insert({
                    triage_id: currentTriageId,
                    doctor_id: doctorId,
                    facility: facility,
                    consultation_type: consultationType,
                    scheduled_date: scheduledDate || null,
                    status: "pending",
                })
                .select()
                .single();

            if (error) throw error;

            toast.success(t("Rujukan berhasil disimpan", "Referral saved successfully"));

            // If teleconsultation, redirect to chat
            if (consultationType === "teleconsultation" && data) {
                router.push(`/chat/${data.id}`);
            }
        } catch (err) {
            console.error("Error saving referral:", err);
            toast.error(t("Gagal menyimpan rujukan", "Failed to save referral"));
        }
    };

    const getTriageColorClass = (color: TriageColor) => {
        switch (color) {
            case "red": return "bg-red-500 text-white";
            case "yellow": return "bg-yellow-500 text-black";
            case "green": return "bg-green-500 text-white";
        }
    };

    const getTriageTitle = (color: TriageColor) => {
        switch (color) {
            case "red": return t("MERAH - Perlu Penanganan Segera", "RED - Immediate Attention Required");
            case "yellow": return t("KUNING - Perlu Konsultasi", "YELLOW - Consultation Needed");
            case "green": return t("HIJAU - Perawatan Mandiri", "GREEN - Self-Care Possible");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Photo & Capture (Sticky on Desktop) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="lg:sticky lg:top-24 border-primary/20 shadow-md overflow-hidden">
                            <div className="bg-primary/5 p-4 border-b border-primary/10">
                                <h2 className="font-semibold text-primary flex items-center gap-2">
                                    <Camera className="h-5 w-5" />
                                    {t("Foto Luka", "Wound Photo")}
                                </h2>
                            </div>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <Button onClick={() => setShowCameraModal(true)} variant="outline" className="h-20 flex flex-col gap-2 hover:bg-primary/5 hover:text-primary border-dashed">
                                        <Camera className="h-6 w-6" />
                                        {t("Ambil Foto", "Take Photo")}
                                    </Button>
                                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-20 flex flex-col gap-2 hover:bg-primary/5 hover:text-primary border-dashed">
                                        <Upload className="h-6 w-6" />
                                        {t("Unggah", "Upload")}
                                    </Button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                {preview ? (
                                    <div
                                        className={`relative rounded-lg overflow-hidden border bg-slate-100 ${measuring ? 'cursor-crosshair' : ''}`}
                                        onClick={(e) => {
                                            if (!measuring || !imgRef.current) return;
                                            const rect = imgRef.current.getBoundingClientRect();
                                            const x = e.clientX - rect.left;
                                            const y = e.clientY - rect.top;

                                            // Convert to natural scale for calculation
                                            const scaleX = imgRef.current.naturalWidth / rect.width;
                                            const scaleY = imgRef.current.naturalHeight / rect.height;
                                            const naturalX = x * scaleX;
                                            const naturalY = y * scaleY;

                                            if (!p1) {
                                                setP1({ x, y, naturalX, naturalY });
                                                setP2(null);
                                                setPxDist(null);
                                            } else {
                                                setP2({ x, y, naturalX, naturalY });
                                                // Calculate distance in natural pixels
                                                const dx = naturalX - p1.naturalX;
                                                const dy = naturalY - p1.naturalY;
                                                const dist = Math.sqrt(dx * dx + dy * dy);
                                                setPxDist(dist);
                                                setMeasuring(false); // Stop measuring after 2nd point
                                            }
                                        }}
                                    >
                                        <img
                                            ref={imgRef}
                                            src={preview}
                                            alt="Preview"
                                            className="w-full object-contain max-h-[400px]"
                                            draggable={false}
                                        />

                                        {/* Overlay Layer */}
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                            {p1 && (
                                                <circle cx={p1.x} cy={p1.y} r="4" fill="#ef4444" stroke="white" strokeWidth="2" />
                                            )}
                                            {p2 && (
                                                <circle cx={p2.x} cy={p2.y} r="4" fill="#ef4444" stroke="white" strokeWidth="2" />
                                            )}
                                            {p1 && p2 && (
                                                <line
                                                    x1={p1.x} y1={p1.y}
                                                    x2={p2.x} y2={p2.y}
                                                    stroke="#ef4444"
                                                    strokeWidth="2"
                                                    strokeDasharray="4"
                                                />
                                            )}
                                        </svg>

                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="absolute top-2 right-2 rounded-full shadow-sm w-8 h-8 z-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (preview) URL.revokeObjectURL(preview);
                                                setPreview(null);
                                                setFormData({ ...formData, photo: undefined });
                                                setP1(null);
                                                setP2(null);
                                                setPxDist(null);
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center bg-slate-50 text-slate-400">
                                        <div className="text-center p-4">
                                            <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">{t("Belum ada foto", "No photo selected")}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Calibration */}
                                {preview && (
                                    <Collapsible className="border rounded-lg p-3 bg-slate-50/50">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-full justify-between flex items-center">
                                                <span className="flex items-center gap-2">
                                                    <Ruler className="h-4 w-4" />
                                                    {t("Kalibrasi Ukuran", "Size Calibration")}
                                                </span>
                                                <ArrowRight className="h-3 w-3 rotate-90" />
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="space-y-4 pt-4">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={realLen}
                                                    onChange={(e) => setRealLen(parseFloat(e.target.value) || 0)}
                                                    className="w-20"
                                                />
                                                <Select value={unit} onValueChange={(v) => setUnit(v as "mm" | "cm")}>
                                                    <SelectTrigger className="w-20">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="mm">mm</SelectItem>
                                                        <SelectItem value="cm">cm</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    size="sm"
                                                    variant={measuring ? "default" : "outline"}
                                                    onClick={() => {
                                                        const newMeasuring = !measuring;
                                                        setMeasuring(newMeasuring);
                                                        if (newMeasuring) {
                                                            // Start new measurement
                                                            setP1(null);
                                                            setP2(null);
                                                            setPxDist(null);
                                                            toast.info(t("Klik titik awal dan akhir pada gambar", "Click start and end points on image"));
                                                        }
                                                    }}
                                                    className="flex-1"
                                                >
                                                    {measuring ? t("Batal", "Cancel") : (pxDist ? t("Ukur Ulang", "Remeasure") : t("Ukur", "Measure"))}
                                                </Button>
                                            </div>
                                            {pxDist && (
                                                <p className="text-xs text-muted-foreground text-center">
                                                    {t(`Kalibrasi: ${mmPerPx()?.toFixed(3)} mm/px`, `Calibration: ${mmPerPx()?.toFixed(3)} mm/px`)}
                                                </p>
                                            )}
                                        </CollapsibleContent>
                                    </Collapsible>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Clinical Form */}
                    <div className="lg:col-span-8 space-y-6">
                        <Card className="border-none shadow-sm bg-transparent">
                            <div className="mb-2">
                                <h1 className="text-3xl font-bold text-slate-900">{t("Penilaian Klinis", "Clinical Assessment")}</h1>
                                <p className="text-slate-500">
                                    {t("Lengkapi data berikut untuk analisis yang akurat.", "Complete the following data for accurate analysis.")}
                                </p>
                            </div>
                        </Card>

                        {/* Symptoms Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t("Gejala & Tanda", "Symptoms & Signs")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wider">{t("Indikator Infeksi", "Infection Indicators")}</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border max-w-full">
                                                <Checkbox
                                                    id="fever"
                                                    checked={formData.hasFever}
                                                    onCheckedChange={(c) => setFormData({ ...formData, hasFever: !!c })}
                                                    className="mt-1"
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <Label htmlFor="fever" className="font-medium cursor-pointer">{t("Demam", "Fever")}</Label>
                                                    <p className="text-xs text-muted-foreground">{t("Suhu tubuh > 38°C", "Body temp > 38°C")}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border">
                                                <Checkbox
                                                    id="smellPus"
                                                    checked={formData.hasSmellPus}
                                                    onCheckedChange={(c) => setFormData({ ...formData, hasSmellPus: !!c })}
                                                    className="mt-1"
                                                />
                                                <Label htmlFor="smellPus" className="font-medium cursor-pointer pt-1">{t("Bau / Nanah", "Smell / Pus")}</Label>
                                            </div>
                                            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border">
                                                <Checkbox
                                                    id="redness"
                                                    checked={formData.hasSpreadingRedness}
                                                    onCheckedChange={(c) => setFormData({ ...formData, hasSpreadingRedness: !!c })}
                                                    className="mt-1"
                                                />
                                                <Label htmlFor="redness" className="font-medium cursor-pointer pt-1">{t("Kemerahan Meluas", "Spreading Redness")}</Label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wider">{t("Indikator Iskemia", "Ischaemia Indicators")}</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border">
                                                <Checkbox
                                                    id="blackSkin"
                                                    checked={formData.hasBlackColdSkin}
                                                    onCheckedChange={(c) => setFormData({ ...formData, hasBlackColdSkin: !!c })}
                                                    className="mt-1"
                                                />
                                                <Label htmlFor="blackSkin" className="font-medium cursor-pointer pt-1">{t("Kulit Hitam / Dingin", "Black / Cold Skin")}</Label>
                                            </div>
                                            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border">
                                                <Checkbox
                                                    id="footPulse"
                                                    checked={formData.hasFootPulse}
                                                    onCheckedChange={(c) => setFormData({ ...formData, hasFootPulse: !!c })}
                                                    className="mt-1"
                                                />
                                                <Label htmlFor="footPulse" className="font-medium cursor-pointer pt-1">{t("Nadi Kaki Terasa", "Foot Pulse Felt")}</Label>
                                            </div>
                                            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border">
                                                <Checkbox
                                                    id="restPain"
                                                    checked={formData.hasRestPain}
                                                    onCheckedChange={(c) => setFormData({ ...formData, hasRestPain: !!c })}
                                                    className="mt-1"
                                                />
                                                <Label htmlFor="restPain" className="font-medium cursor-pointer pt-1">{t("Nyeri Istirahat", "Rest Pain")}</Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Patient Context Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t("Konteks Pasien", "Patient Context")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Location */}
                                <div className="space-y-3">
                                    <Label className="text-base">{t("Lokasi Luka", "Wound Location")}</Label>
                                    <RadioGroup
                                        value={formData.woundLocation}
                                        onValueChange={(v) => setFormData({ ...formData, woundLocation: v })}
                                        className="grid grid-cols-3 gap-4"
                                    >
                                        <div className="relative">
                                            <RadioGroupItem value="toes" id="toes" className="peer sr-only" />
                                            <Label
                                                htmlFor="toes"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-full"
                                            >
                                                <span className="text-2xl mb-2">🦶</span>
                                                <span className="font-medium">{t("Jari", "Toes")}</span>
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="midfoot" id="midfoot" className="peer sr-only" />
                                            <Label
                                                htmlFor="midfoot"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-full"
                                            >
                                                <span className="text-2xl mb-2">👣</span>
                                                <span className="font-medium">{t("Tengah", "Mid")}</span>
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="heel" id="heel" className="peer sr-only" />
                                            <Label
                                                htmlFor="heel"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-full"
                                            >
                                                <span className="text-2xl mb-2">👠</span>
                                                <span className="font-medium">{t("Tumit", "Heel")}</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Kidney */}
                                    <div className="space-y-2">
                                        <Label>{t("Kondisi Ginjal", "Kidney Condition")}</Label>
                                        <Select
                                            value={formData.kidneyCondition}
                                            onValueChange={(v) => setFormData({ ...formData, kidneyCondition: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">{t("Normal", "Normal")}</SelectItem>
                                                <SelectItem value="mild">{t("Ringan", "Mild")}</SelectItem>
                                                <SelectItem value="severe">{t("Berat", "Severe")}</SelectItem>
                                                <SelectItem value="hemodialysis">{t("Hemodialisis", "Hemodialysis")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <Label>{t("Catatan", "Notes")}</Label>
                                        <Textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder={t("Opsional...", "Optional...")}
                                            className="min-h-[80px]"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Analyze Button - Sticky/Prominent */}
                        <div className="sticky bottom-4 z-20 pt-4">
                            <Button
                                className="w-full h-14 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all rounded-xl"
                                size="lg"
                                onClick={runDFUAnalysis}
                                disabled={!formData.photo || loading}
                            >
                                {loading ? (
                                    <>
                                        <Loading03Icon className="mr-2 h-6 w-6 animate-spin" />
                                        {t("Menganalisis Luka...", "Analyzing Wound...")}
                                    </>
                                ) : (
                                    <>
                                        {t("Analisis Sekarang", "Analyze Now")}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Results Section - Full Width Below */}
                {triageResult && publicSummary && (
                    <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-2xl font-bold">{t("Hasil Analisis", "Analysis Results")}</h2>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className={`${getTriageColorClass(triageResult)} shadow-lg border-0`}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-3 text-2xl">
                                        {triageResult === "red" && <AlertCircle className="h-8 w-8" />}
                                        {triageResult === "yellow" && <AlertTriangle className="h-8 w-8" />}
                                        {triageResult === "green" && <CheckCircle className="h-8 w-8" />}
                                        {getTriageTitle(triageResult)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    {/* AI Stats Cards */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center border border-white/10">
                                            <div className="text-2xl font-bold">{publicSummary.pInfPct}%</div>
                                            <div className="text-xs opacity-80 uppercase tracking-wider">{t("Infeksi", "Infection")}</div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center border border-white/10">
                                            <div className="text-2xl font-bold">{publicSummary.pIscPct}%</div>
                                            <div className="text-xs opacity-80 uppercase tracking-wider">{t("Iskemia", "Ischaemia")}</div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center border border-white/10">
                                            <div className="text-xl font-bold truncate">
                                                {publicSummary.areaCm2 ? publicSummary.areaCm2.toFixed(1) : '-'}
                                                <span className="text-sm font-normal ml-0.5">cm²</span>
                                            </div>
                                            <div className="text-xs opacity-80 uppercase tracking-wider">{t("Luas", "Area")}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 bg-white/10 rounded-xl p-4 border border-white/10">
                                        <div>
                                            <h4 className="font-bold flex items-center gap-2 mb-2">
                                                <AlertCircle className="h-4 w-4" />
                                                {t("Mengapa:", "Why:")}
                                            </h4>
                                            <ul className="space-y-1">
                                                {publicSummary.why.map((w, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm">
                                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                                                        {w}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-bold flex items-center gap-2 mb-2">
                                                <CheckCircle className="h-4 w-4" />
                                                {t("Rekomendasi:", "Recommendation:")}
                                            </h4>
                                            <ul className="space-y-1">
                                                {publicSummary.what.map((w, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm">
                                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                                                        {w}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Panel */}
                            <div className="space-y-6">
                                <Card className="h-full flex flex-col justify-center border-l-4 border-l-primary/50">
                                    <CardHeader>
                                        <CardTitle>{t("Langkah Selanjutnya", "Next Steps")}</CardTitle>
                                        <CardDescription>
                                            {t("Berdasarkan hasil analisis, kami menyarankan tindakan berikut:", "Based on analysis, we suggest:")}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {triageResult === "green" && (
                                            <>
                                                <ProductRecommendations t={t} />
                                                <div className="pt-4">
                                                    <Link href="/products" className="block w-full">
                                                        <Button className="w-full" size="lg">
                                                            <ShoppingBag className="mr-2 h-5 w-5" />
                                                            {t("Lihat Produk Perawatan", "View Care Products")}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                        {triageResult === "yellow" && (
                                            <div className="space-y-4">
                                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-yellow-800 text-sm">
                                                    {t(
                                                        "Kondisi ini memerlukan evaluasi profesional namun tidak darurat.",
                                                        "Condition requires professional evaluation but is not not emergency."
                                                    )}
                                                </div>
                                                <Button
                                                    size="lg"
                                                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                                                    onClick={() => setShowReferralModal(true)}
                                                >
                                                    <ArrowRight className="mr-2 h-5 w-5" />
                                                    {t("Jadwalkan Teleconsultasi", "Schedule Teleconsultation")}
                                                </Button>
                                            </div>
                                        )}
                                        {triageResult === "red" && (
                                            <div className="space-y-4">
                                                <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-800 text-sm font-medium flex items-center gap-3">
                                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                                    {t(
                                                        "PERHATIAN: Segera hubungi fasilitas kesehatan terdekat.",
                                                        "WARNING: Contact nearest medical facility immediately."
                                                    )}
                                                </div>
                                                <Button
                                                    size="lg"
                                                    variant="destructive"
                                                    className="w-full"
                                                    onClick={() => setShowReferralModal(true)}
                                                >
                                                    <AlertCircle className="mr-2 h-5 w-5" />
                                                    {t("Dapatkan Rujukan RS", "Get Hospital Referral")}
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CameraCapture
                open={showCameraModal}
                onOpenChange={setShowCameraModal}
                onCapture={handleCameraCapture}
                t={t}
            />

            <ReferralModal
                open={showReferralModal}
                onOpenChange={setShowReferralModal}
                onSave={handleSaveReferral}
                t={t}
            />
        </div>
    );
}
