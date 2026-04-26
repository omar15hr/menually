'use client';

import React, { useState } from 'react';
import { HelpCircle, CheckCircle2 } from 'lucide-react';

// shadcn/ui components (sin el componente Form)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import PhotoUpload from '@/components/shared/PhotoUpload';
import XIcon from '@/components/icons/XIcon';
import CameraIcon from '@/components/icons/CameraIcon';
import { cn } from '@/lib/utils';

const REGIONS = ['Región Metropolitana'];
const COMUNAS = ['Providencia', 'Santiago Centro', 'Las Condes'];
const BUSINESS_TYPES = [
  { value: 'cafeteria', label: 'Cafetería' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'bar', label: 'Bar' },
  { value: 'pasteleria', label: 'Pastelería' },
  { value: 'otro', label: 'Otro' },
];

const INITIAL_HOURS = [
  { day: 'Lunes', opening: '11:00', closing: '20:30', closed: false },
  { day: 'Martes', opening: '11:00', closing: '20:30', closed: false },
  { day: 'Miércoles', opening: '11:00', closing: '20:30', closed: false },
  { day: 'Jueves', opening: '11:00', closing: '20:30', closed: false },
  { day: 'Viernes', opening: '11:00', closing: '20:30', closed: false },
  { day: 'Sábado', opening: '10:00', closing: '20:30', closed: false },
  { day: 'Domingo', opening: '00:00', closing: '00:00', closed: true },
];

export default function BusinessConfigurationPage() {
  const [descLength, setDescLength] = useState(70);
  const [businessType, setBusinessType] = useState('cafeteria');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Capturar valores de componentes custom que no usan inputs nativos por defecto
    data.businessType = businessType;

    console.log('Datos guardados nativamente:', data);
    // Lógica para enviar a tu API
  };

  return (
    <div className="grid md:grid-cols-[240px,1fr] gap-10 py-6 md:py-10 max-w-7xl mx-auto">
      {/* Main Content */}
      <div>
        <form onSubmit={handleSubmit} className="space-y-10">
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
                  defaultValue="Ej: La casita de bril"
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
                  defaultValue="Ej: Cafetería de especialidad en el corazón de Santiago, Granos de origen y pastelería artesanal."
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
                        <CheckCircle2 className='text-[#114821]' />
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Logo (Opcional) */}
              <div>
                <h3 className="text-base font-semibold mb-3">Logo del negocio (opcional)</h3>
                <PhotoUpload imagePath={"logos"} onPhotoUploaded={() => { }}>
                  <div
                    className={cn(
                      "flex gap-4 justify-center rounded-2xl p-4 cursor-pointer transition-colors items-center",
                      logoUrl
                        ? "border-[#E4E4E6] border-2"
                        : "border-dashed border-[#E4E4E6] border-2",
                    )}
                  >
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt="Image placeholder"
                        width={300}
                        height={300}
                        className="rounded-lg size-15"
                      />
                    ) : (
                      <span className="bg-[#E5E7EA] px-2.5 py-4 rounded-full">
                        <CameraIcon />
                      </span>
                    )}
                    <div className="text-sm w-full">
                      {!logoUrl ? (
                        <div className="">
                          <h2 className="text-[#1C1C1C] font-semibold">
                            Sube una imagen
                          </h2>
                          <p className="text-[#58606E]">
                            Recomendado 328 x 200px PNG.
                          </p>
                          <span className="text-[#25B205]">Seleccionar archivo</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[#58606E]">
                          <span>Archivo subido</span>
                          <XIcon />
                        </div>
                      )}
                    </div>
                  </div>
                </PhotoUpload>
              </div>
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
                  defaultValue="Av Condell 1190"
                  className="bg-[#FAFAFA] border-neutral-200 placeholder:text-neutral-400 h-11"
                />
              </div>

              {/* Región y Comuna */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2 flex flex-col gap-2">
                  <label className="text-base font-semibold text-[#1C1C1C]">Región</label>
                  <Select name="region" defaultValue="Región Metropolitana">
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
                  <Select name="comuna" defaultValue="Providencia">
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
                  <label htmlFor="showAddress" className="text-base font-semibold cursor-pointer text-[#1C1C1C]">
                    Mostrar dirección en el menú digital
                  </label>
                  <p className="text-sm text-[#58606E] mt-1">
                    Aparece en el pie de página del menú para que los clientes puedan ubicarte.
                  </p>
                </div>
                <Switch id="showAddress" name="showAddressOnMenu" defaultChecked className="data-[state=checked]:bg-[#388E3C]" />
              </div>

              {/* Horarios de atención */}
              <div className='rounded'>
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
                    {INITIAL_HOURS.map((row) => (
                      <TableRow key={row.day} className={row.closed ? 'bg-[#FAFAFA]' : ''}>
                        <TableCell className="font-medium text-neutral-700">{row.day}</TableCell>
                        <TableCell>
                          <Input
                            name={`opening-${row.day}`}
                            defaultValue={row.opening}
                            className={`w-20 h-9 text-center bg-white ${row.closed ? 'text-neutral-400' : ''}`}
                            disabled={row.closed}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            name={`closing-${row.day}`}
                            defaultValue={row.closing}
                            className={`w-20 h-9 text-center bg-white ${row.closed ? 'text-neutral-400' : ''}`}
                            disabled={row.closed}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            name={`closed-${row.day}`}
                            defaultChecked={row.closed}
                            className="data-[state=checked]:bg-[#388E3C]"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-6">
            <Button type="button" variant="ghost" className="ttext-[#114821] h-10 font-bold cursor-pointer hover:bg-transparent">
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#CDF545] text-[#114821] h-10 font-bold px-4 transition-all rounded-lg cursor-pointer"
            >
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}