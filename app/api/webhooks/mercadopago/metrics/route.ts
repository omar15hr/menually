import { type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("mp_webhook_metrics_24h")
    .select("*")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    total: data?.total_count ?? 0,
    success: data?.success_count ?? 0,
    ignored: data?.ignored_count ?? 0,
    error: data?.error_count ?? 0,
    period_hours: 24,
  });
}
