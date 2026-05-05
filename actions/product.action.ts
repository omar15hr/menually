"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import {
  requireAuth,
  requireProductOwner,
  assertValidRevalidatePaths,
  type ActionError,
  type ActionSuccess,
} from "@/lib/security/server-action-guards";
import { generateEntityTranslations } from "./translate.action";

type ProductLabel = Database["public"]["Enums"]["product_label"];

// Valid labels for products
const VALID_LABELS: ProductLabel[] = [
  "vegan",
  "gluten_free",
  "vegetarian",
  "spicy",
  "keto",
  "aplv",
];

/**
 * Crea un nuevo producto.
 * Requiere autenticación, verificar que la categoría pertenezca al menú del usuario.
 */
/**
 * Return type for createProduct to maintain backward compatibility
 */
export type CreateProductResult =
  | ActionError
  | {
      success: true;
      message: string;
      errors: Record<string, never>;
      product: Database["public"]["Tables"]["products"]["Row"];
    };

export async function createProduct(
  _prevState: unknown,
  formData: FormData,
): Promise<CreateProductResult> {
  const authResult = await requireAuth();
  if (authResult.error) {
    return authResult.error;
  }

  const category_id = formData.get("category_id")?.toString() ?? "";
  const name = formData.get("name")?.toString() ?? "";
  const description = formData.get("description")?.toString();
  const price = formData.get("price")?.toString() ?? "";
  const image_url = formData.get("image_url")?.toString() ?? null;
  const labels = formData.getAll("tags") as string[];

  // Input validation
  if (!category_id) {
    return {
      success: false,
      message: "Categoría requerida",
      errors: { category_id: ["Selecciona una categoría"] },
    };
  }

  if (!name || name.trim() === "") {
    return {
      success: false,
      message: "Nombre del producto requerido",
      errors: { name: ["El nombre es requerido"] },
    };
  }

  if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    return {
      success: false,
      message: "Precio inválido",
      errors: { price: ["El precio debe ser un número válido"] },
    };
  }

  const supabase = await createClient();

  // Verify category ownership via menu ownership
  const { data: categoryRow } = await supabase
    .from("categories")
    .select("id, menu_id")
    .eq("id", category_id)
    .maybeSingle();

  if (!categoryRow) {
    return {
      success: false,
      message: "Categoría no encontrada",
      errors: { category_id: ["Categoría inválida"] },
    };
  }

  // Verify the menu belongs to the user
  const { data: menu } = await supabase
    .from("menus")
    .select("id")
    .eq("id", categoryRow.menu_id)
    .eq("user_id", authResult.user!.id)
    .maybeSingle();

  if (!menu) {
    return {
      success: false,
      message: "No tienes permisos sobre esta categoría",
      errors: { category_id: ["Categoría no válida para tu menú"] },
    };
  }

  // Get last position for the category
  const { data: lastProduct } = await supabase
    .from("products")
    .select("position")
    .eq("category_id", category_id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (lastProduct?.position ?? -1) + 1;

  // Validate and sanitize labels
  const sanitizedLabels = labels
    .filter((l): l is ProductLabel => VALID_LABELS.includes(l as ProductLabel))
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

  const { data: insertedProduct, error: insertError } = await supabase
    .from("products")
    .insert({
      category_id,
      name: name.trim(),
      description: description?.trim() || null,
      price: parseFloat(price),
      image_url: image_url || null,
      labels: sanitizedLabels,
      position: nextPosition,
      is_available: true,
    })
    .select()
    .single();

  if (insertError) {
    return { success: false, message: insertError.message, errors: {} };
  }

  // Validate revalidate paths
  const pathValidation = await assertValidRevalidatePaths(
    ["/dashboard/menu/menu-content", "/dashboard/create-menu"],
    "products",
  );
  if (!pathValidation.valid) {
    console.warn("Invalid revalidate paths:", pathValidation.invalidPaths);
  }

  // Fire-and-forget AI translation generation
  void generateEntityTranslations("product", insertedProduct.id, categoryRow.menu_id, {
    name: insertedProduct.name,
    description: insertedProduct.description ?? "",
  });

  revalidatePath("/dashboard/create-menu");
  return {
    success: true,
    message: "Producto creado correctamente",
    errors: {},
    product: insertedProduct,
  };
}

export type ProductUpdate = Pick<
  Database["public"]["Tables"]["products"]["Update"],
  "name" | "description" | "price" | "is_available"
>;

/**
 * Actualiza múltiples productos.
 * Verifica que todos los productos pertenezcan al usuario antes de actualizar.
 */
export async function batchUpdateProducts(
  updates: Array<{ id: string; data: Partial<ProductUpdate> }>,
): Promise<ActionError | ActionSuccess> {
  if (updates.length === 0) {
    return { success: true, message: "Sin cambios", errors: {} };
  }

  const authResult = await requireAuth();
  if (authResult.error) {
    return authResult.error;
  }

  const supabase = await createClient();

  // Verify ownership for all products before updating
  const productIds = updates.map((u) => u.id);
  const { data: products, error: queryError } = await supabase
    .from("products")
    .select("id, category_id, categories!inner(menu_id, menus!inner(user_id))")
    .in("id", productIds);

  if (queryError || !products || products.length !== productIds.length) {
    return {
      success: false,
      message: "Algunos productos no fueron encontrados",
      errors: {},
    };
  }

  // Verify all products belong to user's menu
  const { data: userMenu } = await supabase
    .from("menus")
    .select("id")
    .eq("user_id", authResult.user!.id)
    .maybeSingle();

  if (!userMenu) {
    return { success: false, message: "No tienes un menú", errors: {} };
  }

  // The join should already verify ownership, but let's double check
  for (const product of products) {
    // Access the nested join data - but this depends on how Supabase returns it
    // Let's verify via separate query
    const { data: category } = await supabase
      .from("categories")
      .select("menu_id")
      .eq("id", product.category_id)
      .single();

    if (!category || category.menu_id !== userMenu.id) {
      return {
        success: false,
        message: "No tienes permisos sobre algunos productos",
        errors: {},
      };
    }
  }

  const results = await Promise.allSettled(
    updates.map(({ id, data }) =>
      supabase.from("products").update(data).eq("id", id).select().single(),
    ),
  );

  const errorMessages: string[] = [];

  for (const result of results) {
    if (result.status === "rejected") {
      errorMessages.push(
        result.reason instanceof Error
          ? result.reason.message
          : "Error desconocido",
      );
    } else if (result.value.error) {
      errorMessages.push(result.value.error.message);
    } else if (!result.value.data) {
      errorMessages.push(
        "No se pudo actualizar el producto (sin permisos o no existe)",
      );
    }
  }

  if (errorMessages.length > 0) {
    return { success: false, message: errorMessages[0], errors: {} };
  }

  // Fire-and-forget AI translations for updated products
  for (let i = 0; i < updates.length; i++) {
    const update = updates[i];
    const result = results[i];
    if (
      result.status === "fulfilled" &&
      result.value.data &&
      (update.data.name !== undefined || update.data.description !== undefined)
    ) {
      void generateEntityTranslations("product", update.id, userMenu.id, {
        name: result.value.data.name ?? "",
        description: result.value.data.description ?? "",
      });
    }
  }

  // Validate revalidate paths
  const pathValidation = await assertValidRevalidatePaths(
    [
      "/dashboard/product-management",
      "/dashboard/gestion-productos",
      "/dashboard/menu/menu-content",
      "/dashboard/menu",
    ],
    "products",
  );
  if (!pathValidation.valid) {
    console.warn("Invalid revalidate paths:", pathValidation.invalidPaths);
  }

  // Revalidate to update the UI cache
  revalidatePath("/dashboard/gestion-productos");
  revalidatePath("/dashboard/menu/menu-content");
  revalidatePath("/dashboard/menu");

  return {
    success: true,
    message: `${updates.length} producto${updates.length > 1 ? "s" : ""} actualizado${updates.length > 1 ? "s" : ""}`,
    errors: {},
  };
}

/**
 * Elimina un producto.
 * Verifica ownership antes de eliminar.
 */
export async function deleteProduct(
  productId: string,
): Promise<ActionError | ActionSuccess> {
  if (!productId) {
    return {
      success: false,
      message: "ID de producto requerido",
      errors: {},
    };
  }

  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(productId)) {
    return {
      success: false,
      message: "ID de producto inválido",
      errors: {},
    };
  }

  // Verify ownership using the guard
  const ownershipResult = await requireProductOwner(productId);
  if (ownershipResult.error) {
    return ownershipResult.error;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    return { success: false, message: error.message, errors: {} };
  }

  // Validate revalidate paths
  const pathValidation = await assertValidRevalidatePaths(
    ["/dashboard/menu/menu-content", "/dashboard/product-management"],
    "products",
  );
  if (!pathValidation.valid) {
    console.warn("Invalid revalidate paths:", pathValidation.invalidPaths);
  }

  revalidatePath("/dashboard/menu/menu-content");
  revalidatePath("/dashboard/product-management");

  return { success: true, message: "Producto eliminado", errors: {} };
}
