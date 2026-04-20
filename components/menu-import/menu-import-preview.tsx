"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, Trash2Icon, AlertTriangleIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { importMenu } from "@/actions/ai-import-menu.action";
import { useImportStore } from "@/store/useImportStore";
import type { ImportedMenu, ImportedProduct } from "@/lib/types/ai-import.types";

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

  const updateCategory = useCallback((index: number, name: string) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, name } : cat
      ),
    }));
  }, []);

  const updateProduct = useCallback(
    (catIndex: number, prodIndex: number, updates: Partial<ImportedProduct>) => {
      setData((prev) => ({
        ...prev,
        categories: prev.categories.map((cat, ci) =>
          ci === catIndex
            ? {
              ...cat,
              products: cat.products.map((prod, pi) =>
                pi === prodIndex ? { ...prod, ...updates } : prod
              ),
            }
            : cat
        ),
      }));
    },
    []
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

  const addProduct = useCallback((catIndex: number) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === catIndex
          ? { ...cat, products: [...cat.products, { name: "", price: null }] }
          : cat
      ),
    }));
  }, []);

  const removeProduct = useCallback((catIndex: number, prodIndex: number) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, ci) =>
        ci === catIndex
          ? { ...cat, products: cat.products.filter((_, pi) => pi !== prodIndex) }
          : cat
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

        const { categoriesAdded, categoriesSkipped, productsAdded, productsSkipped } =
          result.result;

        toast.success("Menú importado correctamente", {
          description: `${categoriesAdded} categorías y ${productsAdded} productos agregados${categoriesSkipped > 0 || productsSkipped > 0
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
  const totalWithPrice = allProducts.filter((p) => p.price !== null && p.price !== undefined).length;
  const totalWithDescription = allProducts.filter(
    (p) => p.description !== null && p.description !== undefined && p.description.trim() !== ""
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

      {/* Summary */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#FBFBFA] rounded-2xl divide-x divide-[#E4E4E6]">
        <div className="flex flex-1 flex-col gap-1 justify-center items-center">
          <h2 className="text-xl font-bold text-[#1C1C1C]">{data.categories.length}</h2>
          <span className="text-sm text-[#58606E]">Categorías</span>
        </div>
        <div className="flex flex-1 flex-col gap-1 justify-center items-center">
          <h2 className="text-xl font-bold text-[#1C1C1C]">{totalProducts}</h2>
          <span className="text-sm text-[#58606E]">Productos</span>
        </div>
        <div className="flex flex-1 flex-col gap-1 justify-center items-center">
          <h2 className="text-xl font-bold text-[#1C1C1C]">{totalWithPrice}</h2>
          <span className="text-sm text-[#58606E]">Precios</span>
        </div>
        <div className="flex flex-1 flex-col gap-1 justify-center items-center">
          <h2 className="text-xl font-bold text-[#1C1C1C]">{totalWithDescription}</h2>
          <span className="text-sm text-[#58606E]">Descripciones</span>
        </div>
      </div>

      {/* Categories List */}
      <div className="flex flex-col gap-4">
        {data.categories.map((category, catIndex) => (
          <div
            key={catIndex}
            className="rounded-lg border border-[#E4E4E6] bg-white p-4"
          >
            {/* Category Header */}
            <div className="mb-4 flex items-center gap-3">
              <Input
                value={category.name}
                onChange={(e) => updateCategory(catIndex, e.target.value)}
                className="font-semibold"
                placeholder="Nombre de categoría"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCategory(catIndex)}
                className="text-[#58606E] hover:text-red-500"
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>

            {/* Products List */}
            <div className="flex flex-col gap-2">
              {category.products.map((product, prodIndex) => (
                <div
                  key={prodIndex}
                  className="flex items-start gap-3 rounded-md bg-[#FBFBFA] p-3"
                >
                  <div className="flex flex-1 flex-col gap-2">
                    <Input
                      value={product.name}
                      onChange={(e) =>
                        updateProduct(catIndex, prodIndex, { name: e.target.value })
                      }
                      placeholder="Nombre del producto"
                      className="font-medium"
                    />
                    <div className="flex gap-2">
                      <div className="w-24">
                        <Input
                          type="number"
                          value={product.price ?? ""}
                          onChange={(e) =>
                            updateProduct(catIndex, prodIndex, {
                              price: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          placeholder="Precio"
                          min={0}
                          step={1}
                        />
                      </div>
                      <Input
                        value={product.description ?? ""}
                        onChange={(e) =>
                          updateProduct(catIndex, prodIndex, {
                            description: e.target.value || undefined,
                          })
                        }
                        placeholder="Descripción (opcional)"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProduct(catIndex, prodIndex)}
                    className="text-[#58606E] hover:text-red-500"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Product Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addProduct(catIndex)}
              className="mt-3 gap-2 text-[#58606E]"
            >
              <PlusIcon className="size-4" />
              Agregar producto
            </Button>
          </div>
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

      <Separator />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleCancel} className="text-[#114821] px-4 py-2 rounded-lg font-semibold text-base h-10 border-none cursor-pointer">
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
