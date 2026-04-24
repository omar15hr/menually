"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createPromotionSchema, updatePromotionSchema } from "@/lib/validations/promotion.schemas";
import type { Promotion, PromotionActionResult } from "@/types/promotions.types";

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createPromotion(
  _prevState: unknown,
  formData: FormData
): Promise<PromotionActionResult> {
  const title = formData.get("title")?.toString() ?? "";
  const description = formData.get("description")?.toString() || null;
  const keyword = formData.get("keyword")?.toString() ?? "";
  const image_url = formData.get("image_url")?.toString() || null;
  const product_ids = formData.getAll("product_ids") as string[];
  const start_date = formData.get("start_date")?.toString() || null;
  const end_date = formData.get("end_date")?.toString() || null;
  const days_of_week_raw = formData.get("days_of_week")?.toString() || "[]";
  const is_active = formData.get("is_active") === "true";

  const days_of_week: number[] = (() => {
    try {
      return JSON.parse(days_of_week_raw) as number[];
    } catch {
      return [];
    }
  })();

  const parsed = createPromotionSchema.safeParse({
    title,
    description,
    keyword,
    image_url,
    product_ids,
    start_date,
    end_date,
    days_of_week,
    is_active,
  });

  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path.join(".");
      if (!errors[field]) errors[field] = [];
      errors[field].push(issue.message);
    });
    return { success: false, message: "Validación fallida", errors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Usuario no autenticado", errors: {} };
  }

  // Get user's menu
  const { data: menu } = await supabase
    .from("menus")
    .select("id, user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!menu) {
    return { success: false, message: "Menú no encontrado", errors: {} };
  }

  // Get business_id from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  // Get last position
  const { data: lastPromotion } = await supabase
    .from("promotions")
    .select("position")
    .eq("menu_id", menu.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (lastPromotion?.position ?? -1) + 1;

  const { data: inserted, error: insertError } = await supabase
    .from("promotions")
    .insert({
      menu_id: menu.id,
      user_id: user.id,
      business_id: profile?.id ?? user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      keyword: parsed.data.keyword,
      image_url: parsed.data.image_url,
      product_ids: parsed.data.product_ids,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      days_of_week: parsed.data.days_of_week,
      is_active: parsed.data.is_active,
      status: "active",
      position: nextPosition,
    })
    .select()
    .single();

  if (insertError) {
    return { success: false, message: insertError.message, errors: {} };
  }

  revalidatePath("/dashboard/promotions");
  revalidatePath("/dashboard/menu");

  return {
    success: true,
    message: "Promoción creada correctamente",
    errors: {},
    promotion: inserted,
  };
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updatePromotion(
  _prevState: unknown,
  formData: FormData
): Promise<PromotionActionResult> {
  const id = formData.get("id")?.toString() ?? "";
  const title = formData.get("title")?.toString() ?? "";
  const description = formData.get("description")?.toString() || null;
  const keyword = formData.get("keyword")?.toString() ?? "";
  const image_url = formData.get("image_url")?.toString() || null;
  const product_ids = formData.getAll("product_ids") as string[];
  const start_date = formData.get("start_date")?.toString() || null;
  const end_date = formData.get("end_date")?.toString() || null;
  const days_of_week_raw = formData.get("days_of_week")?.toString() || "[]";
  const is_active = formData.get("is_active") === "true";

  const days_of_week: number[] = (() => {
    try {
      return JSON.parse(days_of_week_raw) as number[];
    } catch {
      return [];
    }
  })();

  const parsed = updatePromotionSchema.safeParse({
    id,
    title,
    description,
    keyword,
    image_url,
    product_ids,
    start_date,
    end_date,
    days_of_week,
    is_active,
  });

  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path.join(".");
      if (!errors[field]) errors[field] = [];
      errors[field].push(issue.message);
    });
    return { success: false, message: "Validación fallida", errors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Usuario no autenticado", errors: {} };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("promotions")
    .select("id, menu_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return { success: false, message: "Promoción no encontrada", errors: {} };
  }

  // Verify user owns the menu
  const { data: menu } = await supabase
    .from("menus")
    .select("id, user_id")
    .eq("id", existing.menu_id)
    .maybeSingle();

  if (!menu || menu.user_id !== user.id) {
    return { success: false, message: "No tienes permisos para editar esta promoción", errors: {} };
  }

  const { data: updated, error: updateError } = await supabase
    .from("promotions")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      keyword: parsed.data.keyword,
      image_url: parsed.data.image_url,
      product_ids: parsed.data.product_ids,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      days_of_week: parsed.data.days_of_week,
      is_active: parsed.data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return { success: false, message: updateError.message, errors: {} };
  }

  revalidatePath("/dashboard/promotions");
  revalidatePath("/dashboard/menu");

  return {
    success: true,
    message: "Promoción actualizada correctamente",
    errors: {},
    promotion: updated,
  };
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deletePromotion(
  id: string
): Promise<{ success: boolean; message: string }> {
  if (!id) {
    return { success: false, message: "ID de promoción requerido" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Usuario no autenticado" };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("promotions")
    .select("id, menu_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return { success: false, message: "Promoción no encontrada" };
  }

  const { data: menu } = await supabase
    .from("menus")
    .select("id, user_id")
    .eq("id", existing.menu_id)
    .maybeSingle();

  if (!menu || menu.user_id !== user.id) {
    return { success: false, message: "No tienes permisos para eliminar esta promoción" };
  }

  const { error } = await supabase.from("promotions").delete().eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/promotions");
  revalidatePath("/dashboard/menu");

  return { success: true, message: "Promoción eliminada" };
}

// ─── Toggle Active ─────────────────────────────────────────────────────────────

export async function togglePromotionActive(
  id: string,
  is_active: boolean
): Promise<{ success: boolean; message: string; promotion?: Promotion }> {
  if (!id) {
    return { success: false, message: "ID de promoción requerido" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Usuario no autenticado" };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("promotions")
    .select("id, menu_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return { success: false, message: "Promoción no encontrada" };
  }

  const { data: menu } = await supabase
    .from("menus")
    .select("id, user_id")
    .eq("id", existing.menu_id)
    .maybeSingle();

  if (!menu || menu.user_id !== user.id) {
    return { success: false, message: "No tienes permisos para editar esta promoción" };
  }

  const { data: updated, error } = await supabase
    .from("promotions")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/promotions");
  revalidatePath("/dashboard/menu");

  return { success: true, message: is_active ? "Promoción activada" : "Promoción pausada", promotion: updated };
}

// ─── Get Promotions By Menu ────────────────────────────────────────────────────

export async function getPromotionsByMenu(
  menuId: string
): Promise<{ success: boolean; promotions: Promotion[]; message?: string }> {
  if (!menuId) {
    return { success: false, promotions: [], message: "ID de menú requerido" };
  }

  const supabase = await createClient();

  const { data: promotions, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("menu_id", menuId)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, promotions: [], message: error.message };
  }

  return { success: true, promotions: promotions ?? [] };
}

// ─── Get Active Promotions ─────────────────────────────────────────────────────

export async function getActivePromotions(
  menuId: string
): Promise<{ success: boolean; promotions: Promotion[]; message?: string }> {
  if (!menuId) {
    return { success: false, promotions: [], message: "ID de menú requerido" };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: promotions, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("menu_id", menuId)
    .eq("is_active", true)
    .or(
      `start_date.is.null,start_date.lte.${now}`
    )
    .or(
      `end_date.is.null,end_date.gte.${now}`
    )
    .order("position", { ascending: true })
    .limit(10);

  if (error) {
    return { success: false, promotions: [], message: error.message };
  }

  return { success: true, promotions: promotions ?? [] };
}

// ─── Get All Promotions for User ───────────────────────────────────────────────

export async function getUserPromotions(): Promise<{ success: boolean; promotions: Promotion[]; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, promotions: [], message: "Usuario no autenticado" };
  }

  // Get user's menu
  const { data: menu } = await supabase
    .from("menus")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!menu) {
    return { success: true, promotions: [] };
  }

  const { data: promotions, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("menu_id", menu.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, promotions: [], message: error.message };
  }

  return { success: true, promotions: promotions ?? [] };
}