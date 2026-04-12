"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ImportedMenu, ImportResult } from "@/lib/types/ai-import.types";

/**
 * Import menu data from AI extraction into Supabase
 * Skips categories and products that already exist (exact name match)
 */
export async function importMenu(
  data: ImportedMenu
): Promise<{ result: ImportResult | null; error: string | null }> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { result: null, error: "Usuario no autenticado" };
  }

  // Get user's menu
  const { data: menu, error: menuError } = await supabase
    .from("menus")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (menuError || !menu) {
    return { result: null, error: "Menú no encontrado" };
  }

  // Get existing categories for this menu
  const { data: existingCategories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("menu_id", menu.id);

  const existingCategoryMap = new Map<string, string>();
  existingCategories?.forEach((cat) => {
    existingCategoryMap.set(cat.name, cat.id);
  });

  // Get existing products grouped by category
  const { data: existingProducts } = await supabase
    .from("products")
    .select("id, name, category_id");

  const existingProductMap = new Map<string, Set<string>>();
  existingProducts?.forEach((prod) => {
    if (!existingProductMap.has(prod.category_id)) {
      existingProductMap.set(prod.category_id, new Set());
    }
    existingProductMap.get(prod.category_id)!.add(prod.name);
  });

  // Initialize result counters
  const result: ImportResult = {
    success: true,
    categoriesAdded: 0,
    categoriesSkipped: 0,
    productsAdded: 0,
    productsSkipped: 0,
    errors: [],
  };

  // Track category IDs created in this import
  const categoryIdMap = new Map<string, string>();

  // Process each imported category
  for (const importedCategory of data.categories) {
    // Check if category already exists
    const existingCategoryId = existingCategoryMap.get(importedCategory.name);

    let categoryId: string;

    if (existingCategoryId) {
      // Category exists - skip
      categoryId = existingCategoryId;
      result.categoriesSkipped++;
    } else {
      // Create new category
      const { data: createdCategory, error: catError } = await supabase
        .from("categories")
        .insert({
          menu_id: menu.id,
          name: importedCategory.name,
          position: existingCategoryMap.size + result.categoriesAdded,
        })
        .select("id")
        .single();

      if (catError || !createdCategory) {
        result.errors.push(
          `Error al crear categoría "${importedCategory.name}": ${catError?.message ?? "Unknown error"}`
        );
        continue;
      }

      categoryId = createdCategory.id;
      categoryIdMap.set(importedCategory.name, categoryId);
      result.categoriesAdded++;
    }

    // Get existing products for this category (including newly created)
    const existingProdsInCategory =
      existingProductMap.get(categoryId) ?? new Set<string>();
    const newlyCreatedProdsInCategory = new Set<string>();

    // Process each imported product
    for (const importedProduct of importedCategory.products) {
      // Check if product already exists in this category
      const productExists =
        existingProdsInCategory.has(importedProduct.name) ||
        newlyCreatedProdsInCategory.has(importedProduct.name);

      if (productExists) {
        result.productsSkipped++;
        continue;
      }

      // Create new product
      // Note: "notes" from AI is appended to description if present
      const description = importedProduct.description
        ? importedProduct.notes
          ? `${importedProduct.description} (${importedProduct.notes})`
          : importedProduct.description
        : importedProduct.notes
          ? importedProduct.notes
          : null;

      const { error: prodError } = await supabase.from("products").insert({
        category_id: categoryId,
        name: importedProduct.name,
        description,
        price: importedProduct.price ?? 0,
        image_url: null,
        labels: null,
        is_available: true,
        position: existingProdsInCategory.size + newlyCreatedProdsInCategory.size,
      });

      if (prodError) {
        result.errors.push(
          `Error al crear producto "${importedProduct.name}": ${prodError.message}`
        );
        continue;
      }

      newlyCreatedProdsInCategory.add(importedProduct.name);
      result.productsAdded++;
    }
  }

  // Mark as failure if there were errors
  if (result.errors.length > 0) {
    result.success = false;
  }

  // Revalidate the menu content page
  revalidatePath("/dashboard/menu/menu-content");

  return { result, error: null };
}
