"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useActionState, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import XIcon from "../icons/XIcon";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Textarea } from "../ui/textarea";
import CameraIcon from "../icons/CameraIcon";
import PhotoUpload from "../shared/PhotoUpload";
import { Database } from "@/types/database.types";
import { useMenuStore } from "@/store/useMenuStore";
import { MultiSelectChips } from "./MultiSelectChips";
import { createProduct } from "@/actions/product.action";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductLabel = Database["public"]["Enums"]["product_label"];

const OPTIONS = [
  { label: "Keto", value: "keto" },
  { label: "Vegano", value: "vegan" },
  { label: "Apto APLV", value: "aplv" },
  { label: "Picante", value: "spicy" },
  { label: "Sin gluten", value: "gluten_free" },
  { label: "Vegetariano", value: "vegetarian" },
];

interface Props {
  categoryId: string;
  product?: Product | null;
}

export default function ProductForm({ categoryId, product }: Props) {
  const [state, formAction, isPending] = useActionState(createProduct, null);
  const [productImageUrl, setProductImageUrl] = useState(
    product?.image_url ?? "",
  );
  const formRef = useRef<HTMLFormElement>(null);
  const { addProduct, selectProduct } = useMenuStore();

  useEffect(() => {
    if (state?.success && state?.product) {
      toast.success(state.message);
      addProduct(categoryId, state.product);
      selectProduct(state.product.id);
      formRef.current?.reset();
    } else if (state?.success === false && state?.message) {
      toast.error(state.message);
    }
  }, [state, categoryId, addProduct, selectProduct]);

  const isEditMode = !!product;
  const productImage = productImageUrl || product?.image_url || "";

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-6 bg-white p-6 border border-[#E4E4E6] rounded-lg"
      action={formAction}
    >
      <input type="hidden" name="category_id" value={categoryId ?? ""} />
      <input type="hidden" name="image_url" value={productImageUrl} />

      <div className="flex gap-2 w-full justify-between">
        <div className="flex flex-col gap-2 w-full">
          <Label htmlFor="product-name" className="text-[#58606E] text-sm">
            Nombre de producto
          </Label>
          <Input
            id="product-name"
            name="name"
            placeholder="Nombre del producto"
            defaultValue={product?.name ?? ""}
            key={product?.id ?? "new-name"}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="product-price" className="text-[#58606E] text-sm">
            Precio
          </Label>
          <Input
            id="product-price"
            name="price"
            type="text"
            inputMode="numeric"
            placeholder="$"
            defaultValue={product?.price != null ? String(product.price) : ""}
            key={product?.id ?? "new-price"}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-description" className="text-[#58606E] text-sm">
          Descripción del producto
        </Label>
        <Textarea
          id="product-description"
          name="description"
          placeholder="Descripción"
          defaultValue={product?.description ?? ""}
          key={product?.id ?? "new-desc"}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-[#58606E] text-sm">
          Filtra por preferencias y características
        </Label>
        <MultiSelectChips
          key={product?.id ?? "new-tags"}
          options={OPTIONS}
          name="tags"
          value={(product?.labels ?? []) as ProductLabel[]}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[#58606E] text-sm">Imagen del producto</span>
        <PhotoUpload
          imagePath={"products"}
          onPhotoUploaded={setProductImageUrl}
        >
          <div
            className={cn(
              "flex gap-4 justify-center rounded-2xl p-4 cursor-pointer transition-colors items-center",
              productImageUrl
                ? "border-[#E4E4E6] border-2"
                : "border-dashed border-[#E4E4E6] border-2",
            )}
          >
            {productImage ? (
              <Image
                src={productImage}
                alt="Image placeholder"
                width={300}
                height={300}
                className="rounded-lg size-15"
              />
            ) : (
              <span className="bg-[#E5E7EA] px-2.5 py-4 rounded-full">
                <CameraIcon />
              </span>
            )}
            <div className="text-sm w-full">
              {!productImageUrl ? (
                <div className="">
                  <h2 className="text-[#1C1C1C] font-semibold">
                    Sube una imagen
                  </h2>
                  <p className="text-[#58606E]">Recomendado 328 x 200px PNG.</p>
                  <span className="text-[#25B205]">Seleccionar archivo</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[#58606E]">
                  <span>Archivo subido</span>
                  <XIcon />
                </div>
              )}
            </div>
          </div>
        </PhotoUpload>
      </div>
      <div className="flex items-center justify-between">
        <Button
          type="submit"
          disabled={isPending || !categoryId}
          className="w-fit text-base bg-[#CDF545] hover:bg-[#c0e740] text-[#114821] font-semibold py-2 px-4 rounded-lg h-10 cursor-pointer transition-colors"
        >
          {isPending ? (
            <span className="flex gap-2 justify-center items-center"><Spinner /> Guardar cambios</span>
          ) : isEditMode ? (
            "Guardar cambios"
          ) : (
            "Añadir producto"
          )}
        </Button>

        {isEditMode && (
          <Button
            type="button"
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 text-sm gap-2 cursor-pointer"
          >
            🗑 Eliminar producto
          </Button>
        )}
      </div>
    </form>
  );
}
