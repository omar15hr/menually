import SearchInput from '@/components/dashboard/SearchInput';
import Header from '@/components/shared/Header';
import { Plus, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';

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
  return (
    <>
      <Header />
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F172A]">Promociones</h1>
            <p className="text-[#64748B] text-base mt-1">Crea y gestiona promociones, y productos que quieras destacar para atraer más clientes.</p>
          </div>
          <button className="bg-[#CDF545] text-[#114821] h-10 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm cursor-pointer">
            <Plus size={18} /> Nueva promoción
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.id} className="w-50 border border-[#E2E8F0] rounded-2xl p-5 flex justify-between items-center bg-[#FBFBFA]">
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

          {/* Filters & Search */}
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

          {/* Table */}
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
                      {/* Reemplazar con el componente Switch de shadcn en tu proyecto real */}
                      <div className={`w-10 h-5 rounded-full relative cursor-pointer ${row.active ? 'bg-blue-500' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${row.active ? 'left-5' : 'left-0.5'}`}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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
    </>
  );
}