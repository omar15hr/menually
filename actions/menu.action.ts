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

export type CreateMenuState = {
  success: boolean;
  message: string;
} | null | undefined;

export async function createMenu(
  prevState: CreateMenuState,
  formData: FormData
): Promise<CreateMenuState> {
  const supabase = await createClient();

  const intent = formData.get("intent") as "manual" | "import" | "ai";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Usuario no autenticado" };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("business_name")
    .eq("id", user.id)
    .single();

  if (!profile || profileError) return { success: false, message: "No se pudo recuperar el perfil del usuario" };

  const baseSlug = generateSlug(profile.business_name);
  const slug = await resolveUniqueSlug(baseSlug);

  const { data: existing } = await supabase
    .from("menus")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return { success: false, message: "Ya tienes un menú creado" };

  const { error } = await supabase
    .from("menus")
    .insert({
      user_id: user.id,
      slug,
    })
    .select("id")
    .single();

  if (error) return { success: false, message: "Error al crear el menú en la base de datos" };

  revalidatePath(`/dashboard`);
  if (intent === "manual") redirect("/dashboard/menu/menu-content");
  if (intent === "import" || intent === "ai") redirect("/dashboard/menu/menu-appearance");

  return { success: false, message: "Opción inválida" };
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
