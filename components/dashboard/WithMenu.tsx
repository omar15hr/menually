import { timeAgo } from "@/lib/timeAgo";
import SearchInput from "./SearchInput";
import { redirect } from "next/navigation";
import TrashIcon from "../icons/TrashIcon";
import { createClient } from "@/lib/supabase/server";
import { Button } from "../ui/button";
import DownloadIcon from "../icons/DownloadIcon";

const mockProducts = [
  {
    id: 1,
    name: "Croissant de almendras",
    category: "Postres",
    description:
      "Rica pizza margarita de masa madre, con queso mozzarella de buffalla",
    price: "4.990",
    available: true,
  },
  {
    id: 2,
    name: "Espresso mandarina",
    category: "Cafetería",
    description:
      "Rica pizza margarita de masa madre, con queso mozzarella de buffalla",
    price: "4.990",
    available: false,
  },
  {
    id: 3,
    name: "Cheesecake de frambuesa",
    category: "Postres",
    description:
      "Rica pizza margarita de masa madre, con queso mozzarella de buffalla",
    price: "4.990",
    available: true,
  },
  {
    id: 4,
    name: "Tarta vasca",
    category: "Postres",
    description:
      "Rica pizza margarita de masa madre, con queso mozzarella de buffalla",
    price: "4.990",
    available: true,
  },
  {
    id: 5,
    name: "Tarta vasca",
    category: "Postres",
    description:
      "Rica pizza margarita de masa madre, con queso mozzarella de buffalla",
    price: "4.990",
    available: true,
  },
];

export default async function WithMenu() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!menu) return null;

  const { data: categoriesWithProducts, error } = await supabase
    .from("categories")
    .select(
      `
      *,
      products (*)
    `,
    )
    .eq("menu_id", menu.id);

  if (error || !categoriesWithProducts) return null;

  const result = categoriesWithProducts.map((category) => ({
    ...category,
    productCount: category.products.length,
  }));

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="flex flex-col w-full mt-5 px-10 max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-extrabold text-left text-gray-900 mb-2 capitalize">
            Mi menú digital
          </h1>
          <p className="text-[#64748B] text-base font-normal">
            {`Actualizado hace ${timeAgo(menu.updated_at)}`}
          </p>
        </div>

        <div className="flex gap-2 mt-5 px-10 max-w-7xl mx-auto p-6">
          <Button className="bg-white border border-[#E4E4E6] rounded-lg h-10 py-2.5 px-4 text-[#0F172A] text-sm font-semibold cursor-pointer">
            <DownloadIcon />
            Descargar QR
          </Button>
          <Button className="bg-[#CDF545] rounded-lg h-10 py-2.5 px-4 text-[#114821] text-sm font-semibold cursor-pointer">
            Editar menú
          </Button>
        </div>
      </div>

      <div>
        <div className="p-8 max-w-7xl mx-auto font-sans">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#1C1C1C]">
              Gestión de productos
            </h1>
            <div className="relative w-96">
              <SearchInput placeholder="Buscar platos, categorías, productos" />
            </div>
          </div>

          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {result.map((cat) => (
              <button
                key={cat.id}
                className={`px-4 py-2 rounded-lg text-sm font-bold text-[#114821] whitespace-nowrap bg-[#F5FDDA]`}
              >
                {cat.name} ({cat.products.length})
              </button>
            ))}
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700">
                    Producto
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700">
                    Categoría
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700">
                    Descripción
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700">
                    Precio
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 text-center">
                    Disponibilidad
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {product.name}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {product.category}
                    </td>
                    <td className="py-4 px-6">
                      <div className="border border-gray-200 rounded-lg p-3 text-xs text-gray-500 w-48 bg-white">
                        {product.description}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 w-28 bg-white">
                        <span className="text-gray-500 font-medium mr-1">
                          $
                        </span>
                        <input
                          type="text"
                          defaultValue={product.price}
                          className="w-full outline-none text-sm font-medium text-gray-700 bg-transparent"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-6">
                        <button
                          className={`w-11 h-6 rounded-full relative transition-colors ${product.available ? "bg-blue-600" : "bg-gray-200"}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${product.available ? "translate-x-6" : "translate-x-1"}`}
                          />
                        </button>
                        <button className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center items-center space-x-4 mt-6 text-sm text-gray-600">
            <button className="hover:text-gray-900">&lt; Anterior</button>
            <div className="flex space-x-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md bg-green-800 text-white font-medium">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">
                3
              </button>
              <span className="flex items-center justify-center">...</span>
            </div>
            <button className="hover:text-gray-900">Siguiente &gt;</button>
          </div>
        </div>
      </div>
    </>
  );
}
