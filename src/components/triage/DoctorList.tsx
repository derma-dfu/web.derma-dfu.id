import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Doctor {
  id: string;
  name: string;
  specialty_id: string; // ID in ID
  specialty_en: string; // ID in EN
  experience_years: number;
  price: number;
  rating: number;
  is_online: boolean;
  image_url?: string;
}

interface DoctorListProps {
  onSelect: (doctorId: string) => void;
  onCancel: () => void;
  t: (id: string, en: string) => string;
}

export function DoctorList({ onSelect, onCancel, t }: DoctorListProps) {
  const supabase = createClient();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_active', true)
        .order('is_online', { ascending: false });

      if (error) throw error;

      if (data) {
        setDoctors(data as any);
      }
    } catch (error: any) {
      console.error("Error fetching doctors:", error);
      toast.error(t("Gagal memuat daftar dokter", "Failed to load doctor list"));
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground animate-pulse">{t("Memuat dokter tersedia...", "Loading available doctors...")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-5 max-h-[60vh] overflow-y-auto px-1 py-4 scrollbar-hide">
        {doctors.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed">
            <p className="text-muted-foreground">{t("Belum ada dokter tersedia saat ini", "No doctors available at the moment")}</p>
          </div>
        ) : (
          doctors.map((doctor) => (
            <div
              key={doctor.id}
              onClick={() => onSelect(doctor.id)}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 cursor-pointer hover:shadow-xl hover:border-primary/30 transition-all duration-300 ease-out hover:-translate-y-1"
            >
              <div className="flex items-start gap-5">
                {/* Avatar Section */}
                <div className="relative shrink-0">
                  <Avatar className="h-20 w-20 rounded-2xl border-2 border-white dark:border-slate-800 shadow-md group-hover:scale-105 transition-transform duration-500">
                    <AvatarImage src={doctor.image_url} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary rounded-2xl font-bold text-2xl">
                      {doctor.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {doctor.is_online && (
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                    </span>
                  )}
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors leading-tight">
                        {doctor.name}
                      </h4>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {t(doctor.specialty_id, doctor.specialty_en)}
                      </p>
                    </div>
                    {doctor.rating > 0 && (
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/20 shrink-0">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-500">{doctor.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{doctor.experience_years} {t("thn", "yrs")}</span>
                    </div>

                    {doctor.price && (
                      <div className="font-bold text-sm text-primary bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10">
                        {formatPrice(doctor.price)}
                      </div>
                    )}

                    <div className="ml-auto">
                      <div className="h-9 w-9 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center shadow-sm">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
