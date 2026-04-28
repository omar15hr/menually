"use server";

import { createClient } from "@/lib/supabase/server";
import QRCode from "qrcode";

interface GenerateQrCodeResult {
  success: boolean;
  qrUrl?: string;
  error?: string;
}

export async function generateQrCode(
  menuId: string,
  menuSlug: string,
): Promise<GenerateQrCodeResult> {
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

  // Check if QR already exists in storage
  const existingPath = `qrs/${menuId}.png`;

  // Try to download the existing file to check if it exists
  const { data: existingData, error: downloadError } = await supabase.storage
    .from("images")
    .download(existingPath);

  if (!downloadError && existingData) {
    // File exists, get public URL
    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(existingPath);

    return {
      success: true,
      qrUrl: publicUrlData.publicUrl,
    };
  }

  // Generate QR code as PNG buffer
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const menuUrl = `${baseUrl}/menu/${menuSlug}`;

  const buffer = await QRCode.toBuffer(menuUrl, {
    width: 512,
    margin: 2,
    color: {
      dark: "#114821",
      light: "#FFFFFF",
    },
  });

  // Convert buffer to base64 string, then to Blob
  const base64String = buffer.toString("base64");
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "image/png" });
  const file = new File([blob], `${menuId}.png`, { type: "image/png" });

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(existingPath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return {
      success: false,
      error: uploadError.message,
    };
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("images")
    .getPublicUrl(existingPath);

  return {
    success: true,
    qrUrl: publicUrlData.publicUrl,
  };
}
