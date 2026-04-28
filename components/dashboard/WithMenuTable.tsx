"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TrashIcon from "@/components/icons/TrashIcon";
import {
  batchUpdateProducts,
  deleteProduct,
  type ProductUpdate,
} from "@/actions/product.action";
import type { Database } from "@/types/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

type ProductWithCategory = Product & {
  categoryName: string;
};

interface Props {
  products: ProductWithCategory[];
}

export default function WithMenuTable({ products }: Props) {
  const [localProducts, setLocalProducts] =
    useState<ProductWithCategory[]>(products);

  // Dirty tracking: solo los campos que cambiaron, indexados por product ID
  const [pendingChanges, setPendingChanges] = useState<
    Map<string, Partial<ProductUpdate>>
  >(new Map());

  // Delete dialog state
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Submit state
  const [isSaving, setIsSaving] = useState(false);

  // Derivado — ¿hay cambios pendientes?
  const hasChanges = useMemo(() => pendingChanges.size > 0, [pendingChanges]);

  // -------------------------
  // HANDLERS — edición inline
  // -------------------------

  const handleFieldChange = useCallback(
    (
      id: string,
      field: keyof ProductUpdate,
      value: string | number | boolean | null,
    ) => {
      // 1. Actualizar UI local
      setLocalProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
      );

      // 2. Acumular en pendingChanges
      setPendingChanges((prev) => {
        const next = new Map(prev);
        const existing = next.get(id) ?? {};

        // Buscar el valor original del server
        const original = products.find((p) => p.id === id);
        const originalValue = original?.[field];

        // Si volvió al valor original, eliminar ese campo del diff
        if (originalValue === value) {
          const { [field]: _, ...rest } = existing;
          if (Object.keys(rest).length === 0) {
            next.delete(id);
          } else {
            next.set(id, rest);
          }
        } else {
          next.set(id, { ...existing, [field]: value });
        }

        return next;
      });
    },
    [products],
  );

  // -------------------------
  // HANDLERS — submit + discard
  // -------------------------

  const handleSubmit = useCallback(async () => {
    if (pendingChanges.size === 0) return;

    setIsSaving(true);

    const updates = Array.from(pendingChanges.entries()).map(([id, data]) => ({
      id,
      data,
    }));

    const result = await batchUpdateProducts(updates);

    setIsSaving(false);

    if (result.success) {
      toast.success(result.message);
      // Los valores locales ahora SON la nueva fuente de verdad
      setPendingChanges(new Map());
    } else {
      toast.error("Error al guardar", { description: result.message });
    }
  }, [pendingChanges]);

  const handleDiscard = useCallback(() => {
    setLocalProducts(products);
    setPendingChanges(new Map());
  }, [products]);

  // -------------------------
  // HANDLERS — delete + dialog
  // -------------------------

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDeleteId) return;

    setIsDeleting(true);

    // Optimistic: remove from UI
    setLocalProducts((prev) => prev.filter((p) => p.id !== pendingDeleteId));

    // Limpiar cambios pendientes del producto eliminado
    setPendingChanges((prev) => {
      const next = new Map(prev);
      next.delete(pendingDeleteId);
      return next;
    });

    setPendingDeleteId(null);

    const result = await deleteProduct(pendingDeleteId);

    setIsDeleting(false);

    if (!result.success) {
      toast.error("No se pudo eliminar el producto", {
        description: result.message,
      });
      // Revert
      setLocalProducts((prev) => {
        const deleted = products.find((p) => p.id === pendingDeleteId);
        if (!deleted) return prev;
        return [...prev, deleted];
      });
    } else {
      toast.success("Producto eliminado");
    }
  }, [pendingDeleteId, products]);

  // -------------------------
  // RENDER
  // -------------------------

  return (
    <>
      {/* Tabla */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="py-4 px-6 font-semibold text-gray-700">
                Producto
              </TableHead>
              <TableHead className="py-4 px-6 font-semibold text-gray-700">
                Categoría
              </TableHead>
              <TableHead className="py-4 px-6 font-semibold text-gray-700">
                Descripción
              </TableHead>
              <TableHead className="py-4 px-6 font-semibold text-gray-700">
                Precio
              </TableHead>
              <TableHead className="py-4 px-6 font-semibold text-gray-700 text-center">
                Disponibilidad
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {localProducts.map((product) => (
              <TableRow key={product.id} className="hover:bg-gray-50/50">
                {/* Nombre */}
                <TableCell className="py-4 px-6">
                  <Input
                    value={product.name}
                    onChange={(e) =>
                      handleFieldChange(product.id, "name", e.target.value)
                    }
                    className="text-sm font-medium text-gray-600 border-transparent bg-transparent hover:border-gray-200 focus:border-gray-300 transition-colors"
                  />
                </TableCell>

                {/* Categoría (solo lectura) */}
                <TableCell className="py-4 px-6 text-sm text-gray-600">
                  {product.categoryName}
                </TableCell>

                {/* Descripción */}
                <TableCell className="py-4 px-6">
                  <Input
                    value={product.description ?? ""}
                    onChange={(e) =>
                      handleFieldChange(
                        product.id,
                        "description",
                        e.target.value || null,
                      )
                    }
                    placeholder="Sin descripción"
                    className="text-xs text-gray-500 border-transparent bg-transparent hover:border-gray-200 focus:border-gray-300 transition-colors w-48"
                  />
                </TableCell>

                {/* Precio */}
                <TableCell className="py-4 px-6">
                  <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 w-28 bg-white focus-within:border-gray-300 transition-colors">
                    <span className="text-gray-500 font-medium mr-1 select-none">
                      $
                    </span>
                    <input
                      type="number"
                      value={product.price ?? ""}
                      onChange={(e) =>
                        handleFieldChange(
                          product.id,
                          "price",
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      min={0}
                      step={1}
                      className="w-full outline-none text-sm font-medium text-gray-700 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </TableCell>

                {/* Disponibilidad + Delete */}
                <TableCell className="py-4 px-6">
                  <div className="flex items-center justify-center space-x-6">
                    <Switch
                      checked={product.is_available ?? true}
                      onCheckedChange={(checked) =>
                        handleFieldChange(product.id, "is_available", checked)
                      }
                    />
                    <button
                      onClick={() => setPendingDeleteId(product.id)}
                      className="p-2 bg-[#AB050533] text-[#AB0505] rounded-full hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {localProducts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  No hay productos en este menú.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Barra fixed de cambios pendientes */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
          hasChanges
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-[#CDF545] animate-pulse" />
              <p className="text-sm font-medium text-[#1C1C1C]">
                Tenés{" "}
                <span className="font-bold">
                  {pendingChanges.size} producto
                  {pendingChanges.size > 1 ? "s" : ""}
                </span>{" "}
                con cambios sin guardar
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleDiscard}
                disabled={isSaving}
                className="text-[#475569] font-semibold hover:bg-gray-100 h-10 px-5 cursor-pointer"
              >
                Descartar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-[#CDF545] hover:bg-[#CDF545]/90 text-[#114821] font-semibold h-10 px-6 rounded-lg cursor-pointer"
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <DialogContent showCloseButton className="sm:max-w-125 p-8">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-[#0F172A] font-bold text-2xl leading-tight">
              ¿Estás seguro que querés eliminar este producto?
            </DialogTitle>
            <DialogDescription className="text-[#64748B] text-base">
              Se eliminará permanentemente. Si lo necesitás después, tendrás que
              crearlo nuevamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-transparent border-none p-0 mt-6 sm:justify-end gap-3">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="text-[#475569] font-semibold hover:bg-gray-100 h-11 px-6 cursor-pointer"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-[#B60000] hover:bg-[#B60000]/90 text-white font-semibold h-11 px-6 rounded-lg cursor-pointer"
            >
              {isDeleting ? "Eliminando..." : "Eliminar producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
