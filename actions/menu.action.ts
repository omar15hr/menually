"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MenuActionState } from "@/types/menu.types";

export async function createMenu(
  prevState: MenuActionState,
  formData: FormData
): Promise<MenuActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  const raw = Object.fromEntries(formData.entries());

  if (!raw.success) {
    return {
      success: false,
      error: "Revisa los campos del formulario",
    };
  }

  const { data: existing } = await supabase
    .from("menus")
    .select("id")
    .eq("slug", raw.slug)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: null,
    };
  }

  const { error } = await supabase.from("menus").insert({
    ...raw,
    user_id: user.id,
    logo_url: raw.logo_url || null,
    bg_image_url: raw.bg_image_url || "",
  });

  if (error) {
    return {
      success: false,
      error: "Error al crear el menú. Intenta de nuevo.",
    };
  }

  redirect(`/dashboard/menus`);
}