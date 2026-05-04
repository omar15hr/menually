"use client";

import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import ImageUploader from "@/components/shared/ImageUploader";
import type { Business } from "@/types/business.types";

const BUSINESS_TYPES = [
  { value: "cafeteria", label: "Cafetería" },
  { value: "restaurante", label: "Restaurante" },
  { value: "bar", label: "Bar" },
  { value: "pasteleria", label: "Pastelería" },
  { value: "otro", label: "Otro" },
];

interface BusinessInfoSectionProps {
  profile: { business_name: string };
  business: Business | null;
  logoUrl: string | null;
  descLength: number;
  businessType: string;
  onDescLengthChange: (len: number) => void;
  onBusinessTypeChange: (type: string) => void;
}

export function BusinessInfoSection({
  profile,
  business,
  logoUrl,
  descLength,
  businessType,
  onDescLengthChange,
  onBusinessTypeChange,
}: BusinessInfoSectionProps) {
  return (
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
            onChange={(e) => onDescLengthChange(e.target.value.length)}
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
            onValueChange={onBusinessTypeChange}
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
  );
}
