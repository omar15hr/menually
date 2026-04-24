'use client';
import { useState } from 'react';
import SearchInput from '@/components/dashboard/SearchInput';
import Header from '@/components/shared/Header';
import { Plus, ChevronLeft, ChevronRight, MoreHorizontal, X, Camera, Info, Check } from 'lucide-react';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';

// --- MOCK DATA ---
const stats = [
  { id: 1, title: 'Activas', desc: 'Mostrándose actualmente', value: '3' },
  { id: 2, title: 'Programadas', desc: 'Inicia en 3 días', value: '1' },
  { id: 3, title: 'Este mes', desc: 'Promociones publicadas', value: '8' },
];

const carouselItems = [
  { id: 1, tag: 'Promo navideña', title: 'Dos cafés por $3.990', desc: 'Descripción promoción dos líneas máximo.' },
  { id: 2, tag: 'Merienda', title: 'Café + medialuna', desc: 'Descripción promoción dos líneas máximo.' },
  { id: 3, tag: 'Promo navideña', title: 'Café + galleta', desc: 'Descripción promoción dos líneas máximo.' },
];

const history = [
  { id: 1, name: 'Promoción de invierno', sub: 'Croissant de almendras', keyword: 'Promo navideña', status: 'Activa', statusColor: 'bg-green-100 text-green-700', date: '31 de Marzo - 4 de Abril', active: true },
  { id: 2, name: 'Promoción de invierno', sub: 'Croissant de almendras', keyword: 'Merienda', status: 'Programada', statusColor: 'bg-purple-100 text-purple-700', date: 'Sin fecha de término', active: false },
  { id: 3, name: 'Promoción de invierno', sub: 'Croissant de almendras', keyword: 'Breakfast', status: 'Vencida', statusColor: 'bg-red-100 text-red-700', date: '31 de Marzo - 4 de Abril', active: false },
  { id: 4, name: 'Promoción de invierno', sub: 'Croissant de almendras', keyword: 'Merienda', status: 'Pausada', statusColor: 'bg-yellow-100 text-yellow-700', date: '31 de Marzo - 4 de Abril', active: false },
];

export default function PromotionsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [step, setStep] = useState(1);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => setStep(1), 300); // Reset step after closing animation
  };

  return (
    <>
      <Header />
      <div className="p-8 max-w-6xl mx-auto space-y-8 relative">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F172A]">Promociones</h1>
            <p className="text-[#64748B] text-base mt-1">Crea y gestiona promociones, y productos que quieras destacar para atraer más clientes.</p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="bg-[#CDF545] text-[#114821] h-10 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm cursor-pointer"
          >
            <Plus size={18} /> Nueva promoción
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.id} className="w-full border border-[#E2E8F0] rounded-2xl p-5 flex justify-between items-center bg-[#FBFBFA]">
              <div>
                <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
              </div>
              <span className="text-4xl font-bold text-gray-900">{s.value}</span>
            </div>
          ))}
        </div>

        {/* CAROUSEL PREVIEW */}
        <div className="bg-[#FBFBFA] border border-[#E2E8F0] rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 text-[#1C1C1C]">Vista previa del carrusel</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {carouselItems.map((item) => (
              <div key={item.id} className="min-w-[320px] bg-white border border-gray-100 rounded-xl p-4 flex gap-4 shadow-md">
                <div className="w-24 h-24 bg-gray-200 rounded-lg shrink-0 object-cover overflow-hidden">
                  <Image src="/images/image-promotions.png" alt="promo" className="w-full h-full object-cover" width={200} height={200} />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="bg-[#D0E3FF] w-fit text-[#0167F7] text-xs font-semibold px-2 py-1 rounded-md mb-2">{item.tag}</span>
                  <h3 className="font-bold text-sm text-[#41464E]">{item.title}</h3>
                  <p className="text-xs text-[#58606E] mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HISTORY TABLE */}
        <div>
          <h2 className="text-xl font-bold text-[#1C1C1C] mb-4">Historial de promociones</h2>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button className="bg-[#F5FDDA] text-green-800 px-4 py-2 rounded-md text-base font-bold">Todas (32)</button>
              <button className="bg-[#FBFBFA] text-[#1C1C1C] px-4 py-2 rounded-md text-base border border-[#E2E8F0]">Programadas (12)</button>
              <button className="bg-[#FBFBFA] text-[#1C1C1C] px-4 py-2 rounded-md text-base border border-[#E2E8F0]">Vencidas (8)</button>
              <button className="bg-[#FBFBFA] text-[#1C1C1C] px-4 py-2 rounded-md text-base border border-[#E2E8F0]">Pausadas (3)</button>
            </div>
            <div className='w-72'>
              <SearchInput />
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-white border-b border-gray-200 text-gray-900">
                <tr>
                  <th className="p-4 font-semibold">Promoción</th>
                  <th className="p-4 font-semibold">Palabra clave</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold">Vigencia</th>
                  <th className="p-4 font-semibold">Disponibilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{row.name}</p>
                      <p className="text-gray-500 text-xs">{row.sub}</p>
                    </td>
                    <td className="p-4">{row.keyword}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{row.date}</td>
                    <td className="p-4">
                      <div className={`w-10 h-5 rounded-full relative cursor-pointer ${row.active ? 'bg-blue-500' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${row.active ? 'left-5' : 'left-0.5'}`}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-center gap-2 p-4 text-sm text-gray-600 border-t border-gray-100">
              <button className="flex items-center gap-1 hover:text-gray-900"><ChevronLeft size={16} /> Anterior</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#0f3d32] text-white">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">3</button>
              <MoreHorizontal size={16} className="text-gray-400" />
              <button className="flex items-center gap-1 hover:text-gray-900">Siguiente <ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY / BACKDROP */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR ONBOARDING */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-112.5 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Nueva promoción</h2>
          <button onClick={closeSidebar} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 px-6 py-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step > item ? 'bg-[#CDF545] text-[#114821]' :
                  step === item ? 'bg-[#114821] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                  {step > item ? <Check size={16} /> : item}
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {item === 1 ? 'Contenido' : item === 2 ? 'Imagen' : 'Tiempo'}
                </span>
              </div>
              {item < 3 && (
                <div className={`w-12 h-0.5 mb-6 mx-2 ${step > item ? 'bg-[#CDF545]' : 'bg-gray-100'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
                <input type="text" placeholder="Ej: Dos cafés por $3.990" className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#114821]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción (opcional)</label>
                <textarea rows={3} placeholder="Ej: Válido todos los días, solo en el local." className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#114821] resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Palabra clave</label>
                <input type="text" placeholder="Ej: Promo Verano" className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#114821]" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-bold text-sm text-gray-900">Imagen del banner</h3>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <Camera size={24} className="text-gray-500" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-bold text-sm text-gray-900">Sube una imagen</p>
                  <p className="text-xs text-gray-500 mt-1">Recomendado 328 x 200px PNG.</p>
                  <span className="text-[#34A853] text-xs font-bold mt-2 inline-block">Seleccionar archivo</span>
                </div>
              </div>
              <div className="bg-[#F8F9FA] rounded-xl p-4 flex gap-3 items-start">
                <Info size={20} className="text-gray-800 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  El 70% del banner es imagen. Una foto con buena luz y colores cálidos puede aumentar el interés y las ventas de tus platos.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Definir periodo de tiempo</h3>
                  <p className="text-xs text-gray-500">Si no defines fecha, se muestran de forma permanente.</p>
                </div>
                <Switch />
              </div>

              <div className="flex gap-4">
                <input type="date" className="w-1/2 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#114821]" />
                <input type="date" className="w-1/2 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#114821]" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Día de la semana</h3>
                  <p className="text-xs text-gray-500">Elige los días en que estará disponible la promoción.</p>
                </div>
                <Switch />
              </div>

              <div className="flex flex-wrap gap-2">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, idx) => {
                  const isActive = idx === 0 || idx === 1 || idx === 4; // Lunes, Martes, Viernes activos
                  return (
                    <button key={day} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border ${isActive ? 'bg-[#114821] text-white border-[#114821]' : 'bg-gray-100 text-gray-600 border-transparent'
                      }`}>
                      {day} {isActive && <X size={12} />}
                    </button>
                  )
                })}
              </div>

              {/* Resumen */}
              <div className="bg-[#F8F9FA] rounded-xl p-5 space-y-4 border border-gray-100 mt-4">
                <h4 className="font-bold text-sm text-gray-900">Resumen</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Título</p>
                    <p className="text-xs font-medium text-gray-900">Promoción de navidad</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Descripción</p>
                    <p className="text-xs font-medium text-gray-900">Solo en consumo en el local</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Palabra clave</p>
                    <p className="text-xs font-medium text-gray-900">2X1</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Imagen</p>
                    <p className="text-xs font-medium text-gray-900">nombre.JPG</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Vigencia</p>
                    <p className="text-xs font-medium text-gray-900">Del 24/04/2026 al 30/04/2026 (Lunes, martes y viernes)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : closeSidebar()}
            className="text-sm font-bold text-[#114821]"
          >
            {step === 1 ? 'Cerrar' : 'Volver'}
          </button>

          <button
            onClick={() => step < 3 ? setStep(step + 1) : closeSidebar()}
            className="bg-[#CDF545] text-[#114821] px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#bce635] transition-colors"
          >
            {step === 3 ? 'Crear promoción' : 'Continuar'}
          </button>
        </div>
      </div>
    </>
  );
}