import { type NextRequest } from "next/server";
import { getWebhookMetrics } from "@/lib/mercadopago/webhook-metrics";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  const metrics = getWebhookMetrics();
  return Response.json(metrics);
}
