"use server";

import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils/slug";
import { createClient } from "@/lib/supabase/server";
import {
  updateMenuSchema,
  type UpdateMenuSchema,
} from "@/lib/validations/menu.schemas";

async function resolveUniqueSlug(baseSlug: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("menus")
    .select("slug")
    .ilike("slug", `${baseSlug}%`);

  if (!existing?.length) return baseSlug;

  const slugs = new Set(existing.map((r) => r.slug));

  if (!slugs.has(baseSlug)) return baseSlug;

  let counter = 2;
  while (slugs.has(`${baseSlug}-${counter}`)) counter++;

  return `${baseSlug}-${counter}`;
}

export async function createMenu() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autenticado", data: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return {
      success: false,
      error: "Completa tu perfil antes de crear un menú",
      data: null,
    };
  }

  const baseSlug = generateSlug(profile.business_name);
  const slug = await resolveUniqueSlug(baseSlug);

  const { data: existing } = await supabase
    .from("menus")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: null,
      data: null,
    };
  }

  const { data, error } = await supabase.from("menus").insert({
    user_id: user.id,
    slug,
  });

  if (error) {
    return {
      success: false,
      data: null,
      error: "Error al crear el menú. Intenta de nuevo.",
    };
  }

  revalidatePath(`/dashboard`);
  return { success: true, data, error: null };
}

export async function updateMenu(menuId: string, data: UpdateMenuSchema) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  const { data: existing } = await supabase
    .from("menus")
    .select("id")
    .eq("id", menuId)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return { success: false, error: "Menú no encontrado" };
  }

  const parsed = updateMenuSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { data: updatedMenu, error: updateError } = await supabase
    .from("menus")
    .update(parsed.data)
    .eq("id", menuId)
    .select()
    .single();

  if (updateError) {
    console.log("UPDATE ERROR:", updateError);
    return { success: false, error: "Error al actualizar el menú" };
  }

  revalidatePath("/dashboard");
  return { success: true, data: updatedMenu, error: null };
}
