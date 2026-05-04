"use client";

import EmptyBoxIcon from "@/components/icons/EmptyBoxIcon";

export function EmptyProductsState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 h-full text-gray-400">
      <EmptyBoxIcon />
      <p className="text-sm">
        Aún no hay productos <br />
        en esta categoría.
      </p>
    </div>
  );
}
