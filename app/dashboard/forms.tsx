"use client";

import { MenuPreview } from "@/components/menu/MenuPreview";
import { createMenu } from "@/actions/menu.action";
import type { Database } from "@/types/database.types";
import React, { useState, useTransition } from "react";

type Menu = Database["public"]["Tables"]["menus"]["Row"];

interface Props {
  menu: Menu | null;
}

export default function DashboardForms({ menu: initialMenu }: Props) {
  const [menu, setMenu] = useState<Menu | null>(initialMenu);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createMenu();
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.data) {
        setMenu(result);
      }
    });
  }

  if (!menu) {
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

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "ID", value: menu.id },
    { label: "Slug", value: menu.slug },
    { label: "Activo", value: menu.is_active ? "Sí" : "No" },
    { label: "Layout", value: menu.layout_card },
    { label: "Tipografía", value: menu.typography },
    { label: "Mostrar precio", value: menu.show_price ? "Sí" : "No" },
    { label: "Mostrar filtros", value: menu.show_filters ? "Sí" : "No" },
    { label: "Mostrar descripciones", value: menu.show_descriptions ? "Sí" : "No" },
    { label: "Color primario", value: menu.primary_color },
    { label: "Color descripcion", value: menu.description_color },
    { label: "Color de texto", value: menu.text_color },
    { label: "Color de precio", value: menu.price_color },
    { label: "Creado el", value: new Date(menu.created_at).toLocaleDateString("es-AR") },
  ];

  return (
    <div className="flex gap-4 bg-[#FBFBFA]">
      <ul className="border rounded divide-y text-sm">
        {fields.map(({ label, value }) => (
          <li key={label} className="flex justify-between px-4 py-2 gap-4">
            <span className="text-gray-500 shrink-0">{label}</span>
            <span className="font-medium text-right truncate">{value ?? "—"}</span>
          </li>
        ))}
      </ul>

      <MenuPreview menu={menu} />
    </div>
  );
}