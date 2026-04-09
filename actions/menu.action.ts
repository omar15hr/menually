"use server";

import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils/slug";
import { createClient } from "@/lib/supabase/server";
import {
  updateMenuSchema,
  type UpdateMenuSchema,
} from "@/lib/validations/menu.schemas";
import { redirect } from "next/navigation";

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

export async function createMenu(intent: "manual" | "ai") {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("auth/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name")
    .eq("id", user.id)
    .single();

  if (!profile) return redirect("/auth/signin");

  const baseSlug = generateSlug(profile.business_name);
  const slug = await resolveUniqueSlug(baseSlug);

  const { data: existing } = await supabase
    .from("menus")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return;

  const { data, error } = await supabase
    .from("menus")
    .insert({
      user_id: user.id,
      slug,
    })
    .select("id")
    .single();

  if (error) return;

  revalidatePath(`/dashboard`);
  if (intent === "manual") redirect("/dashboard/menu/menu-content");
  if (intent === "ai") redirect("/dashboard/menu/menu-appearance");
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
