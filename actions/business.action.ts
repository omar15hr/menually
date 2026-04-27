"use server";

import z from "zod";
import { revalidatePath } from "next/cache";

import type { BusinessSettingsState, Schedule } from "@/types/business.types";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";

// Validation schemas
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const businessDataSchema = z.object({
  business_name: z
    .string()
    .min(1, "El nombre del local es requerido")
    .max(100, "El nombre es demasiado largo"),
  description: z
    .string()
    .max(70, "La descripción no puede superar los 70 caracteres")
    .optional()
    .or(z.literal("")),
  business_type: z.string().min(1, "El tipo de negocio es requerido"),
  address: z.string().max(200, "La dirección es demasiado larga").optional().or(z.literal("")),
  region: z.string().max(100, "La región es demasiado larga").optional().or(z.literal("")),
  comuna: z.string().max(100, "La comuna es demasiado larga").optional().or(z.literal("")),
  show_address: z.string().transform((v) => v === "on"),
  // Schedule is validated separately for opening < closing
  schedule: z.unknown(),
});

export async function getBusiness(profileId: string) {
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("business")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  return business;
}

export async function getOrCreateBusiness(profileId: string) {
  const supabase = await createClient();

  // Try to get existing
  const { data: existing } = await supabase
    .from("business")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  if (existing) return existing;

  // Auto-create
  const { data: created, error } = await supabase
    .from("business")
    .insert({ profile_id: profileId })
    .select()
    .single();

  if (error || !created) {
    return null;
  }

  return created;
}

export async function updateBusiness(
  prevState: BusinessSettingsState,
  formData: FormData,
): Promise<BusinessSettingsState> {
  // Extract schedule from formData (days + opening/closing)
  const schedule: Schedule = {};
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  for (const day of days) {
    const closed = formData.get(`closed-${day}`) === "on";
    const opening = (formData.get(`opening-${day}`) as string) || "";
    const closing = (formData.get(`closing-${day}`) as string) || "";

    // Validate opening < closing when not closed
    if (!closed && opening && closing) {
      if (opening >= closing) {
        return {
          status: "error",
          message: `El horario de cierre debe ser después de la apertura para ${day}`,
          errors: { [`closing-${day}`]: ["El cierre debe ser después de la apertura"] },
        };
      }
    }

    schedule[day.toLowerCase()] = { open: opening, close: closing, closed };
  }

  const rawData = {
    business_name: formData.get("businessName") as string,
    description: formData.get("description") as string,
    business_type: formData.get("businessType") as string,
    address: formData.get("address") as string,
    region: formData.get("region") as string,
    comuna: formData.get("comuna") as string,
    show_address: formData.get("showAddressOnMenu") as string,
    schedule,
  };

  const validated = businessDataSchema.safeParse(rawData);

  if (!validated.success) {
    const fieldErrors = z.flattenError(validated.error).fieldErrors;
    return {
      status: "error",
      message: Object.values(fieldErrors)[0]?.[0] ?? "Datos inválidos",
      errors: fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      status: "error",
      message: "Usuario no autenticado",
      errors: {},
    };
  }

  // Ensure business exists
  const business = await getOrCreateBusiness(user.id);

  if (!business) {
    return {
      status: "error",
      message: "Error al crear el negocio. Intenta más tarde.",
      errors: {},
    };
  }

  // Update profile (business_name)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ business_name: validated.data.business_name })
    .eq("id", user.id);

  if (profileError) {
    return {
      status: "error",
      message: "Error al actualizar el nombre. Intenta más tarde.",
      errors: {},
    };
  }

  // Update business
  const { error: updateError } = await supabase
    .from("business")
    .update({
      description: validated.data.description || null,
      business_type: validated.data.business_type,
      address: validated.data.address || null,
      region: validated.data.region || null,
      comuna: validated.data.comuna || null,
      show_address: validated.data.show_address,
      schedule: schedule as unknown as Json,
    })
    .eq("profile_id", user.id);

  if (updateError) {
    return {
      status: "error",
      message: "Error al guardar. Intenta más tarde.",
      errors: {},
    };
  }

  revalidatePath("/settings", "page");
  revalidatePath("/settings/business", "page");

  return {
    status: "success",
    message: "Configuración guardada correctamente",
    errors: {},
  };
}