"use client";

import PencilIcon from "../icons/PencilIcont";
import ProductForm from "./ProductForm";
import { Database } from "@/types/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

type CategoryWithProducts =
  Database["public"]["Tables"]["categories"]["Row"] & {
    products: Product[];
  };

interface Props {
  category: CategoryWithProducts;
  product: Product;
}

export default function ProductPanel({ category, product }: Props) {
  if (!category) {
    return <div className="p-6">Selecciona una categoría</div>;
  }

  return (
    <div className="flex-1 p-6">
      <span className="flex gap-2 items-center mb-4">
        <h2 className="text-xl font-bold">{category.name}</h2>
        <PencilIcon />
      </span>

      <ProductForm product={product} categoryId={category.id} />
    </div>
  );
}
