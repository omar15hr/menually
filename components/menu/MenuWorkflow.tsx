"use client";

import { MenuPreview } from "@/components/menu/MenuPreview";
import { MenuEditTable } from "@/components/menu/MenuEditTable";
import { createMenu, updateMenu } from "@/actions/menu.action";
import type { Database } from "@/types/database.types";
import type { UpdateMenuSchema } from "@/lib/validations/menu.schemas";
import React, { useState, useTransition } from "react";

type Menu = Database["public"]["Tables"]["menus"]["Row"];

interface Props {
  menu: Menu | null;
}

export default function MenuWorkflow({ menu: initialMenu }: Props) {
  const [menu, setMenu] = useState<Menu | null>(initialMenu);
  const [editMenu, setEditMenu] = useState<Menu | null>(initialMenu);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [coverUrl, setCoverUrl] = useState<string>("");

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createMenu();
      if (!result.success) {
        setError(result.error);
        return;
      }

      setMenu(result.data);
      setEditMenu(result.data);
    });
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

      if (!result.success) {
        setError(result.error ?? "Error desconocido");
        return;
      }

      setMenu(editMenu);
      setSuccessMsg("Menú actualizado correctamente");
      setTimeout(() => setSuccessMsg(null), 3000);
    });
  }

  if (!menu || !editMenu) {
    return (
      <div className="flex flex-col max-w-sm border p-4">
        <span className="font-medium mb-2">Crear tu menú</span>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          onClick={handleCreate}
          disabled={isPending}
          className="px-4 py-2 text-sm bg-black text-white rounded disabled:opacity-50"
        >
          {isPending ? "Creando..." : "Confirmar"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-6 bg-[#FBFBFA] items-start">
      <MenuEditTable
        error={error}
        menu={editMenu}
        onSave={handleSave}
        isPending={isPending}
        successMsg={successMsg}
        onChange={handleFieldChange}
        logoUrl={logoUrl}
        onLogoUrlSelected={setLogoUrl}
        coverUrl={coverUrl}
        onCoverUrlSelected={setCoverUrl}
      />

      <MenuPreview
        menu={editMenu}
        logoUrlSelected={logoUrl}
        coverUrlSelected={coverUrl}
      />
    </div>
  );
}
