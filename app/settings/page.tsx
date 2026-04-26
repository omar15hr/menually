// app/configuracion/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Camera, HelpCircle, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Header */}
      <header className="border-b bg-white px-6 py-6 flex items-center justify-between">
        <Image src="/images/menually-logo.png" alt="Menually Logo" width={120} height={40} />
      </header>

      <div className='flex'>
        {/* Sidebar */}
        <aside className="p-6 px-18">
          <Link href="/dashboard" className="flex items-center gap-2 mb-6 text-sm text-[#114821] hover:text-black transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className='text-base font-semibold'>Volver</span>
          </Link>
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold px-1 text-[#1C1C1C]">Ajustes</h1>
            <nav className="space-y-1.5 text-sm text-neutral-700">
              <Link href="#" className="block px-3 py-1.5 rounded-md bg-transparent text-[#114821] text-sm font-semibold hover:underline">
                Configuración del negocio
              </Link>
              <Link href="#" className="block px-3 py-1.5 rounded-md bg-transparent transition-colors text-[#114821] text-sm font-semibold hover:underline">
                Datos de contacto
              </Link>
              <Link href="#" className="block px-3 py-1.5 rounded-md bg-transparent transition-colors text-[#114821] text-sm font-semibold hover:underline">
                Preferencias
              </Link>
            </nav>
          </div>
        </aside>

      <div className="grid md:grid-cols-[240px,1fr] gap-10 p-6 md:p-10 max-w-7xl mx-auto">
        {/* Main Content */}
        <main>
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
                  <label className="flex items-center gap-1.5 text-base font-semibold">
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
                          className="flex flex-col items-center justify-center gap-2 p-4 text-center border-2 border-neutral-100 bg-[#FAFAFA] rounded-xl cursor-pointer hover:border-[#81C784] hover:bg-white peer-data-[state=checked]:border-[#2E7D32] peer-data-[state=checked]:bg-[#E8F5E9] peer-data-[state=checked]:shadow-inner transition-all h-22.5"
                        >
                          {type.label === 'Cafetería' && (
                            <div className="h-10 w-10 flex items-center justify-center p-2 rounded-full border border-neutral-100 bg-white">
                              <span className="text-xl">☕</span>
                            </div>
                          )}
                          <span className="text-sm font-medium">{type.label}</span>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Logo (Opcional) */}
                <div>
                  <h3 className="text-base font-semibold mb-3">Logo del negocio (opcional)</h3>
                  <div className="border-2 border-dashed border-neutral-200 bg-[#FAFAFA] rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-neutral-300 transition-all">
                    <div className="p-3.5 bg-neutral-100 rounded-full">
                      <Camera className="h-7 w-7 text-neutral-400" />
                    </div>
                    <div className="text-sm text-neutral-600">
                      <span className="font-semibold">Sube una imagen</span> <br />
                      PNG, JPG o JPEG hasta 5MB. Recomendado 500x500px.
                    </div>
                    <span className="text-xs text-[#388E3C] font-semibold">Seleccionar archivo</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sección 2: Dirección y horarios */}
            <Card>
              <CardContent className="p-8 space-y-8">
                <h2 className="text-2xl font-semibold">Dirección y horarios de atención</h2>

                {/* Dirección */}
                <div className="space-y-2">
                  <label htmlFor="address" className="flex items-center gap-1.5 text-base font-semibold">
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
                  <div className="space-y-2">
                    <label className="text-base font-semibold">Región</label>
                    <Select name="region" defaultValue="Región Metropolitana">
                      <SelectTrigger className="bg-[#FAFAFA] border-neutral-200 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-base font-semibold">Comuna</label>
                    <Select name="comuna" defaultValue="Providencia">
                      <SelectTrigger className="bg-[#FAFAFA] border-neutral-200 h-11">
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
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#FAFAFA] border border-neutral-100">
                  <div>
                    <label htmlFor="showAddress" className="text-base font-semibold cursor-pointer">
                      Mostrar dirección en el menú digital
                    </label>
                    <p className="text-xs text-neutral-600 mt-1">
                      Aparece en el pie de página del menú para que los clientes puedan ubicarte.
                    </p>
                  </div>
                  <Switch id="showAddress" name="showAddressOnMenu" defaultChecked className="data-[state=checked]:bg-[#388E3C]" />
                </div>

                {/* Horarios de atención */}
                <div>
                  <h3 className="text-base font-semibold mb-5">Horarios de atención</h3>
                  <Table className="border rounded-md">
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
              <Button type="button" variant="ghost" className="text-neutral-600 hover:bg-neutral-100">
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#C6FF00] text-[#1B5E20] hover:bg-[#B2FF00] font-bold px-8 shadow-sm hover:shadow-md transition-all rounded-md"
              >
                Guardar cambios
              </Button>
            </div>
          </form>
        </main>
      </div>
      </div>
    </div>
  );
}