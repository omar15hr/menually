"use server";

import z from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  ResetPasswordState,
  SignInState,
  SignUpState,
  UpdatePasswordState,
} from "@/types/auth.types";
import {
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/validations/auth.schemas";
import { createClient } from "@/lib/supabase/server";

export async function signIn(
  prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validatedFields = signInSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      status: "error" as const,
      error: "Correo o contraseña inválidos",
      data: { email: rawData.email },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  });

  if (error) {
    return {
      status: "error",
      error: "Correo o contraseña incorrectos.",
      data: { email: rawData.email },
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(
  prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const rawData = {
    fullName: formData.get("fullName") as string,
    businessName: formData.get("businessName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = signUpSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(validated.error).fieldErrors,
      error: null,
      data: {
        fullName: rawData.fullName,
        businessName: rawData.businessName,
        email: rawData.email,
      },
    };
  }

  const supabase = await createClient();
  const { email, password, fullName, businessName } = validated.data;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, business_name: businessName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      status: "error",
      fieldErrors: {},
      error: "Error al crear la cuenta. Intenta más tarde.",
      data: { fullName, businessName, email },
    };
  }

  revalidatePath("/", "layout");
  redirect("/auth/check-email");
}

export async function resetPassword(
  prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const rawData = { email: formData.get("email") as string };
  const validatedFields = resetPasswordSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      status: "error" as const,
      fieldErrors: z.flattenError(validatedFields.error).fieldErrors,
      data: rawData,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    validatedFields.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
    },
  );

  if (error) {
    return {
      status: "error" as const,
      fieldErrors: {},
      formError: "Error inesperado. Intente más tarde.",
      data: null,
    };
  }

  return { status: "success" as const, fieldErrors: {}, data: null };
}

export async function updatePassword(
  prevState: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const rawData = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = updatePasswordSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(validated.error).fieldErrors,
      error: null,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  });

  if (error) {
    return {
      status: "error",
      fieldErrors: {},
      error: "Error al actualizar la contraseña. Intenta más tarde.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/signin");
}
