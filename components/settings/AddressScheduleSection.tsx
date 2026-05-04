"use client";

import { HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import type { Business, Schedule } from "@/types/business.types";

const REGIONS = ["Región Metropolitana"];
const COMUNAS = ["Providencia", "Santiago Centro", "Las Condes"];

const INITIAL_HOURS = [
  { day: "Lunes", open: "11:00", close: "20:30", closed: false },
  { day: "Martes", open: "11:00", close: "20:30", closed: false },
  { day: "Miércoles", open: "11:00", close: "20:30", closed: false },
  { day: "Jueves", open: "11:00", close: "20:30", closed: false },
  { day: "Viernes", open: "11:00", close: "20:30", closed: false },
  { day: "Sábado", open: "10:00", close: "20:30", closed: false },
  { day: "Domingo", open: "00:00", close: "00:00", closed: true },
];

interface AddressScheduleSectionProps {
  business: Business | null;
  schedule: Schedule;
  onScheduleChange: (updater: (prev: Schedule) => Schedule) => void;
}

export function AddressScheduleSection({
  business,
  schedule,
  onScheduleChange,
}: AddressScheduleSectionProps) {
  return (
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
                          onScheduleChange((prev) => ({
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
  );
}
