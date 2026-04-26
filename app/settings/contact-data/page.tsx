import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactDataPage() {
  return (
    <div className="grid md:grid-cols-[240px,1fr] gap-10 py-6 md:py-10 max-w-7xl mx-auto">
      <form className="space-y-10">
        <Card>
          <CardContent className="p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1C1C1C]">Datos de contacto</h2>
              <p className="text-sm text-[#58606E] mt-1">
                Tus datos personales.
              </p>
            </div>

            <div className="flex gap-2 items-center justify-center">
              <div className="space-y-2">
                <label htmlFor="businessName" className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]">
                  Correo electrónico
                </label>
                <Input
                  id="businessName"
                  name="businessName"
                  defaultValue="Ej: Domesticocafe@gmail.com"
                  className="border-[#E4E4E6] placeholder:text-[#58606E] h-12 w-80"
                />
              </div>


              <div className="space-y-2">
                <label htmlFor="description" className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]">
                  Número de teléfono
                </label>
                <Input
                  id="description"
                  name="description"
                  defaultValue="Ej: +56 9 98987788"
                  className="border-[#E4E4E6] placeholder:text-[#58606E] h-11 w-80"
                />
              </div>
            </div>
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8 space-y-8">
            <h2 className="text-2xl font-bold text-[#1C1C1C]">Cambio de contraseña</h2>

            <div className="flex flex-col gap-6 items-start">
              <div className="space-y-2">
                <label htmlFor="address" className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]">
                  Ingresa tu contraseña actual
                </label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Contraseña"
                  className="border-neutral-200 placeholder:text-[#58606E] h-11 w-120"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="address" className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]">
                  Crea una nueva contraseña
                </label>
                <div className="flex gap-4">
                  <Input
                    id="address"
                    name="address"
                    placeholder="Mínimo 8 caracteres"
                    className="border-neutral-200 placeholder:text-[#58606E] h-11 w-80"
                  />
                  <Input
                    id="address"
                    name="address"
                    placeholder="Repetir nueva contraseña"
                    className="border-neutral-200 placeholder:text-[#58606E] h-11 w-80"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
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
          </CardContent>
        </Card>
      </form>
    </div>
  );
}