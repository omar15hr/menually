"use client";

import { toast } from "sonner";
import { useState, useTransition } from "react";

import { Spinner } from "../ui/spinner";
import { updateMenu } from "@/actions/menu.action";
import type { Database } from "@/types/database.types";
import type { Promotion } from "@/types/promotions.types";
import { MenuPreview } from "@/components/menu/MenuPreview";
import { MenuEditTable } from "@/components/menu/MenuEditTable";
import type { UpdateMenuSchema } from "@/lib/validations/menu.schemas";

type Menu = Database["public"]["Tables"]["menus"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];

export type CategoryWithProducts = Category & {
  products: Product[];
};

interface Props {
  menu: Menu;
  categories: CategoryWithProducts[];
  profiles: Profile | null;
  promotions?: Promotion[];
}

export default function MenuWorkflow({
  menu: initialMenu,
  categories,
  profiles,
  promotions = [],
}: Props) {
  const [menu, setMenu] = useState<Menu>(initialMenu);
  const [editMenu, setEditMenu] = useState<Menu>(initialMenu);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState<string>(initialMenu?.logo_url ?? "");
  const [coverUrl, setCoverUrl] = useState<string>(
    initialMenu?.bg_image_url ?? "",
  );

  function handleLogoUrlSelected(url: string) {
    setLogoUrl(url);
    setEditMenu((prev) => (prev ? { ...prev, logo_url: url } : prev));
  }

  function handleCoverUrlSelected(url: string) {
    setCoverUrl(url);
    setEditMenu((prev) => (prev ? { ...prev, bg_image_url: url } : prev));
  }

  function handleFieldChange(field: keyof Menu, value: string | boolean) {
    setEditMenu((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function handleSave() {
    if (!editMenu) return;

    setError(null);
    setSuccessMsg(null);

    const payload: UpdateMenuSchema = {
      is_active: editMenu.is_active,
      primary_color: editMenu.primary_color,
      text_color: editMenu.text_color,
      bg_color: editMenu.bg_color,
      price_color: editMenu.price_color,
      description_color: editMenu.description_color,
      bg_image_url: editMenu.bg_image_url ?? "",
      logo_url: editMenu.logo_url ?? "",
      typography: editMenu.typography as UpdateMenuSchema["typography"],
      layout_card: editMenu.layout_card as UpdateMenuSchema["layout_card"],
      image_product_shape:
        editMenu.image_product_shape as UpdateMenuSchema["image_product_shape"],
      show_price: editMenu.show_price,
      show_descriptions: editMenu.show_descriptions,
      show_filters: editMenu.show_filters,
    };

    startTransition(async () => {
      const result = await updateMenu(editMenu.id, payload);

      if (!result.success || !result.data) {
        setError(result.error ?? "Error desconocido");
        toast.error(result.error ?? "Error desconocido");
        return;
      }

      setMenu(result.data);
      setEditMenu(result.data);
      setLogoUrl(result.data.logo_url ?? "");
      setCoverUrl(result.data.bg_image_url ?? "");
      toast.success("Menú actualizado correctamente");
    });
  }

  return (
    <div className="flex flex-col">
      <header className="p-6 border border-[#E4E4E6] flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-fit text-base bg-[#CDF545] hover:bg-[#c0e740] text-[#114821] font-semibold py-2 px-4 rounded-lg h-10 cursor-pointer transition-colors"
        >
          {isPending ? (
            <span className="flex gap-2 justify-center items-center">
              <Spinner /> Guardando...
            </span>
          ) : (
            "Guardar cambios"
          )}
        </button>
      </header>
      <div className="flex gap-6 bg-[#FBFBFA] items-start">
        <MenuEditTable
          error={error}
          menu={editMenu}
          successMsg={successMsg}
          onChange={handleFieldChange}
          logoUrl={logoUrl}
          onLogoUrlSelected={handleLogoUrlSelected}
          coverUrl={coverUrl}
          onCoverUrlSelected={handleCoverUrlSelected}
        />

        <MenuPreview
          menu={editMenu}
          logoUrlSelected={logoUrl}
          coverUrlSelected={coverUrl}
          categories={categories}
          businessName={profiles?.business_name ?? null}
          promotions={promotions}
        />
      </div>
    </div>
  );
}
