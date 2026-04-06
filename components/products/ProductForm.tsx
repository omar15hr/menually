"use client";

import { useActionState, useState } from "react";
import LoaderIcon from "../icons/LoaderIcon";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { MultiSelectChips } from "./MultiSelectChips";
import PhotoUpload from "../shared/PhotoUpload";
import { cn } from "@/lib/utils";
import CameraIcon from "../icons/CameraIcon";
import XIcon from "../icons/XIcon";
import Image from "next/image";
import { createProduct } from "@/actions/product.action";

const OPTIONS = [
  { label: "Keto",        value: "keto" },
  { label: "Vegano",      value: "vegan" },
  { label: "Apto APLV",  value: "aplv" },
  { label: "Picante",     value: "spicy" },
  { label: "Sin gluten",  value: "gluten_free" },
  { label: "Vegetariano", value: "vegetarian" },
];

export default function ProductForm({ categoryId }: { categoryId: string }) {
  const [state, formAction, isPending] = useActionState(createProduct, null);
  const [productImageUrl, setProductImageUrl] = useState("");

  return (
    <form className="flex flex-col gap-6 bg-white p-6 border border-[#E4E4E6] rounded-lg" action={formAction}>
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
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-[#58606E] text-sm">
          Filtra por preferencias y características
        </Label>
        <MultiSelectChips options={OPTIONS} name="tags" />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[#58606E] text-sm">Imagen del producto</span>
        <PhotoUpload imagePath={"products"} onPhotoUploaded={setProductImageUrl}>
          <div
            className={cn(
              "flex gap-4 justify-center rounded-2xl p-4 cursor-pointer transition-colors items-center",
              productImageUrl
                ? "border-[#E4E4E6] border-2"
                : "border-dashed border-[#E4E4E6] border-2",
            )}
          >
            {productImageUrl ? (
              <Image
                src={productImageUrl}
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
                  <p className="text-[#58606E]">
                    Recomendado 328 x 200px PNG.
                  </p>
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

      <Button
        type="submit"
        disabled={isPending || !categoryId}
        className="bg-[#CDF545] text-[#114821] text-sm font-bold cursor-pointer w-fit"
      >
        {isPending ? (
          <LoaderIcon className="animate-spin" />
        ) : (
          "Añadir producto"
        )}
      </Button>
    </form>
  );
}
