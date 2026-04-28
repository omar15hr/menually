"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type EventType = Database["public"]["Enums"]["event_type"];

type ActionResult = {
  success: boolean;
  message: string;
  errors: Record<string, string[]>;
};

/**
 * Registra un evento de menú.
 * Action PÚBLICA - no requiere autenticación.
 * Pero verifica que el business_id pertenezca a un menú válido para evitar spoofing.
 */
export async function trackEvent(
  _prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const eventType = formData.get("event_type") as EventType;
  const sessionId = formData.get("session_id") as string;
  const businessId = formData.get("business_id") as string;
  const categoryId = formData.get("category_id") as string | null;
  const productId = formData.get("product_id") as string | null;
  const durationSecondsRaw = formData.get("duration_seconds");
  const durationSeconds =
    durationSecondsRaw !== null && durationSecondsRaw !== ""
      ? parseFloat(durationSecondsRaw as string)
      : null;

  // Validate required fields
  if (!eventType) {
    return {
      success: false,
      message: "Tipo de evento requerido",
      errors: { event_type: ["El tipo de evento es requerido"] },
    };
  }

  if (!sessionId) {
    return {
      success: false,
      message: "Session ID requerido",
      errors: { session_id: ["El session ID es requerido"] },
    };
  }

  if (!businessId) {
    return {
      success: false,
      message: "Business ID requerido",
      errors: { business_id: ["El business ID es requerido"] },
    };
  }

  // Validate UUID format for business_id
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(businessId)) {
    return {
      success: false,
      message: "Business ID inválido",
      errors: { business_id: ["El business ID debe ser un UUID válido"] },
    };
  }

  // Validate event_type enum
  const validEventTypes: EventType[] = [
    "page_view",
    "category_view",
    "product_view",
    "share",
    "exit",
  ];
  if (!validEventTypes.includes(eventType)) {
    return {
      success: false,
      message: "Tipo de evento inválido",
      errors: { event_type: ["Tipo de evento no válido"] },
    };
  }

  // CRITICAL: Verify business_id belongs to a valid menu
  // This prevents business_id spoofing - attackers trying to inject events for other businesses
  const { data: menu, error: menuError } = await supabase
    .from("menus")
    .select("id, is_active")
    .eq("user_id", businessId)
    .eq("is_active", true)
    .maybeSingle();

  // If no active menu found for this business_id, it might be a spoofing attempt
  // However, we should also check if it's a valid profile (in case user deleted their menu)
  // We allow the event if it belongs to either an active menu OR a valid profile
  if (!menu) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", businessId)
      .maybeSingle();

    if (profileError || !profile) {
      // business_id doesn't correspond to any valid user - likely spoofing
      return {
        success: false,
        message: "Business ID no válido",
        errors: {
          business_id: ["El business ID no corresponde a un negocio válido"],
        },
      };
    }
  }

  // Validate category_id if provided (must belong to user's menu)
  if (categoryId) {
    if (!uuidRegex.test(categoryId)) {
      return {
        success: false,
        message: "Category ID inválido",
        errors: { category_id: ["El category ID debe ser un UUID válido"] },
      };
    }

    // Verify category belongs to the business's menu
    if (menu) {
      const { data: category, error: catError } = await supabase
        .from("categories")
        .select("id")
        .eq("id", categoryId)
        .eq("menu_id", menu.id)
        .maybeSingle();

      if (catError || !category) {
        return {
          success: false,
          message: "Categoría no válida",
          errors: { category_id: ["La categoría no pertenece a este negocio"] },
        };
      }
    }
  }

  // Validate product_id if provided (must belong to user's menu)
  if (productId) {
    if (!uuidRegex.test(productId)) {
      return {
        success: false,
        message: "Product ID inválido",
        errors: { product_id: ["El product ID debe ser un UUID válido"] },
      };
    }

    // Verify product exists and belongs to the business's menu
    if (menu) {
      const { data: product, error: prodError } = await supabase
        .from("products")
        .select("id, category_id, categories!inner(menu_id)")
        .eq("id", productId)
        .maybeSingle();

      if (prodError || !product) {
        return {
          success: false,
          message: "Producto no válido",
          errors: { product_id: ["El producto no existe"] },
        };
      }

      // Additional check: verify product's category belongs to the menu
      // The join should handle this, but let's be explicit
      const { data: prodCategory } = await supabase
        .from("categories")
        .select("menu_id")
        .eq("id", product.category_id)
        .maybeSingle();

      if (!prodCategory || prodCategory.menu_id !== menu.id) {
        return {
          success: false,
          message: "Producto no válido",
          errors: { product_id: ["El producto no pertenece a este negocio"] },
        };
      }
    }
  }

  // Validate duration_seconds if provided (must be positive number)
  if (
    durationSeconds !== null &&
    (isNaN(durationSeconds) || durationSeconds < 0)
  ) {
    return {
      success: false,
      message: "Duración inválida",
      errors: { duration_seconds: ["La duración debe ser un número positivo"] },
    };
  }

  // Insert event
  const { error: insertError } = await supabase.from("menu_events").insert({
    business_id: businessId,
    session_id: sessionId,
    event_type: eventType,
    category_id: categoryId,
    product_id: productId,
    duration_seconds: durationSeconds,
  });

  if (insertError) {
    return {
      success: false,
      message: "Error al registrar evento",
      errors: {},
    };
  }

  return {
    success: true,
    message: "Evento registrado",
    errors: {},
  };
}
