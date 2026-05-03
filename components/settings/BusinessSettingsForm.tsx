"use client";

import React, { useState, useEffect } from "react";
import { useActionState } from "react";

import { HelpCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import ImageUploader from "@/components/shared/ImageUploader";
import { toast } from "sonner";
import { updateBusiness } from "@/actions/business.action";
import type { Business, BusinessSettingsState, Schedule } from "@/types/business.types";

const REGIONS = ["Región Metropolitana"];
const COMUNAS = ["Providencia", "Santiago Centro", "Las Condes"];
const BUSINESS_TYPES = [
  { value: "cafeteria", label: "Cafetería" },
  { value: "restaurante", label: "Restaurante" },
  { value: "bar", label: "Bar" },
  { value: "pasteleria", label: "Pastelería" },
  { value: "otro", label: "Otro" },
];

const INITIAL_HOURS = [
  { day: "Lunes", open: "11:00", close: "20:30", closed: false },
  { day: "Martes", open: "11:00", close: "20:30", closed: false },
  { day: "Miércoles", open: "11:00", close: "20:30", closed: false },
  { day: "Jueves", open: "11:00", close: "20:30", closed: false },
  { day: "Viernes", open: "11:00", close: "20:30", closed: false },
  { day: "Sábado", open: "10:00", close: "20:30", closed: false },
  { day: "Domingo", open: "00:00", close: "00:00", closed: true },
];

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
  const [logoUrl, setLogoUrl] = useState<string | null>(menuLogoUrl);

  // Schedule state
  const [schedule, setSchedule] = useState<Schedule>(() => {
    if (business?.schedule) {
      const s = business.schedule as unknown as Schedule;
      // Convert day keys to capitalized for display
      const result: Record<string, { open: string; close: string; closed: boolean }> = {};
      for (const day of ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]) {
        const key = day.toLowerCase();
        result[day] = s[key] || { open: "", close: "", closed: day === "Domingo" };
      }
      return result;
    }
    // Default schedule
    const result: Record<string, { open: string; close: string; closed: boolean }> = {};
    INITIAL_HOURS.forEach((h) => {
      result[h.day] = { open: h.open, close: h.close, closed: h.closed };
    });
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
      {/* Sección 1: Configuración del negocio */}
      <Card>
        <CardContent className="p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[#1C1C1C]">Configuración del negocio</h2>
            <p className="text-sm text-[#58606E] mt-1">
              Cuéntanos un poco sobre tu local para empezar a personalizar tu espacio de trabajo.
            </p>
          </div>

          {/* Nombre del local */}
          <div className="space-y-2">
            <label htmlFor="businessName" className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]">
              ¿Cómo se llama tu local?
            </label>
            <Input
              id="businessName"
              name="businessName"
              defaultValue={profile.business_name || ""}
              className="border-[#E4E4E6] placeholder:text-[#58606E] h-12"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label htmlFor="description" className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]">
              Descripción del negocio
            </label>
            <Textarea
              id="description"
              name="description"
              defaultValue={business?.description || ""}
              className="border-[#E4E4E6] placeholder:text-[#58606E] h-11 min-h-20 resize-none"
              maxLength={70}
              onChange={(e) => setDescLength(e.target.value.length)}
            />
            <p className="text-right text-xs text-neutral-400">
              {descLength}/70
            </p>
          </div>

          {/* Tipo de negocio */}
          <div className="space-y-3">
            <label className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]">
              ¿Qué tipo de negocio tienes?
            </label>
            <input type="hidden" name="businessType" value={businessType} />
            <RadioGroup
              value={businessType}
              onValueChange={setBusinessType}
              className="grid grid-cols-3 md:grid-cols-5 gap-3"
            >
              {BUSINESS_TYPES.map((type) => (
                <div key={type.value} className="flex flex-col">
                  <RadioGroupItem value={type.value} id={`type-${type.value}`} className="sr-only peer" />
                  <label
                    htmlFor={`type-${type.value}`}
                    className="flex items-center justify-center gap-2.5 p-4 text-center border-2 border-[#E4E4E6] rounded-lg cursor-pointer hover:border-[#114821] hover:bg-white peer-data-[state=checked]:border-[#114821] peer-data-[state=checked]:shadow-inner transition-all h-12"
                  >
                    <span className="text-sm font-medium text-[#58606E]">{type.label}</span>
                    <CheckCircle2 className="text-[#114821]" />
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <ImageUploader
            label="Logo del negocio (opcional)"
            imagePath="logos"
            imageUrl={logoUrl ?? ""}
            onImageUploaded={() => {}}
          />
        </CardContent>
      </Card>

      {/* Sección 2: Dirección y horarios */}
      <Card>
        <CardContent className="p-8 space-y-8">
          <h2 className="text-2xl font-bold text-[#1C1C1C]">Dirección y horarios de atención</h2>

          {/* Dirección */}
          <div className="space-y-2">
            <label htmlFor="address" className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]">
              Dirección del local <HelpCircle className="h-3.5 w-3.5 text-neutral-400" />
            </label>
            <Input
              id="address"
              name="address"
              defaultValue={business?.address || ""}
              className="bg-[#FAFAFA] border-neutral-200 placeholder:text-neutral-400 h-11"
            />
          </div>

          {/* Región y Comuna */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2 flex flex-col gap-2">
              <label className="text-base font-semibold text-[#1C1C1C]">Región</label>
              <Select name="region" defaultValue={business?.region || "Región Metropolitana"}>
                <SelectTrigger className="bg-white border-neutral-200 w-80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex flex-col gap-2">
              <label className="text-base font-semibold text-[#1C1C1C]">Comuna</label>
              <Select name="comuna" defaultValue={business?.comuna || "Providencia"}>
                <SelectTrigger className="bg-white border-neutral-200 w-80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMUNAS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mostrar dirección en menú digital */}
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <label htmlFor="showAddressOnMenu" className="text-base font-semibold cursor-pointer text-[#1C1C1C]">
                Mostrar dirección en el menú digital
              </label>
              <p className="text-sm text-[#58606E] mt-1">
                Aparece en el pie de página del menú para que los clientes puedan ubicarte.
              </p>
            </div>
            <Switch
              id="showAddressOnMenu"
              name="showAddressOnMenu"
              defaultChecked={business?.show_address ?? false}
              className="data-[state=checked]:bg-[#388E3C]"
            />
          </div>

          {/* Horarios de atención */}
          <div className="rounded">
            <h3 className="text-base font-semibold mb-5">Horarios de atención</h3>
            <Table className="border">
              <TableHeader className="bg-[#F5F5F5]">
                <TableRow>
                  <TableHead className="w-30">Día</TableHead>
                  <TableHead>Apertura</TableHead>
                  <TableHead>Cierre</TableHead>
                  <TableHead className="w-25">¿Cerrado?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INITIAL_HOURS.map((row) => {
                  const daySchedule = schedule[row.day] || { open: row.open, close: row.close, closed: row.closed };
                  return (
                    <TableRow key={row.day} className={daySchedule.closed ? "bg-[#FAFAFA]" : ""}>
                      <TableCell className="font-medium text-neutral-700">{row.day}</TableCell>
                      <TableCell>
                        <Input
                          name={`opening-${row.day}`}
                          defaultValue={daySchedule.open}
                          className={`w-20 h-9 text-center bg-white ${daySchedule.closed ? "text-neutral-400" : ""}`}
                          disabled={daySchedule.closed}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          name={`closing-${row.day}`}
                          defaultValue={daySchedule.close}
                          className={`w-20 h-9 text-center bg-white ${daySchedule.closed ? "text-neutral-400" : ""}`}
                          disabled={daySchedule.closed}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          name={`closed-${row.day}`}
                          defaultChecked={daySchedule.closed}
                          className="data-[state=checked]:bg-[#388E3C]"
                          onCheckedChange={(checked) => {
                            setSchedule((prev) => ({
                              ...prev,
                              [row.day]: { ...prev[row.day], closed: checked },
                            }));
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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