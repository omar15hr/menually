import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

export default function PreferencesPage() {
  return (
    <div className="grid md:grid-cols-[240px,1fr] gap-10 py-6 md:py-10 max-w-7xl mx-auto">
      <form className="space-y-10">
        <Card>
          <CardContent className="p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1C1C1C]">Preferencias</h2>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]">
                  Activar notificaciones
                </h2>
                <p className="text-[#58606E]">Solo te mandaremos actualizaciones y noticias relacionadas a la plataforma</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1C1C1C]">Zona de riesgo</h2>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]">
                  Eliminar todos los datos del menú
                </h2>
                <p className="text-[#58606E] max-w-lg">Borra todos los platos, categorías y fotos. El restaurante y tu cuenta se mantienen. Esta acción no se puede deshacer.</p>
              </div>
              <Button
                type="submit"
                className="bg-[#B60000] text-white h-10 font-bold px-4 transition-all rounded-lg cursor-pointer"
              >
                Eliminar menú
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}