"use client";

import { toast } from "sonner";
import {
  useOptimistic,
  useMemo,
  startTransition,
} from "react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { cn } from "@/lib/utils";
import { useMenuStore } from "@/store/useMenuStore";
import type { CategoryWithProducts } from "@/types/categories.types";
import { createCategory, reorderCategories } from "@/actions/categories.action";
import SortableCategoryItem from "./SortableCategoryItem";
import { AddCategoryForm } from "./AddCategoryForm";

interface Props {
  menuId: string;
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

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

  async function handleCategorySubmit(name: string) {
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

    if (error) {
      return { error };
    }

    return {};
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

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
                  <SortableCategoryItem
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

      <AddCategoryForm onSubmit={handleCategorySubmit} />
    </div>
  );
}
