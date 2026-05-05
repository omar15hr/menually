import AlertIcon from "@/components/icons/AlertIcon";
import { Info } from "lucide-react";

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen p-6 md:p-10 flex justify-center text-[#1C1C1C]">
      <div className="w-full max-w-3xl space-y-6">
        
        {/* Tarjeta: Suscripción */}
        <div className="bg-white border border-[#E4E4E6] rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-5">Suscripción</h2>
          
          <div className="bg-[#FEFAD2] text-[#1C1C1C] p-4 rounded-lg flex items-start gap-3 mb-6">
            <AlertIcon />
            <div className="text-sm">
              <p className="font-semibold">Tu mes de prueba gratuita vence el 6 de mayo de 2026.</p>
              <p>A partir de esa fecha se cobrará tu plan automáticamente. Puedes cancelar antes sin costo.</p>
            </div>
          </div>

          <div className="border border-green-500 rounded-xl p-5 mb-4 bg-white relative">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg">Plan Pro</h3>
                  <span className="bg-[#EDFCBC] text-[#25A73A] text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Plan activo
                  </span>
                </div>
                <p className="text-sm text-gray-500">Full control para restaurantes en crecimiento</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold">$3.990</span>
              <span className="text-sm text-gray-500 font-medium"> /mes</span>
              <p className="text-xs text-[#475569] mt-1">Anual — pagas una vez, usas todo el año</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-5 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-lg mb-1">Plan Básico</h3>
              <p className="text-sm text-gray-500 mb-4">Para pequeños locales o que estén iniciando</p>
              <div>
                <span className="text-3xl font-extrabold">$3.990</span>
                <span className="text-sm text-gray-500 font-medium"> /mes</span>
                <p className="text-xs text-[#475569] mt-1">Anual — pagas una vez, usas todo el año</p>
              </div>
            </div>
            <button className="bg-[#CDF545] text-[#114821] cursor-pointer font-medium px-4 py-2 rounded-lg text-sm transition-colors">
              Cambiar a plan básico
            </button>
          </div>
        </div>

        {/* Tarjeta: Método de pago */}
        <div className="bg-white border border-[#E4E4E6] rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-1">Método de pago</h2>
          <p className="text-sm text-gray-500 mb-6">Se usa para el cobro automático al vencer tu período de prueba.</p>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="border border-gray-200 rounded px-3 py-2 flex items-center justify-center">
                <span className="text-[#1434CB] font-bold italic text-xl">VISA</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Visa terminada en 4321</p>
                <p className="text-xs text-gray-500">Vence 09/2027</p>
              </div>
            </div>
            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors">
              Cambiar
            </button>
          </div>

          <div className="bg-[#E9EDF4] p-4 rounded-lg flex items-center gap-3">
            <Info className="w-5 h-5 text-gray-700 shrink-0" fill="currentColor" stroke="white" />
            <p className="text-xs text-[#1A1A1A]">
              Los cobros se realizan el mismo día cada mes. Recibirás una boleta electrónica al correo registrado.
            </p>
          </div>
        </div>

        {/* Tarjeta: Datos de facturación */}
        <div className="bg-white border border-[#E4E4E6] rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-1">Datos de facturación</h2>
          <p className="text-sm text-gray-500 mb-6">Se usa para el cobro automático al vencer tu período de prueba.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2">RUT</label>
              <input 
                type="text" 
                defaultValue="76.543.210-K" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Razón social o nombre completo</label>
              <input 
                type="text" 
                defaultValue="Café Central SpA" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                readOnly
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Giro comercial</label>
            <input 
              type="text" 
              defaultValue="Actividades de restaurantes y de servicio móvil de comidas" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              readOnly
            />
          </div>
        </div>

        {/* Tarjeta: Cancelar suscripción */}
        <div className="bg-white border border-[#E4E4E6] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold mb-4">Cancelar suscripción</h2>
            <p className="text-base font-semibold mb-1">Cancelar antes del 6 de mayo de 2026</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Si cancelas durante el período de prueba, no se realizará ningún cobro y tu menú seguirá activo hasta que venza la prueba. Después, pasará a solo lectura.
            </p>
          </div>
          <button className="bg-[#B60000] cursor-pointer text-white font-medium px-5 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors">
            Cancelar suscripción
          </button>
        </div>

      </div>
    </div>
  );
}