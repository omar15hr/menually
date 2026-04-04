"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { AuthActionState } from "@/types/auth.types";
import { signInSchema, signUpSchema } from "@/lib/validations/auth.schemas";

export async function signIn(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validated = signInSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      error: "Error al iniciar sesión",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
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
      success: false,
      error: "Error al validar los campos",
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
      success: false,
      error: "Error al crear usuario",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !user.email_confirmed_at) {
    return {
      success: true,
      error: "Error al crear usuario",
    };
  }
  revalidatePath("/", "layout");
  redirect("/check-email");
}
