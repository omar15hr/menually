import { timeAgo } from "@/lib/timeAgo";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import DownloadIcon from "@/components/icons/DownloadIcon";
import SearchInput from "@/components/dashboard/SearchInput";
import WithMenuTable from "@/components/dashboard/WithMenuTable";
import Header from "@/components/shared/Header";

export default async function GestionProductosPage() {
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
      <Header />
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
          <Link href="/dashboard/menu/qr" className="bg-white border border-[#E4E4E6] rounded-lg flex w-40 items-center justify-center gap-2 h-10 py-2.5 px-4 text-[#0F172A] text-base font-semibold cursor-pointer">
            <DownloadIcon />
            Descargar QR
          </Link>
          <Link href="/dashboard/menu/menu-content" className="bg-[#CDF545] rounded-lg flex items-center gap-2 h-10 py-2.5 px-4 text-[#114821] text-base font-semibold cursor-pointer w-30">
            Editar menú
          </Link>
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

          <WithMenuTable products={allProducts} />

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
