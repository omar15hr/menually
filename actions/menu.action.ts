"use server";

import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils/slug";
import { createClient } from "@/lib/supabase/server";
import {
  updateMenuSchema,
  type UpdateMenuSchema,
} from "@/lib/validations/menu.schemas";
import { redirect } from "next/navigation";
import {
  requireAuth,
  requireMenuOwner,
  assertValidRevalidatePaths,
  type ActionError,
  type ActionSuccess,
  type ActionSuccessWithData,
} from "@/lib/security/server-action-guards";

const VALID_INTENTS = ["manual", "import", "ai"] as const;
type Intent = (typeof VALID_INTENTS)[number];

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

export type CreateMenuState = ActionError | ActionSuccess | null | undefined;

export async function createMenu(
  prevState: CreateMenuState,
  formData: FormData,
): Promise<CreateMenuState> {
  const intentRaw = formData.get("intent") as string;
  const intent = VALID_INTENTS.includes(intentRaw as Intent)
    ? (intentRaw as Intent)
    : null;

  const authResult = await requireAuth();
  if (authResult.error) {
    return authResult.error;
  }

  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("business_name")
    .eq("id", authResult.user!.id)
    .single();

  if (!profile || profileError) {
    return {
      success: false,
      message: "No se pudo recuperar el perfil del usuario",
      errors: {},
    };
  }

  const baseSlug = generateSlug(profile.business_name);
  const slug = await resolveUniqueSlug(baseSlug);

  const { data: existing } = await supabase
    .from("menus")
    .select("id")
    .eq("user_id", authResult.user!.id)
    .maybeSingle();

  if (existing)
    return { success: false, message: "Ya tienes un menú creado", errors: {} };

  const { error } = await supabase
    .from("menus")
    .insert({
      user_id: authResult.user!.id,
      slug,
    })
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      message: "Error al crear el menú en la base de datos",
      errors: {},
    };
  }

  // Validate revalidate paths
  const pathValidation = await assertValidRevalidatePaths(
    ["/dashboard"],
    "menu",
  );
  if (!pathValidation.valid) {
    console.warn("Invalid revalidate paths:", pathValidation.invalidPaths);
  }

  revalidatePath("/dashboard");

  // Validate and handle intent
  if (intent === "manual") {
    redirect("/dashboard/menu/menu-content");
  }
  if (intent === "import" || intent === "ai") {
    redirect("/dashboard/menu/menu-import");
  }

  return { success: false, message: "Opción inválida", errors: {} };
}

/**
 * Actualiza un menú existente.
 * Requiere autenticación y propiedad del menú.
 *
 * Backward compatible return type that also has error property for legacy code
 */
export async function updateMenu(
  menuId: string,
  data: UpdateMenuSchema,
): Promise<
  (
    | ActionError
    | ActionSuccessWithData<Database["public"]["Tables"]["menus"]["Row"]>
  ) & { error?: string }
> {
  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(menuId)) {
    return {
      success: false,
      message: "ID de menú inválido",
      errors: {},
      error: "ID de menú inválido",
    };
  }

  // Verify ownership
  const ownershipResult = await requireMenuOwner(menuId);
  if (ownershipResult.error) {
    return { ...ownershipResult.error, error: ownershipResult.error.message };
  }

  // Validate input
  const parsed = updateMenuSchema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return {
      success: false,
      message,
      errors: {},
      error: message,
    };
  }

  const supabase = await createClient();

  const { data: updatedMenu, error: updateError } = await supabase
    .from("menus")
    .update(parsed.data)
    .eq("id", menuId)
    .select()
    .single();

  if (updateError) {
    const message = "Error al actualizar el menú";
    return { success: false, message, errors: {}, error: message };
  }

  // Validate revalidate paths
  const pathValidation = await assertValidRevalidatePaths(
    ["/dashboard"],
    "menu",
  );
  if (!pathValidation.valid) {
    console.warn("Invalid revalidate paths:", pathValidation.invalidPaths);
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Menú actualizado correctamente",
    errors: {},
    data: updatedMenu,
    error: undefined,
  };
}

export type DeleteMenuState = ActionError | ActionSuccess | null | undefined;

/**
 * Elimina el menú del usuario autenticado.
 * Requiere autenticación.
 */
export async function deleteMenu(
  _prevState: DeleteMenuState,
  _formData: FormData,
): Promise<DeleteMenuState> {
  const authResult = await requireAuth();
  if (authResult.error) {
    return authResult.error;
  }

  const supabase = await createClient();

  const { data: menu } = await supabase
    .from("menus")
    .select("id")
    .eq("user_id", authResult.user!.id)
    .maybeSingle();

  if (!menu) {
    return {
      success: false,
      message: "No hay un menú para eliminar",
      errors: {},
    };
  }

  const { error } = await supabase.from("menus").delete().eq("id", menu.id);

  if (error) {
    return {
      success: false,
      message: "No se pudo eliminar el menú",
      errors: {},
    };
  }

  // Validate revalidate paths
  const pathValidation = await assertValidRevalidatePaths(
    ["/dashboard", "/settings", "/settings/preferences"],
    "all",
  );
  if (!pathValidation.valid) {
    console.warn("Invalid revalidate paths:", pathValidation.invalidPaths);
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/settings/preferences");

  return {
    success: true,
    message: "Menú eliminado correctamente",
    errors: {},
  };
}

// Add type import for Database
import type { Database } from "@/types/database.types";
