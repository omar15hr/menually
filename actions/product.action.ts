"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type ProductLabel = Database["public"]["Enums"]["product_label"];

export async function createProduct(_prevState: unknown, formData: FormData) {
  const category_id = formData.get("category_id")?.toString() ?? "";
  const name = formData.get("name")?.toString() ?? "";
  const description = formData.get("description")?.toString();
  const price = formData.get("price")?.toString() ?? "";
  const image_url = formData.get("image_url")?.toString() ?? null;
  const labels = formData.getAll("tags") as string[];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Usuario no autenticado",
      errors: {},
    };
  }

  const { data: menu } = await supabase
    .from("menus")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!menu) {
    return {
      success: false,
      message: "Menú no encontrado",
      errors: {},
    };
  }

  const { data: categoryRow } = await supabase
    .from("categories")
    .select("id")
    .eq("id", category_id)
    .eq("menu_id", menu.id)
    .maybeSingle();

  if (!categoryRow) {
    return {
      success: false,
      message: "Categoría no válida para tu menú",
      errors: { category_id: ["Selecciona una categoría válida"] },
    };
  }

  const { data: lastProduct } = await supabase
    .from("products")
    .select("position")
    .eq("category_id", category_id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (lastProduct?.position ?? -1) + 1;
  const { data: insertedProduct, error: insertError } = await supabase
    .from("products")
    .insert({
      category_id,
      name,
      description: description || null,
      price: parseFloat(price) || 0,
      image_url: image_url || null,
      labels: labels.filter((l): l is ProductLabel =>
        ["vegan", "gluten_free", "vegetarian", "spicy", "keto", "aplv"].includes(l)
      ),
      position: nextPosition,
      is_available: true,
    })
    .select()
    .single();

  if (insertError) {
    return { success: false, message: insertError.message, errors: {} };
  }
  revalidatePath("/dashboard/create-menu");
  return {
    success: true,
    message: "Producto creado correctamente",
    errors: {},
    product: insertedProduct,
  };
}

export async function updateProductInline(
  productId: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    is_available?: boolean;
  }
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Usuario no autenticado" };
  }

  // Verify the product belongs to the authenticated user
  const { data: product } = await supabase
    .from("products")
    .select("id, categories!inner(menu_id, menus!inner(user_id))")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    return { success: false, message: "Producto no encontrado" };
  }

  const { error } = await supabase
    .from("products")
    .update(data)
    .eq("id", productId);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Producto actualizado" };
}

export async function deleteProduct(
  productId: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Usuario no autenticado" };
  }

  // Verify the product belongs to the authenticated user
  const { data: product } = await supabase
    .from("products")
    .select("id, categories!inner(menu_id, menus!inner(user_id))")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    return { success: false, message: "Producto no encontrado" };
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Producto eliminado" };
}
