"use client";

import { useOptimistic, useTransition, useRef, useMemo } from "react";
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
import GrapIcon from "../icons/GrapIcon";
import { cn } from "@/lib/utils";

interface Props {
  menuId: string;
  categories: Category[];
  selectedCategoryId: string | null;
  selectedProductId: string | null;
  onSelectCategory: (id: string) => void;
  onSelectProduct: (id: string) => void;
}

export default function CategoryEditTable({
  categories,
  menuId,
  selectedCategoryId,
  selectedProductId,
  onSelectCategory,
  onSelectProduct,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const [optimisticCategories, addOptimisticCategory] = useOptimistic(
    categories,
    (state, newCategory: Category) => [...state, newCategory],
  );

  const effectiveSelectedId = useMemo(() => {
    if (optimisticCategories.length === 0) return null;
    return selectedCategoryId ?? optimisticCategories[0].id;
  }, [optimisticCategories, selectedCategoryId]);

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

      const { error } = await createCategory({ menu_id: menuId, name });

      if (error) return toast.error("Error al crear categoría");

      toast.success("Categoría creada");
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

      <div className="py-6 flex flex-col gap-1 px-4">
        {optimisticCategories.map((category) => {
          const isSelected = effectiveSelectedId === category.id;

          return (
            <div key={category.id}>
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "h-auto w-full p-4 justify-between rounded-none text-[#1C1C1C] bg-white text-sm font-semibold capitalize",
                  isSelected && "bg-[#CDF5454D] hover:bg-[#CDF5454D]",
                )}
                style={{
                  borderLeft: isSelected
                    ? "2px solid #114821"
                    : "2px solid transparent",
                }}
                onClick={() => {
                  onSelectCategory(category.id);
                }}
                aria-pressed={isSelected}
              >
                {category.name} <GrapIcon />
              </Button>

              {isSelected && (
                <div className="ml-4">
                  {category.products?.map((product) => {
                    const isProductSelected =
                      selectedProductId === product.id;

                    return (
                      <button
                        key={product.id}
                        onClick={() => onSelectProduct(product.id)}
                        className={cn(
                          "block w-full text-left p-2 text-sm",
                          isProductSelected && "bg-gray-200",
                        )}
                      >
                        {product.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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
