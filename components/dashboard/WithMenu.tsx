import { timeAgo } from "@/lib/timeAgo";
import SearchInput from "./SearchInput";
import { redirect } from "next/navigation";
import TrashIcon from "../icons/TrashIcon";
import { createClient } from "@/lib/supabase/server";
import { Button } from "../ui/button";
import DownloadIcon from "../icons/DownloadIcon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Switch } from "../ui/switch";

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

  const allProducts = result.flatMap((category) =>
    category.products.map((product) => ({
      ...product,
      categoryName: category.name,
    })),
  );

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
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="py-4 px-6 font-semibold text-gray-700">Producto</TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-gray-700">Categoría</TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-gray-700">Descripción</TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-gray-700">Precio</TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-gray-700 text-center">Disponibilidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100">
                {allProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50/50">
                    <TableCell className="py-4 px-6 text-sm text-gray-600 font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-gray-600">
                      {product.categoryName}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="border border-gray-200 rounded-lg p-3 text-xs text-gray-500 w-48 bg-white truncate">
                        {product.description || "Sin descripción"}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 w-28 bg-white">
                        <span className="text-gray-500 font-medium mr-1">$</span>
                        <input
                          type="text"
                          defaultValue={product.price}
                          className="w-full outline-none text-sm font-medium text-gray-700 bg-transparent"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-6">

                        <Switch id="airplane-mode" />
                        <button className="p-2 bg-[#AB050533] text-[#AB0505] rounded-full hover:bg-red-100 transition-colors cursor-pointer">
                          <TrashIcon />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" text="Anterior" className="hover:text-gray-900 hover:bg-transparent text-gray-600 px-2" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" className="text-gray-600 hover:bg-gray-100">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive className="bg-green-800 text-white hover:bg-green-800/90 hover:text-white border-transparent">
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" className="text-gray-600 hover:bg-gray-100">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis className="text-gray-600" />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" text="Siguiente" className="hover:text-gray-900 hover:bg-transparent text-gray-600 px-2" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}
