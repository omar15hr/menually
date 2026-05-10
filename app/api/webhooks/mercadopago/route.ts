import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  validateHMAC,
  parseWebhookPayload,
  extractWebhookTopic,
} from "@/lib/mercadopago/webhook";
import {
  logWebhookSuccess,
  logWebhookIgnored,
  logWebhookError,
} from "@/lib/mercadopago/webhook-logger";
import { MercadoPagoClient } from "@/lib/mercadopago/client";
import { mapMpStatusToDbStatus, calculatePeriodEndFromFrequency } from "@/lib/subscription";

export const dynamic = "force-dynamic";

function mapFrequencyTypeToBillingCycle(
  frequencyType: "days" | "months",
  frequency: number,
): "monthly" | "annual" {
  if (frequencyType === "months" && frequency >= 12) {
    return "annual";
  }
  return "monthly";
}

export async function POST(request: NextRequest) {
  try {
    // 1. Read raw body
    const rawBody = await request.text();

    // 2. Extract headers
    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");

    // 3. Extract query params
    const dataId = request.nextUrl.searchParams.get("data.id");
    const queryType = request.nextUrl.searchParams.get("type") ?? "";

    // 4. Validate required fields are present
    if (!xSignature || !xRequestId || !dataId) {
      console.warn("[Webhook] Missing required headers or params", {
        hasXSignature: !!xSignature,
        hasXRequestId: !!xRequestId,
        hasDataId: !!dataId,
      });
      return Response.json(
        { error: "Missing required headers: x-signature, x-request-id, or data.id" },
        { status: 400 },
      );
    }

    // 5. Validate HMAC
    const isValid = validateHMAC({
      xSignature,
      xRequestId,
      dataId,
      secret: process.env.MP_WEBHOOK_SECRET!,
    });

    if (!isValid) {
      console.warn("[Webhook] Invalid HMAC signature", { xRequestId, dataId, queryType });
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 5. Parse payload
    let payload;
    try {
      payload = parseWebhookPayload(JSON.parse(rawBody));
    } catch (error) {
      console.error("[Webhook] Failed to parse payload", { error, rawBody });
      return new Response("OK", { status: 200 });
    }

    // 6. Route by topic
    const topic = extractWebhookTopic(payload);

    // Initialize MP client
    const sandbox = process.env.NEXT_PUBLIC_MP_SANDBOX === "true";
    const client = new MercadoPagoClient(process.env.MP_ACCESS_TOKEN!, sandbox);
    const supabase = await createClient();

    if (topic === "subscription_preapproval") {
      return await handleSubscriptionPreapproval(payload, client, supabase);
    }

    if (topic === "subscription_authorized_payment") {
      return await handleSubscriptionAuthorizedPayment(payload, client, supabase);
    }

    // Unknown topic — return 200 so MP doesn't retry
    logWebhookIgnored(topic, payload.data.id, `Unknown topic: ${topic}`);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Webhook] Unhandled error", { error });
    return new Response("OK", { status: 200 });
  }
}

async function handleSubscriptionPreapproval(
  payload: ReturnType<typeof parseWebhookPayload>,
  client: MercadoPagoClient,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  try {
    const preapprovalId = payload.data.id;

    // Fetch full preapproval from MP to verify authenticity
    const preapproval = await client.getPreapproval(preapprovalId);

    // Extract user_id from external_reference
    const userId = preapproval.external_reference;
    if (!userId) {
      logWebhookIgnored(payload.type, preapprovalId, "Missing external_reference in preapproval");
      return new Response("OK", { status: 200 });
    }

    // Validate user exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      logWebhookIgnored(payload.type, preapprovalId, `User not found in profiles: ${userId}`);
      return new Response("OK", { status: 200 });
    }

    // Read existing subscription to preserve fields
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Map MP status to DB status
    const dbStatus = mapMpStatusToDbStatus(preapproval.status);

    // Calculate period end and billing cycle
    const billingCycle = mapFrequencyTypeToBillingCycle(
      preapproval.auto_recurring.frequency_type,
      preapproval.auto_recurring.frequency,
    );
    const now = new Date();
    const periodEnd = calculatePeriodEndFromFrequency(
      preapproval.auto_recurring.frequency,
      preapproval.auto_recurring.frequency_type,
      now,
    );

    // UPSERT into subscriptions table
    const { error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          mp_preapproval_id: preapproval.id,
          status: dbStatus,
          plan_type: existingSub?.plan_type,
          billing_cycle: billingCycle,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          next_billing_date: periodEnd.toISOString(),
          last_payment_date: now.toISOString(),
          amount: preapproval.auto_recurring.transaction_amount,
          trial_ends_at: existingSub?.trial_ends_at ?? undefined,
          updated_at: now.toISOString(),
        },
        { onConflict: "mp_preapproval_id" },
      );

    if (error) {
      logWebhookError(payload.type, preapprovalId, payload.action, `DB upsert failed: ${error.message}`);
      return new Response("OK", { status: 200 });
    }

    logWebhookSuccess(payload.type, preapprovalId, payload.action, dbStatus);
    return new Response("OK", { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logWebhookError(payload.type, payload.data.id, payload.action, `Unhandled error: ${message}`);
    return new Response("OK", { status: 200 });
  }
}

async function handleSubscriptionAuthorizedPayment(
  payload: ReturnType<typeof parseWebhookPayload>,
  client: MercadoPagoClient,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  try {
    const preapprovalId = payload.data.id;

    // Fetch preapproval details to get amount and frequency
    const preapproval = await client.getPreapproval(preapprovalId);

    // Extract user_id from external_reference
    const userId = preapproval.external_reference;
    if (!userId) {
      logWebhookIgnored(payload.type, preapprovalId, "Missing external_reference in preapproval");
      return new Response("OK", { status: 200 });
    }

    // Validate user exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      logWebhookIgnored(payload.type, preapprovalId, `User not found in profiles: ${userId}`);
      return new Response("OK", { status: 200 });
    }

    // Read existing subscription to preserve fields
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Calculate billing cycle and new period end
    const billingCycle = mapFrequencyTypeToBillingCycle(
      preapproval.auto_recurring.frequency_type,
      preapproval.auto_recurring.frequency,
    );
    const now = new Date();
    const periodEnd = calculatePeriodEndFromFrequency(
      preapproval.auto_recurring.frequency,
      preapproval.auto_recurring.frequency_type,
      now,
    );

    // UPSERT into subscriptions table
    const { error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          mp_preapproval_id: preapproval.id,
          status: "active",
          plan_type: existingSub?.plan_type,
          billing_cycle: billingCycle,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          next_billing_date: periodEnd.toISOString(),
          last_payment_date: now.toISOString(),
          amount: preapproval.auto_recurring.transaction_amount,
          trial_ends_at: existingSub?.trial_ends_at ?? undefined,
          updated_at: now.toISOString(),
        },
        { onConflict: "mp_preapproval_id" },
      );

    if (error) {
      logWebhookError(payload.type, preapprovalId, payload.action, `DB upsert failed: ${error.message}`);
      return new Response("OK", { status: 200 });
    }

    logWebhookSuccess(payload.type, preapprovalId, payload.action, "active");
    return new Response("OK", { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logWebhookError(payload.type, payload.data.id, payload.action, `Unhandled error: ${message}`);
    return new Response("OK", { status: 200 });
  }
}
