"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  Trash2Icon,
  AlertTriangleIcon,
  ChevronDownIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { importMenu } from "@/actions/ai-import-menu.action";
import { useImportStore } from "@/store/useImportStore";
import type {
  ImportedMenu,
  ImportedProduct,
} from "@/lib/types/ai-import.types";

export function MenuImportPreview() {
  const router = useRouter();
  const {
    importedData,
    confidenceWarning,
    setStep,
    setLoading,
    setImportResult,
    setError,
    reset,
  } = useImportStore();

  const [data, setData] = useState<ImportedMenu>(importedData!);
  const [isImporting, setIsImporting] = useState(false);
  const [openCategories, setOpenCategories] = useState<Set<number>>(new Set());

  const toggleCategory = useCallback((index: number) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const isCategoryOpen = useCallback(
    (index: number) => openCategories.has(index),
    [openCategories],
  );

  const updateCategory = useCallback((index: number, name: string) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, name } : cat,
      ),
    }));
  }, []);

  const updateProduct = useCallback(
    (
      catIndex: number,
      prodIndex: number,
      updates: Partial<ImportedProduct>,
    ) => {
      setData((prev) => ({
        ...prev,
        categories: prev.categories.map((cat, ci) =>
          ci === catIndex
            ? {
                ...cat,
                products: cat.products.map((prod, pi) =>
                  pi === prodIndex ? { ...prod, ...updates } : prod,
                ),
              }
            : cat,
        ),
      }));
    },
    [],
  );

  const addCategory = useCallback(() => {
    setData((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { name: "Nueva categoría", products: [] },
      ],
    }));
  }, []);

  const removeCategory = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  }, []);

  const removeProduct = useCallback((catIndex: number, prodIndex: number) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, ci) =>
        ci === catIndex
          ? {
              ...cat,
              products: cat.products.filter((_, pi) => pi !== prodIndex),
            }
          : cat,
      ),
    }));
  }, []);

  const handleCancel = useCallback(() => {
    reset();
    setStep("upload");
  }, [reset, setStep]);

  const handleImport = useCallback(async () => {
    setIsImporting(true);
    setLoading(true, "Importando menú...");

    try {
      const result = await importMenu(data);

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      if (result.result) {
        setImportResult(result.result);
        setStep("success");

        const {
          categoriesAdded,
          categoriesSkipped,
          productsAdded,
          productsSkipped,
        } = result.result;

        toast.success("Menú importado correctamente", {
          description: `${categoriesAdded} categorías y ${productsAdded} productos agregados${
            categoriesSkipped > 0 || productsSkipped > 0
              ? ` (${categoriesSkipped + productsSkipped} saltados)`
              : ""
          }`,
        });

        // Redirect to menu content after a short delay
        setTimeout(() => {
          router.push("/dashboard/menu/menu-content");
        }, 1500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      toast.error("Error al importar el menú");
    } finally {
      setIsImporting(false);
      setLoading(false);
    }
  }, [data, router, setImportResult, setLoading, setStep, setError]);

  if (!data) return null;

  const allProducts = data.categories.flatMap((cat) => cat.products);
  const totalProducts = allProducts.length;
  const totalWithPrice = allProducts.filter(
    (p) => p.price !== null && p.price !== undefined,
  ).length;
  const totalWithDescription = allProducts.filter(
    (p) =>
      p.description !== null &&
      p.description !== undefined &&
      p.description.trim() !== "",
  ).length;

  return (
    <div className="flex flex-col gap-6 mt-10">
      {/* Confidence Warning */}
      {confidenceWarning && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          <AlertTriangleIcon className="size-5 shrink-0" />
          <div>
            <p className="font-medium">Precisión baja detectada</p>
            <p className="text-sm">
              La IA tuvo dificultades para leer el archivo. Verificá los datos
              antes de importar.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="flex w-full items-center py-6 bg-[#FBFBFA] rounded-2xl divide-x divide-[#E2E8F0]">
        <div className="px-4 text-center w-full">
          <h2 className="text-base font-bold text-[#1C1C1C]">
            {data.categories.length}
          </h2>
          <span className="text-sm text-[#58606E]">Categorías</span>
        </div>
        <div className="px-4 text-center w-full">
          <h2 className="text-base font-bold text-[#1C1C1C]">
            {totalProducts}
          </h2>
          <span className="text-sm text-[#58606E]">Productos</span>
        </div>
        <div className="px-4 text-center w-full">
          <h2 className="text-base font-bold text-[#1C1C1C]">
            {totalWithPrice}
          </h2>
          <span className="text-sm text-[#58606E]">Precios</span>
        </div>
        <div className="px-4 text-center w-full">
          <h2 className="text-base font-bold text-[#1C1C1C]">
            {totalWithDescription}
          </h2>
          <span className="text-sm text-[#58606E]">Descripciones</span>
        </div>
      </div>

      {/* Categories List with Collapsible */}
      <div className="flex flex-col gap-3">
        {data.categories.map((category, catIndex) => (
          <Collapsible
            key={catIndex}
            open={isCategoryOpen(catIndex)}
            onOpenChange={() => toggleCategory(catIndex)}
            className="rounded-lg border border-[#E4E4E6] bg-white overflow-hidden"
          >
            <CollapsibleTrigger className="w-full cursor-pointer">
              <div className="flex items-center gap-3 px-6 py-4 hover:bg-[#FBFBFA] transition-colors w-full">
                <Input
                  value={category.name}
                  onChange={(e) => updateCategory(catIndex, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 w-fit text-lg"
                  placeholder="Nombre de categoría"
                />
                <div className="ml-auto flex items-center gap-2">
                  <span className="bg-[#F1F5F9] p-1 rounded-full text-[#1C1C1C]">
                    <ChevronDownIcon
                      className={`size-5 text-[#58606E] transition-transform duration-200 ${
                        isCategoryOpen(catIndex) ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCategory(catIndex);
                    }}
                    className="text-[#58606E] hover:text-red-500 h-8 w-8 cursor-pointer"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="border-t border-[#E4E4E6] p-4">
                {/* Products Table */}
                <div className="rounded-2xl overflow-hidden border border-[#E4E4E6]">
                  {category.products.length > 0 && (
                    <Table className="border-0">
                      <TableHeader>
                        <TableRow className="bg-[#F8FAFC]">
                          <TableHead className="font-semibold w-[25%] text-center pl-6">
                            Producto
                          </TableHead>
                          <TableHead className="font-semibold w-[15%] text-center">
                            Estado
                          </TableHead>
                          <TableHead className="font-semibold w-[35%] text-center">
                            Descripción
                          </TableHead>
                          <TableHead className="font-semibold w-[15%] text-center">
                            Precio
                          </TableHead>
                          <TableHead className="font-semibold w-[10%] text-center pr-6">
                            Acciones
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.products.map((product, prodIndex) => (
                          <TableRow key={prodIndex} className="group">
                            <TableCell className="py-3 px-2 text-center pl-6">
                              <Input
                                value={product.name}
                                onChange={(e) =>
                                  updateProduct(catIndex, prodIndex, {
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Nombre del producto"
                                className="font-medium w-full"
                              />
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              {(() => {
                                const isNameMissing =
                                  !product.name || product.name.trim() === "";
                                const isDescMissing =
                                  !product.description ||
                                  product.description.trim() === "";
                                const isPriceMissing =
                                  product.price === null ||
                                  product.price === undefined;

                                if (isNameMissing)
                                  return (
                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium bg-[#F5DE454D] text-[#866700] border border-[#F5DE454D]">
                                      Falta nombre
                                    </span>
                                  );
                                if (isDescMissing)
                                  return (
                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium bg-[#F5DE454D] text-[#866700] border border-[#F5DE454D]">
                                      Falta descripción
                                    </span>
                                  );
                                if (isPriceMissing)
                                  return (
                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium bg-[#F5DE454D] text-[#866700] border border-[#F5DE454D]">
                                      Falta precio
                                    </span>
                                  );
                                return (
                                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-medium bg-[#CDF5454D] text-[#114821] border border-[#CDF5454D]">
                                    Completo
                                  </span>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="py-3 px-2 text-center">
                              <Input
                                value={product.description ?? ""}
                                onChange={(e) =>
                                  updateProduct(catIndex, prodIndex, {
                                    description: e.target.value || undefined,
                                  })
                                }
                                placeholder="Descripción (opcional)"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              <div className="relative w-fit mx-auto">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#58606E] text-sm select-none">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  value={product.price ?? ""}
                                  onChange={(e) =>
                                    updateProduct(catIndex, prodIndex, {
                                      price: e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                    })
                                  }
                                  placeholder="0"
                                  min={0}
                                  step={1}
                                  className="text-center w-24 pl-7 mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-center pr-6">
                              <Button
                                variant="default"
                                size="icon"
                                onClick={() =>
                                  removeProduct(catIndex, prodIndex)
                                }
                                className="text-[#58606E] hover:text-red-500 h-8 w-8 bg-transparent cursor-pointer"
                              >
                                <Trash2Icon className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Empty State */}
      {data.categories.length === 0 && (
        <div className="py-8 text-center text-[#58606E]">
          <p>No hay categorías para importar.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={addCategory}
            className="mt-2 gap-2"
          >
            <PlusIcon className="size-4" />
            Agregar categoría
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="text-[#114821] px-4 py-2 rounded-lg font-semibold text-base h-10 border-none cursor-pointer"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleImport}
          disabled={isImporting || data.categories.length === 0}
          className="bg-[#CDF545] hover:bg-[#CDF545]/90 text-[#114821] px-4 py-2 rounded-lg font-semibold text-base h-10 cursor-pointer"
        >
          {isImporting ? "Importando menú..." : "Confirmar"}
        </Button>
      </div>
    </div>
  );
}
