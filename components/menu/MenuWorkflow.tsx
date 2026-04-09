"use client";

import { MenuPreview } from "@/components/menu/MenuPreview";
import { MenuEditTable } from "@/components/menu/MenuEditTable";
import { updateMenu } from "@/actions/menu.action";
import type { Database } from "@/types/database.types";
import type { UpdateMenuSchema } from "@/lib/validations/menu.schemas";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type Menu = Database["public"]["Tables"]["menus"]["Row"];

interface Props {
  menu: Menu;
}

export default function MenuWorkflow({ menu: initialMenu }: Props) {
  const [menu, setMenu] = useState<Menu>(initialMenu);
  const [editMenu, setEditMenu] = useState<Menu>(initialMenu);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState<string>(initialMenu?.logo_url ?? "");
  const [coverUrl, setCoverUrl] = useState<string>(initialMenu?.bg_image_url ?? "");

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
      bg_image_url: editMenu.bg_image_url,
      logo_url: editMenu.logo_url,
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
        toast.error("Error desconocido");
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
          className="w-fit px-4 py-2 text-xs font-bold bg-[#CDF545] hover:bg-[#CDF545]/80 text-[#114821] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
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
        />
      </div>
    </div>
  );
}
