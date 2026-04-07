import { createClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import { MenuPreview } from "@/components/menu/MenuPreview";
import type { Database } from "@/types/database.types";

type Menu = Database["public"]["Tables"]["menus"]["Row"];
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

  const supabase = createClient();

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

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <MenuPreview
        menu={menu}
        logoUrlSelected={menu.logo_url ?? ""}
        coverUrlSelected={menu.bg_image_url ?? ""}
        categories={categoriesWithProducts}
      />
    </div>
  );
}