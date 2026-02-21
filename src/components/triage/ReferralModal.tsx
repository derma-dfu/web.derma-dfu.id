import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoctorList } from "@/components/triage/DoctorList";
import { toast } from "sonner";

interface ReferralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (facility: string, scheduledDate: string, consultationType: string) => void;
  t: (id: string, en: string) => string;
  triageResult: "green" | "yellow" | "red" | null;
}

type ModalStep = "details" | "doctor-selection";

export function ReferralModal({ open, onOpenChange, onSave, t, triageResult }: ReferralModalProps) {
  const [step, setStep] = useState<ModalStep>("details");

  const [facility, setFacility] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  // Default logic based on triage result
  useEffect(() => {
    if (open) {
      if (triageResult === 'yellow') {
        // For Yellow, we default to teleconsultation and skip to doctor selection
        setStep("doctor-selection");
      } else {
        setStep("details");
      }
    }
  }, [open, triageResult]);

  const handleSaveReferral = () => {
    // For Red/Hospital referral
    if (!facility || !scheduledDate) return;

    onSave(facility, scheduledDate, "inperson");
    resetForm();
  };

  const handleDoctorSelect = (doctorId: string) => {
    // For Triage Yellow -> Teleconsultation
    // We pass DOCTOR: prefix as agreed for TriagePage to handle
    onSave(`DOCTOR:${doctorId}`, new Date().toISOString(), "teleconsultation");
    resetForm();
  };

  const resetForm = () => {
    setFacility("");
    setScheduledDate("");
    setStep("details");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); else onOpenChange(v); }}>
      <DialogContent className="rounded-2xl max-w-full sm:max-w-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold">
            {triageResult === 'red'
              ? t("Rujukan Rumah Sakit", "Hospital Referral")
              : step === 'doctor-selection'
                ? t("Pilih Dokter", "Select Doctor")
                : t("Jadwalkan Konsultasi", "Schedule Consultation")}
          </DialogTitle>
        </DialogHeader>

        {/* RED: Hospital Referral Form */}
        {triageResult === 'red' && (
          <div className="space-y-6 p-6 pt-2">
            <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200 rounded-xl text-sm border border-red-100 dark:border-red-900/20">
              <div className="shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
              </div>
              {t("Pilih fasilitas kesehatan terdekat untuk penanganan lanjutan.", "Select nearest health facility for further treatment.")}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-600 dark:text-slate-400">{t("Pilih Fasilitas Kesehatan", "Select Health Facility")}</Label>
                <Select value={facility} onValueChange={setFacility}>
                  <SelectTrigger className="rounded-xl h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20">
                    <SelectValue placeholder={t("Pilih RS / Klinik", "Select Hospital / Clinic")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rs1">{t("RS Umum Daerah - 5 km", "Regional General Hospital - 5 km")}</SelectItem>
                    <SelectItem value="rs2">{t("Klinik Diabetes Terpadu - 8 km", "Integrated Diabetes Clinic - 8 km")}</SelectItem>
                    <SelectItem value="rs3">{t("Puskesmas Kecamatan - 2 km", "District Health Center - 2 km")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 dark:text-slate-400">{t("Perkiraan Waktu Kunjungan", "Estimated Visit Time")}</Label>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="rounded-xl h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveReferral}
              className="w-full h-12 rounded-xl text-base font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all active:scale-[0.98]"
              disabled={!facility || !scheduledDate}
            >
              {t("Buat Surat Rujukan", "Create Referral Letter")}
            </Button>
          </div>
        )}

        {/* YELLOW: Doctor Selection */}
        {(triageResult === 'yellow' || step === 'doctor-selection') && triageResult !== 'red' && (
          <div className="p-6">
            <DoctorList
              onSelect={handleDoctorSelect}
              onCancel={() => onOpenChange(false)}
              t={t}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
