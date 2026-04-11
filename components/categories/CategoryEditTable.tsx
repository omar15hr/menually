"use client";

import { useOptimistic, useRef, useMemo, useState, startTransition } from "react";
import { Category } from "@/types/categories.types";
import type { Tables } from "@/types/database.types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import PlusIcon from "../icons/PlusIcon";
import LoaderIcon from "../icons/LoaderIcon";
import XIcon from "../icons/XIcon";
import CheckIcon from "../icons/CheckIcon";
import GripIcon from "../icons/GrapIcon";
import { createCategory, reorderCategories } from "@/actions/categories.action";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMenuStore } from "@/store/useMenuStore";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type CategoryWithProducts = Category & {
  products: Tables<"products">[];
};

interface Props {
  menuId: string;
}

interface SortableCategoryProps {
  category: CategoryWithProducts;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function SortableCategory({
  category,
  isSelected,
  onSelect,
}: SortableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
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
        onClick={() => onSelect(category.id)}
        aria-pressed={isSelected}
      >
        {category.name}
        <span
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripIcon />
        </span>
      </Button>
    </div>
  );
}

export default function CategoryEditTable({ menuId }: Props) {
  const {
    categories,
    selectedCategoryId,
    selectedProductId,
    selectCategory,
    selectProduct,
    reorderCategories: reorderStoreCategories,
  } = useMenuStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  function handleCancel() {
    setIsEditing(false);
    if (inputRef.current) inputRef.current.value = "";
  }
  const inputRef = useRef<HTMLInputElement>(null);

  const [optimisticCategories, addOptimisticCategory] = useOptimistic(
    categories,
    (state, newCategory: CategoryWithProducts): CategoryWithProducts[] => [
      ...state,
      newCategory,
    ],
  );

  const effectiveSelectedId = useMemo(() => {
    if (optimisticCategories.length === 0) return null;
    return selectedCategoryId ?? optimisticCategories[0].id;
  }, [optimisticCategories, selectedCategoryId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = inputRef.current?.value.trim();
    if (!name) return;

    setIsPending(true);

    const optimisticEntry: CategoryWithProducts = {
      id: `optimistic-${Date.now()}`,
      menu_id: menuId,
      name,
      position: optimisticCategories.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      products: [],
    };

    startTransition(() => {
      addOptimisticCategory(optimisticEntry);
    });

    const { error } = await createCategory({ menu_id: menuId, name });

    if (error) return toast.error("Error al crear categoría");
    setIsPending(false);
    toast.success("Categoría creada");
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Store current order for rollback
    const previousOrder = [...categories];

    // Optimistic update
    reorderStoreCategories(oldIndex, newIndex);

    // Persist to database
    const reorderedCategories = [...categories];
    const [removed] = reorderedCategories.splice(oldIndex, 1);
    reorderedCategories.splice(newIndex, 0, removed);

    const payload = {
      categories: reorderedCategories.map((cat, index) => ({
        id: cat.id,
        position: index,
      })),
    };

    const { error } = await reorderCategories(payload);

    if (error) {
      // Rollback on error
      reorderStoreCategories(newIndex, oldIndex);
      toast.error("Error al reordenar categorías");
    }
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={optimisticCategories.map((cat) => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="py-6 flex flex-col gap-1 px-4">
            {optimisticCategories.map((category) => {
              const isSelected = effectiveSelectedId === category.id;

              return (
                <div key={category.id}>
                  <SortableCategory
                    category={category}
                    isSelected={isSelected}
                    onSelect={selectCategory}
                  />

                  {isSelected && (
                    <div className="ml-4">
                      {category.products?.map((product) => {
                        const isProductSelected =
                          selectedProductId === product.id;

                        return (
                          <button
                            key={product.id}
                            onClick={() => selectProduct(product.id)}
                            className={cn(
                              "block w-full text-left p-2 text-xs text-[#58606E] my-1",
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
        </SortableContext>
      </DndContext>

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
