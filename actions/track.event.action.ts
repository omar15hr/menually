"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type EventType = Database["public"]["Enums"]["event_type"];

type ActionResult = {
  success: boolean;
  message: string;
  errors: Record<string, string[]>;
};

export async function trackEvent(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const eventType = formData.get("event_type") as EventType;
  const sessionId = formData.get("session_id") as string;
  const businessId = formData.get("business_id") as string;
  const categoryId = formData.get("category_id") as string | null;
  const productId = formData.get("product_id") as string | null;
  const durationSecondsRaw = formData.get("duration_seconds");
  const durationSeconds =
    durationSecondsRaw !== null && durationSecondsRaw !== ""
      ? parseFloat(durationSecondsRaw as string)
      : null;

  // Validate required fields
  if (!eventType) {
    return {
      success: false,
      message: "Tipo de evento requerido",
      errors: { event_type: ["El tipo de evento es requerido"] },
    };
  }

  if (!sessionId) {
    return {
      success: false,
      message: "Session ID requerido",
      errors: { session_id: ["El session ID es requerido"] },
    };
  }

  if (!businessId) {
    return {
      success: false,
      message: "Business ID requerido",
      errors: { business_id: ["El business ID es requerido"] },
    };
  }

  // Validate event_type enum
  const validEventTypes: EventType[] = [
    "page_view",
    "category_view",
    "product_view",
    "share",
    "exit",
  ];
  if (!validEventTypes.includes(eventType)) {
    return {
      success: false,
      message: "Tipo de evento inválido",
      errors: { event_type: ["Tipo de evento no válido"] },
    };
  }

  // Insert event
  const { error: insertError } = await supabase.from("menu_events").insert({
    business_id: businessId,
    session_id: sessionId,
    event_type: eventType,
    category_id: categoryId,
    product_id: productId,
    duration_seconds: durationSeconds,
  });

  if (insertError) {
    return {
      success: false,
      message: "Error al registrar evento",
      errors: {},
    };
  }

  return {
    success: true,
    message: "Evento registrado",
    errors: {},
  };
}