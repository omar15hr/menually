"use client";

import { useState } from "react";

import type { Database } from "@/types/database.types";
import CategoryEditTable from "./CategoryEditTable";

type Category = Database["public"]["Tables"]["categories"]["Row"];

interface Props {
  menuId: string;
  categories: Category[];
}

export default function CategoriesWorkflow({ menuId, categories }: Props) {
  const [isPending, setIsPending] = useState<boolean>(false);

  return (
    <div className="flex flex-col">
      <header className="p-6 border border-[#E4E4E6] flex justify-end">
        <button
          disabled={isPending}
          className="w-fit px-4 py-2 text-xs font-bold bg-[#CDF545] hover:bg-[#CDF545]/80 text-[#114821] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </header>
      <div className="flex gap-6 bg-[#FBFBFA] items-start">
        <CategoryEditTable menuId={menuId} categories={categories} />
      </div>
    </div>
  );
}
