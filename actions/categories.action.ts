"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  ReorderCategoriesInput,
} from "@/types/categories.types";
import {
  requireAuth,
  requireMenuOwner,
  requireCategoryOwner,
  assertValidRevalidatePaths,
} from "@/lib/security/server-action-guards";
import { generateEntityTranslations } from "./translate.action";

/**
 * Obtiene las categorías de un menú.
 * Requiere que el usuario sea propietario del menú.
 */
export async function getCategories(
  menuId: string,
): Promise<{ data: Category[] | null; error: string | null }> {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { data: null, error: authResult.error.message };
  }

  const supabase = await createClient();

  // Verify menu ownership
  const ownershipResult = await requireMenuOwner(menuId);
  if (ownershipResult.error) {
    return { data: null, error: ownershipResult.error.message };
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("menu_id", menuId)
    .order("position", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

/**
 * Crea una nueva categoría.
 * Requiere autenticación y propiedad del menú.
 */
export async function createCategory(
  input: CreateCategoryInput,
): Promise<{ data: Category | null; error: string | null }> {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { data: null, error: authResult.error.message };
  }

  // Validate menu ownership
  const ownershipResult = await requireMenuOwner(input.menu_id);
  if (ownershipResult.error) {
    return { data: null, error: ownershipResult.error.message };
  }

  // Validate input
  if (!input.name || input.name.trim() === "") {
    return { data: null, error: "El nombre de la categoría es requerido" };
  }

  const supabase = await createClient();

  const { count } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("menu_id", input.menu_id);

  const position = input.position ?? count ?? 0;

  const { data, error } = await supabase
    .from("categories")
    .insert({ ...input, position })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  // Validate revalidate paths
  const pathValidation = await assertValidRevalidatePaths(
    ["/dashboard/menu/menu-content"],
    "menu",
  );
  if (!pathValidation.valid) {
    console.warn("Invalid revalidate paths:", pathValidation.invalidPaths);
  }

  // Queue AI translation generation; processing is best-effort and observable via translation_jobs.
  if (data) {
    await generateEntityTranslations("category", data.id, input.menu_id, {
      name: data.name,
    });
  }

  revalidatePath("/dashboard/menu/menu-content");
  return { data, error: null };
}

/**
 * Actualiza una categoría existente.
 * Requiere autenticación y propiedad de la categoría.
 */
export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<{ data: Category | null; error: string | null }> {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { data: null, error: authResult.error.message };
  }

  // Validate category ownership
  const ownershipResult = await requireCategoryOwner(id);
  if (ownershipResult.error) {
    return { data: null, error: ownershipResult.error.message };
  }

  // Validate input - name is required for update
  if (input.name !== undefined && input.name.trim() === "") {
    return {
      data: null,
      error: "El nombre de la categoría no puede estar vacío",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  // Fire-and-forget AI translation generation if name changed
  if (data && input.name !== undefined) {
    const { data: category } = await supabase
      .from("categories")
      .select("menu_id")
      .eq("id", id)
      .single();
    if (category) {
      await generateEntityTranslations("category", data.id, category.menu_id, {
        name: data.name,
      });
    }
  }

  return { data, error: null };
}

/**
 * Elimina una categoría.
 * Requiere autenticación y propiedad de la categoría.
 *
 * Backward compatible return type
 */
export async function deleteCategory(
  id: string,
): Promise<{ error: string | null }> {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { error: authResult.error.message };
  }

  // Validate category ownership
  const ownershipResult = await requireCategoryOwner(id);
  if (ownershipResult.error) {
    return { error: ownershipResult.error.message };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  // Validate revalidate paths
  const pathValidation = await assertValidRevalidatePaths(
    ["/dashboard/menu/menu-content"],
    "menu",
  );
  if (!pathValidation.valid) {
    console.warn("Invalid revalidate paths:", pathValidation.invalidPaths);
  }

  revalidatePath("/dashboard/menu/menu-content");
  return { error: null };
}

/**
 * Reordena categorías.
 * Requiere autenticación y verifica que todas las categorías pertenezcan al menú del usuario.
 *
 * Backward compatible return type - maintains old interface with error string or null
 */
export async function reorderCategories(
  input: ReorderCategoriesInput,
): Promise<{ error: string | null }> {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { error: authResult.error.message };
  }

  // Get user's menu
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: menu } = await supabase
    .from("menus")
    .select("id")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!menu) {
    return { error: "Menú no encontrado" };
  }

  // Verify all category IDs belong to user's menu
  const categoryIds = input.categories.map((c) => c.id);
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id")
    .in("id", categoryIds)
    .eq("menu_id", menu.id);

  if (catError || !categories || categories.length !== categoryIds.length) {
    return { error: "Algunas categorías no pertenecen a tu menú" };
  }

  // Use RPC for batch reorder
  const { error } = await supabase.rpc("reorder_categories_batch", {
    updates: input.categories,
  });

  if (error) {
    return { error: error.message };
  }

  // Validate revalidate paths
  const pathValidation = await assertValidRevalidatePaths(
    ["/dashboard/menu/menu-content"],
    "menu",
  );
  if (!pathValidation.valid) {
    console.warn("Invalid revalidate paths:", pathValidation.invalidPaths);
  }

  revalidatePath("/dashboard/menu/menu-content");
  return { error: null };
}
