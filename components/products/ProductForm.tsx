"use client";

import { useState } from "react";
import LoaderIcon from "../icons/LoaderIcon";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { MultiSelectChips } from "./MultiSelectChips";

const OPTIONS = [
  { label: "Picante", value: "picante" },
  { label: "Keto", value: "keto" },
  { label: "Vegano", value: "vegano" },
  { label: "Vegetariano", value: "vegetariano" },
  { label: "Sin gluten", value: "sin_gluten" },
  { label: "Apto APLV", value: "aplv" },
];

export default function ProductForm({ product, categoryId }: any) {
  const [isPending, startTransition] = useState();

  return (
    <form className="flex flex-col gap-6 bg-white p-6 border border-[#E4E4E6] rounded-lg">
      <input type="hidden" name="category_id" value={categoryId ?? ""} />

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
        <div className="flex border border-[#E4E4E6] items-center gap-2 p-4 rounded-lg">
          hola
        </div>
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
