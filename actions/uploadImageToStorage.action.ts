"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadImageToStorage(file: File) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Usuario no autenticado",
    };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  const {
    data: { publicUrl },
  } = await supabase.storage.from("images").getPublicUrl(fileName);

  return {
    success: true,
    url: publicUrl,
  };
}
