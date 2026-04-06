"use client";

import { useOptimistic, useTransition, useRef } from "react";
import { Category } from "@/types/categories.types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import PlusIcon from "../icons/PlusIcon";
import LoaderIcon from "../icons/LoaderIcon";
import XIcon from "../icons/XIcon";
import CheckIcon from "../icons/CheckIcon";
import { useState } from "react";
import { createCategory } from "@/actions/categories.action";
import { toast } from "sonner";

interface Props {
  categories: Category[];
  menuId: string;
}

export default function CategoryEditTable({ categories, menuId }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const [optimisticCategories, addOptimisticCategory] = useOptimistic(
    categories,
    (state, newCategory: Category) => [...state, newCategory],
  );

  function handleCancel() {
    setIsEditing(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = inputRef.current?.value.trim();
    if (!name) return;

    const optimisticEntry: Category = {
      id: `optimistic-${Date.now()}`,
      menu_id: menuId,
      name,
      position: optimisticCategories.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    startTransition(async () => {
      addOptimisticCategory(optimisticEntry);
      handleCancel();

      const { error } = await createCategory({ menu_id: menuId, name });

      if (error) {
        toast("Error al crear categoría");
      }

      toast.success("Se creo la categoría correctamente");
    });
  }

  return (
    <div className="flex flex-col w-full max-w-md bg-white border border-[#E4E4E6] h-screen">
      <div className="flex flex-col p-4 border-b">
        <h2 className="text-[#0F172A] text-base font-extrabold">
          Gestión de contenidos
        </h2>
        <p className="text-[#58606E] text-sm">
          Gestiona nombres, descripciones y detalles de cada plato
        </p>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        {optimisticCategories.map((category) => (
          <div
            key={category.id}
            className="flex items-center px-4 py-3 border-b border-[#E4E4E6] text-sm text-[#0F172A]"
          >
            {category.name}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              autoFocus
              type="text"
              placeholder="Ej. Platos principales"
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 text-[#114821] rounded-none cursor-pointer bg-white"
            >
              {isPending ? (
                <LoaderIcon className="text-white animate-spin" />
              ) : (
                <CheckIcon className="size-8" fill="#64748B" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={handleCancel}
              className="rounded-none text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <XIcon />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-white border border-[#E4E4E6] py-6 w-full rounded-none cursor-pointer"
          >
            <span className="flex items-center gap-2 text-[#114821] text-base font-semibold">
              <PlusIcon /> Añadir categoría
            </span>
          </Button>
        )}
      </form>
    </div>
  );
}
