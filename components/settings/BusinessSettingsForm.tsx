"use client";

import React, { useState, useEffect } from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateBusiness } from "@/actions/business.action";
import type { Business, BusinessSettingsState, Schedule } from "@/types/business.types";
import { BusinessInfoSection } from "./BusinessInfoSection";
import { AddressScheduleSection } from "./AddressScheduleSection";

interface BusinessSettingsFormProps {
  profile: { id: string; business_name: string };
  business: Business | null;
  menuLogoUrl: string | null;
}

export function BusinessSettingsForm({ profile, business, menuLogoUrl }: BusinessSettingsFormProps) {
  const [state, formAction, isPending] = useActionState<BusinessSettingsState, FormData>(
    updateBusiness,
    { status: "idle", errors: {} }
  );

  const [descLength, setDescLength] = useState(70);
  const [businessType, setBusinessType] = useState(business?.business_type || "cafeteria");
  const [logoUrl] = useState<string | null>(menuLogoUrl);

  // Schedule state
  const [schedule, setSchedule] = useState<Schedule>(() => {
    if (business?.schedule) {
      const s = business.schedule as unknown as Schedule;
      const result: Record<string, { open: string; close: string; closed: boolean }> = {};
      for (const day of ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]) {
        const key = day.toLowerCase();
        result[day] = s[key] || { open: "", close: "", closed: day === "Domingo" };
      }
      return result;
    }
    const result: Record<string, { open: string; close: string; closed: boolean }> = {};
    result["Lunes"] = { open: "11:00", close: "20:30", closed: false };
    result["Martes"] = { open: "11:00", close: "20:30", closed: false };
    result["Miércoles"] = { open: "11:00", close: "20:30", closed: false };
    result["Jueves"] = { open: "11:00", close: "20:30", closed: false };
    result["Viernes"] = { open: "11:00", close: "20:30", closed: false };
    result["Sábado"] = { open: "10:00", close: "20:30", closed: false };
    result["Domingo"] = { open: "00:00", close: "00:00", closed: true };
    return result;
  });

  // Handle toast on state change
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <form action={formAction} className="space-y-10">
      <BusinessInfoSection
        profile={profile}
        business={business}
        logoUrl={logoUrl}
        descLength={descLength}
        businessType={businessType}
        onDescLengthChange={setDescLength}
        onBusinessTypeChange={setBusinessType}
      />

      <AddressScheduleSection
        business={business}
        schedule={schedule}
        onScheduleChange={setSchedule}
      />

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-3 pt-6">
        <Button type="reset" variant="ghost" className="text-[#114821] h-10 font-bold cursor-pointer hover:bg-transparent" onClick={handleReset}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#CDF545] text-[#114821] h-10 font-bold px-4 transition-all rounded-lg cursor-pointer disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}