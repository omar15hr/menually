"use server";

import z from "zod";
import { revalidatePath } from "next/cache";

import { ContactDataState, PasswordChangeState } from "@/types/profile.types";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z
  .string()
  .email("El correo electrónico no es válido")
  .max(50, "El correo es demasiado largo");

const phoneSchema = z
  .string()
  .max(20, "El teléfono es demasiado largo")
  .optional()
  .or(z.literal(""));

const passwordSchema = z
  .string()
  .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[0-9]/, "Debe contener al menos un número");

const contactDataSchema = z.object({
  email: emailSchema,
  phone_number: phoneSchema,
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export async function updateContactData(
  prevState: ContactDataState,
  formData: FormData,
): Promise<ContactDataState> {
  const rawData = {
    email: formData.get("email") as string,
    phone_number: (formData.get("phone_number") as string) || "",
  };

  const validated = contactDataSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      status: "error",
      message:
        z.flattenError(validated.error).fieldErrors.email?.[0] ??
        z.flattenError(validated.error).fieldErrors.phone_number?.[0] ??
        "Datos inválidos",
      errors: z.flattenError(validated.error).fieldErrors,
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

  // Check if email is already in use by another user
  if (validated.data.email) {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", validated.data.email)
      .neq("id", user.id)
      .single();

    if (existingProfile) {
      return {
        status: "error",
        message: "Este correo electrónico ya está en uso",
        errors: { email: ["Este correo electrónico ya está en uso"] },
      };
    }
  }

  // Update the profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      email: validated.data.email,
      phone_number: validated.data.phone_number || null,
    })
    .eq("id", user.id);

  if (updateError) {
    return {
      status: "error",
      message: "Error al actualizar los datos. Intenta más tarde.",
      errors: {},
    };
  }

  revalidatePath("/settings/contact-data", "page");

  return {
    status: "success",
    message: "Datos de contacto actualizados correctamente",
    errors: {},
  };
}

export async function changePassword(
  prevState: PasswordChangeState,
  formData: FormData,
): Promise<PasswordChangeState> {
  const rawData = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = changePasswordSchema.safeParse(rawData);

  if (!validated.success) {
    const fieldErrors = z.flattenError(validated.error).fieldErrors;
    return {
      status: "error",
      message:
        fieldErrors.currentPassword?.[0] ??
        fieldErrors.newPassword?.[0] ??
        fieldErrors.confirmPassword?.[0] ??
        "Datos inválidos",
      errors: fieldErrors,
    };
  }

  const supabase = await createClient();

  // Verify current password by attempting to sign in
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.signInWithPassword({
    email: (await supabase.auth.getUser()).data.user?.email ?? "",
    password: validated.data.currentPassword,
  });

  if (authError || !user) {
    return {
      status: "error",
      message: "La contraseña actual es incorrecta",
      errors: { currentPassword: ["La contraseña actual es incorrecta"] },
    };
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: validated.data.newPassword,
  });

  if (updateError) {
    return {
      status: "error",
      message: "Error al cambiar la contraseña. Intenta más tarde.",
      errors: {},
    };
  }

  revalidatePath("/settings/contact-data", "page");

  return {
    status: "success",
    message: "Contraseña cambiada correctamente",
    errors: {},
  };
}
