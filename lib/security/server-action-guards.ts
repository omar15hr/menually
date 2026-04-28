"use server";

import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Standard action result type for failures
 */
export type ActionError = {
  success: false;
  message: string;
  errors: Record<string, string[]>;
};

/**
 * Standard action result type for success (without data)
 */
export type ActionSuccess = {
  success: true;
  message: string;
  errors: Record<string, never>;
};

/**
 * Standard action result type for success with data
 */
export type ActionSuccessWithData<T> = {
  success: true;
  message: string;
  errors: Record<string, never>;
  data: T;
};

/**
 * Union type for action results
 */
export type ActionResult<T = unknown> =
  | ActionError
  | ActionSuccess
  | ActionSuccessWithData<T>;

/**
 * Valida que el usuario esté autenticado.
 * Retorna el usuario o un error estándar.
 */
export async function requireAuth(): Promise<
  { user: User; error: null }
  | { user: null; error: ActionError }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      error: {
        success: false,
        message: "Usuario no autenticado",
        errors: {},
      },
    };
  }

  return { user, error: null };
}

/**
 * Valida que el menú pertenezca al usuario autenticado.
 */
export async function requireMenuOwner(
  menuId: string
): Promise<{ menuId: string; error: null } | { menuId: null; error: ActionError }> {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { menuId: null, error: authResult.error };
  }

  const supabase = await createClient();

  const { data: menu, error } = await supabase
    .from("menus")
    .select("id")
    .eq("id", menuId)
    .eq("user_id", authResult.user.id)
    .maybeSingle();

  if (error || !menu) {
    return {
      menuId: null,
      error: {
        success: false,
        message: "Menú no encontrado o no tienes permisos",
        errors: {},
      },
    };
  }

  return { menuId: menu.id, error: null };
}

/**
 * Valida que la categoría pertenezca a un menú del usuario.
 */
export async function requireCategoryOwner(
  categoryId: string
): Promise<{ categoryId: string; menuId: string; error: null } | { categoryId: null; menuId: null; error: ActionError }> {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { categoryId: null, menuId: null, error: authResult.error };
  }

  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("categories")
    .select("id, menu_id")
    .eq("id", categoryId)
    .maybeSingle();

  if (error || !category) {
    return {
      categoryId: null,
      menuId: null,
      error: {
        success: false,
        message: "Categoría no encontrada",
        errors: {},
      },
    };
  }

  // Verify menu ownership
  const { data: menu, error: menuError } = await supabase
    .from("menus")
    .select("id")
    .eq("id", category.menu_id)
    .eq("user_id", authResult.user.id)
    .maybeSingle();

  if (menuError || !menu) {
    return {
      categoryId: null,
      menuId: null,
      error: {
        success: false,
        message: "No tienes permisos sobre esta categoría",
        errors: {},
      },
    };
  }

  return { categoryId: category.id, menuId: menu.id, error: null };
}

/**
 * Valida que el producto pertenezca a una categoría de un menú del usuario.
 */
export async function requireProductOwner(
  productId: string
): Promise<{ productId: string; categoryId: string; menuId: string; error: null } | { productId: null; categoryId: null; menuId: null; error: ActionError }> {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { productId: null, categoryId: null, menuId: null, error: authResult.error };
  }

  const supabase = await createClient();

  // First get the product with its category
  const { data: product, error } = await supabase
    .from("products")
    .select("id, category_id")
    .eq("id", productId)
    .maybeSingle();

  if (error || !product) {
    return {
      productId: null,
      categoryId: null,
      menuId: null,
      error: {
        success: false,
        message: "Producto no encontrado",
        errors: {},
      },
    };
  }

  // Get category with menu, then verify ownership in single query
  const { data: result, error: joinError } = await supabase
    .from("categories")
    .select("id, menu_id, menus!inner(id, user_id)")
    .eq("id", product.category_id)
    .eq("menus.user_id", authResult.user.id)
    .maybeSingle();

  if (joinError || !result) {
    return {
      productId: null,
      categoryId: null,
      menuId: null,
      error: {
        success: false,
        message: "No tienes permisos sobre este producto",
        errors: {},
      },
    };
  }

  return { 
    productId: product.id, 
    categoryId: result.id, 
    menuId: result.menu_id, 
    error: null 
  };
}

/**
 * Valida que la promoción pertenezca al usuario.
 */
export async function requirePromotionOwner(
  promotionId: string
): Promise<{ promotionId: string; menuId: string; error: null } | { promotionId: null; menuId: null; error: ActionError }> {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { promotionId: null, menuId: null, error: authResult.error };
  }

  const supabase = await createClient();

  const { data: promotion, error } = await supabase
    .from("promotions")
    .select("id, menu_id")
    .eq("id", promotionId)
    .maybeSingle();

  if (error || !promotion) {
    return {
      promotionId: null,
      menuId: null,
      error: {
        success: false,
        message: "Promoción no encontrada",
        errors: {},
      },
    };
  }

  // Verify menu ownership
  const { data: menu, error: menuError } = await supabase
    .from("menus")
    .select("id")
    .eq("id", promotion.menu_id)
    .eq("user_id", authResult.user.id)
    .maybeSingle();

  if (menuError || !menu) {
    return {
      promotionId: null,
      menuId: null,
      error: {
        success: false,
        message: "No tienes permisos sobre esta promoción",
        errors: {},
      },
    };
  }

  return { promotionId: promotion.id, menuId: menu.id, error: null };
}

/**
 * Valida que todos los product_ids pertenezcan al menú del usuario.
 * IMPORTANTE: Esta función es crítica para evitar que un usuario
 * agregue productos de otros menús a sus promociones.
 */
export async function assertPromotionProductsBelongToMenu(
  menuId: string,
  productIds: string[]
): Promise<{ valid: true; error: null } | { valid: false; error: ActionError }> {
  if (!productIds || productIds.length === 0) {
    return { valid: true, error: null };
  }

  const authResult = await requireAuth();
  if (authResult.error) {
    return { valid: false, error: authResult.error };
  }

  const supabase = await createClient();

  // First verify the menu belongs to the user
  const { data: menu, error: menuError } = await supabase
    .from("menus")
    .select("id")
    .eq("id", menuId)
    .eq("user_id", authResult.user.id)
    .maybeSingle();

  if (menuError || !menu) {
    return {
      valid: false,
      error: {
        success: false,
        message: "Menú no encontrado o no tienes permisos",
        errors: {},
      },
    };
  }

  // Now verify each product belongs to this menu
  // First get all category IDs for this menu
  const { data: menuCategories, error: categoriesError } = await supabase
    .from("categories")
    .select("id")
    .eq("menu_id", menuId);

  if (categoriesError) {
    return {
      valid: false,
      error: {
        success: false,
        message: "Error al verificar productos",
        errors: {},
      },
    };
  }

  const categoryIds = menuCategories?.map(c => c.id) ?? [];

  if (categoryIds.length === 0) {
    // No categories, so no products can belong to this menu
    return {
      valid: false,
      error: {
        success: false,
        message: "Algunos productos no pertenecen a tu menú",
        errors: { product_ids: ["Productos inválidos para esta promoción"] },
      },
    };
  }

  // Now get all products in these categories
  const { data: menuProducts, error: productsError } = await supabase
    .from("products")
    .select("id")
    .in("category_id", categoryIds);

  if (productsError) {
    return {
      valid: false,
      error: {
        success: false,
        message: "Error al verificar productos",
        errors: {},
      },
    };
  }

  const validProductIds = new Set(menuProducts?.map(p => p.id) ?? []);
  const invalidProducts = productIds.filter(id => !validProductIds.has(id));

  if (invalidProducts.length > 0) {
    return {
      valid: false,
      error: {
        success: false,
        message: "Algunos productos no pertenecen a tu menú",
        errors: { product_ids: ["Productos inválidos para esta promoción"] },
      },
    };
  }

  return { valid: true, error: null };
}

/**
 * Catálogo de paths válidos por dominio para revalidación.
 * Usar esta función para validar paths antes de revalidar.
 */
const VALID_REVALIDATE_PATHS: Record<string, string[]> = {
  menu: [
    "/dashboard",
    "/dashboard/analytics",
    "/dashboard/menu",
    "/dashboard/menu/menu-content",
    "/dashboard/menu/menu-import",
    "/dashboard/menu/menu-appearance",
    "/dashboard/menu/qr",
  ],
  products: [
    "/dashboard/product-management",
  ],
  promotions: [
    "/dashboard/promotions",
  ],
  settings: [
    "/settings",
    "/settings/business",
    "/settings/contact-data",
    "/settings/preferences",
    "/settings/subscription",
  ],
  public: [
    "/menu/[slug]",
  ],
};

/**
 * Valida que los paths de revalidación sean válidos y pertenezcan al dominio.
 */
export async function assertValidRevalidatePaths(
  paths: string[],
  domain: "menu" | "products" | "promotions" | "settings" | "all" = "all"
): Promise<{ valid: boolean; invalidPaths: string[] }> {
  const validPaths = domain === "all"
    ? Object.values(VALID_REVALIDATE_PATHS).flat()
    : VALID_REVALIDATE_PATHS[domain] ?? [];

  const invalidPaths: string[] = [];

  for (const path of paths) {
    // Also allow paths that start with valid prefixes (e.g., /dashboard/menu/anything)
    const isValid = validPaths.some(validPath =>
      path === validPath || path.startsWith(validPath + "/")
    );

    if (!isValid) {
      invalidPaths.push(path);
    }
  }

  return {
    valid: invalidPaths.length === 0,
    invalidPaths,
  };
}

/**
 * Obtiene los paths de revalidación válidos para un dominio.
 */
export async function getValidRevalidatePaths(domain: "menu" | "products" | "promotions" | "settings"): Promise<string[]> {
  return VALID_REVALIDATE_PATHS[domain] ?? [];
}