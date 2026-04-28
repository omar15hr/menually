"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type DeviceType = Database["public"]["Enums"]["device_type"];

type ActionResult = {
  success: boolean;
  message: string;
  errors: Record<string, string[]>;
};

function detectDeviceType(userAgent: string | null): DeviceType {
  if (!userAgent) return "desktop";
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|android|240|320|480|533|568|667|736/i.test(ua))
    return "mobile";
  return "desktop";
}

export async function registerScan(
  _prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const menuSlug = formData.get("menu_slug") as string;
  if (!menuSlug) {
    return {
      success: false,
      message: "Slug del menú requerido",
      errors: { menu_slug: ["El slug es requerido"] },
    };
  }

  // Get menu by slug to get business_id (user_id from menus table)
  const { data: menu, error: menuError } = await supabase
    .from("menus")
    .select("id, user_id")
    .eq("slug", menuSlug)
    .eq("is_active", true)
    .single();

  if (menuError || !menu) {
    return {
      success: false,
      message: "Menú no encontrado",
      errors: {},
    };
  }

  // business_id is always menu.user_id — the restaurant's ID
  // For authenticated restaurant owners: they own the menu, so menu.user_id matches their user.id
  // For anonymous QR visitors: they are NOT authenticated, but the scan still belongs to the restaurant
  const businessId = menu.user_id;

  // Get device type from headers (server-side)
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const referer = headersList.get("referer");
  const deviceType = detectDeviceType(userAgent);

  // Insert QR scan with the restaurant's business_id
  const { error: scanError } = await supabase.from("qr_scans").insert({
    business_id: businessId,
    scanned_at: new Date().toISOString(),
    device_type: deviceType,
    referrer: referer,
    user_agent: userAgent,
  });

  if (scanError) {
    return {
      success: false,
      message: "Error al registrar escaneo",
      errors: {},
    };
  }

  return {
    success: true,
    message: "Escaneo registrado",
    errors: {},
  };
}
