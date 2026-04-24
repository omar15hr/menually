import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicMenu } from "@/components/menu/PublicMenu";
import type { Database } from "@/types/database.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];

type CategoryWithProducts = Category & {
  products: Product[];
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();

  // Fetch menu by slug
  const { data: menu, error: menuError } = await supabase
    .from("menus")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (menuError || !menu) {
    notFound();
  }

  // Fetch categories with products
  const { data: categories } = await supabase
    .from("categories")
    .select(`
      *,
      products (*)
    `)
    .eq("menu_id", menu.id)
    .order("position", { ascending: true });

  const categoriesWithProducts: CategoryWithProducts[] =
    (categories as CategoryWithProducts[]) ?? [];

  // Promociones activas para el carrusel
  const now = new Date().toISOString();
  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .eq("menu_id", menu.id)
    .eq("is_active", true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order("position", { ascending: true })
    .limit(10);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PublicMenu menu={menu} categories={categoriesWithProducts} promotions={promotions ?? []} />
    </div>
  );
}