import { type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
import { createMPClient } from "@/lib/mercadopago/factory";
import type { IMPClient } from "@/lib/mercadopago/types";
import { mapMpStatusToDbStatus, calculatePeriodEndFromFrequency } from "@/lib/subscription";
import type { Database, Json } from "@/types/database.types";

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

type AdminClient = ReturnType<typeof createAdminClient>;

async function persistWebhookLog(
  supabase: AdminClient,
  params: {
    eventKey?: string;
    topic?: string;
    dataId?: string;
    action?: string;
    xRequestId?: string;
    status: "success" | "ignored" | "error";
    errorMessage?: string;
    details?: Json;
  },
) {
  await supabase.from("mp_webhook_logs").insert({
    event_key: params.eventKey ?? null,
    topic: params.topic ?? null,
    data_id: params.dataId ?? null,
    action: params.action ?? null,
    x_request_id: params.xRequestId ?? null,
    status: params.status,
    error_message: params.errorMessage ?? null,
    details: params.details ?? {},
  });
}

async function markWebhookProcessed(supabase: AdminClient, eventKey: string) {
  await supabase
    .from("mp_webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("event_key", eventKey);
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.MP_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Webhook] Missing MP_WEBHOOK_SECRET");
      return Response.json({ error: "Server misconfiguration" }, { status: 500 });
    }

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
      secret: webhookSecret,
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
    const eventKey = `${topic}:${payload.data.id}:${payload.action}:${xRequestId}`;

    // Initialize MP client
    const client = createMPClient();
    const supabase = createAdminClient();

    const insertEvent = await supabase.from("mp_webhook_events").insert({
      event_key: eventKey,
      topic,
      data_id: payload.data.id,
      action: payload.action,
      x_request_id: xRequestId,
      payload: payload as unknown as Json,
    });

    if (insertEvent.error) {
      if (insertEvent.error.code === "23505") {
        logWebhookIgnored(topic, payload.data.id, "Duplicate webhook ignored");
        await persistWebhookLog(supabase, {
          eventKey,
          topic,
          dataId: payload.data.id,
          action: payload.action,
          xRequestId,
          status: "ignored",
          details: { reason: "duplicate_event_key" },
        });
        return new Response("OK", { status: 200 });
      }

      logWebhookError(topic, payload.data.id, payload.action, `Webhook dedup insert failed: ${insertEvent.error.message}`);
      await persistWebhookLog(supabase, {
        eventKey,
        topic,
        dataId: payload.data.id,
        action: payload.action,
        xRequestId,
        status: "error",
        errorMessage: insertEvent.error.message,
        details: { stage: "dedup_insert" },
      });
      return Response.json({ error: "Webhook processing failed" }, { status: 500 });
    }

    if (topic === "subscription_preapproval") {
      return await handleSubscriptionPreapproval(payload, client, supabase, eventKey, xRequestId);
    }

    if (topic === "subscription_authorized_payment") {
      return await handleSubscriptionAuthorizedPayment(payload, client, supabase, eventKey, xRequestId);
    }

    if (topic === "chargeback") {
      return await handleChargeback(payload, supabase, eventKey, xRequestId);
    }

    if (topic === "refund") {
      return await handleRefund(payload, supabase, eventKey, xRequestId);
    }

    if (topic === "subscription_preapproval_plan") {
      logWebhookIgnored(payload.type, payload.data.id, "Plan linking event — no action needed");
      await persistWebhookLog(supabase, {
        eventKey, topic: payload.type, dataId: payload.data.id, action: payload.action, xRequestId, status: "ignored",
        details: { reason: "plan_linking_event" },
      });
      await markWebhookProcessed(supabase, eventKey);
      return new Response("OK", { status: 200 });
    }

    // Unknown topic — return 200 so MP doesn't retry
    logWebhookIgnored(topic, payload.data.id, `Unknown topic: ${topic}`);
    await persistWebhookLog(supabase, {
      eventKey,
      topic,
      dataId: payload.data.id,
      action: payload.action,
      xRequestId,
      status: "ignored",
      details: { reason: "unknown_topic" },
    });
    await markWebhookProcessed(supabase, eventKey);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Webhook] Unhandled error", { error });
    return new Response("OK", { status: 200 });
  }
}

async function handleSubscriptionPreapproval(
  payload: ReturnType<typeof parseWebhookPayload>,
  client: IMPClient,
  supabase: AdminClient,
  eventKey: string,
  xRequestId: string,
) {
  try {
    const preapprovalId = payload.data.id;

    // Fetch full preapproval from MP to verify authenticity
    const preapproval = await client.getPreapproval(preapprovalId);

    // Extract user_id from external_reference
    const userId = preapproval.external_reference;
    if (!userId) {
      logWebhookIgnored(payload.type, preapprovalId, "Missing external_reference in preapproval");
      await persistWebhookLog(supabase, {
        eventKey, topic: payload.type, dataId: preapprovalId, action: payload.action, xRequestId, status: "ignored",
        details: { reason: "missing_external_reference" },
      });
      await markWebhookProcessed(supabase, eventKey);
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
      await persistWebhookLog(supabase, {
        eventKey, topic: payload.type, dataId: preapprovalId, action: payload.action, xRequestId, status: "ignored",
        details: { reason: "profile_not_found", userId },
      });
      await markWebhookProcessed(supabase, eventKey);
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
      await persistWebhookLog(supabase, {
        eventKey, topic: payload.type, dataId: preapprovalId, action: payload.action, xRequestId, status: "error",
        errorMessage: error.message, details: { stage: "subscriptions_upsert" },
      });
      return new Response("OK", { status: 200 });
    }

    logWebhookSuccess(payload.type, preapprovalId, payload.action, dbStatus);
    await persistWebhookLog(supabase, {
      eventKey, topic: payload.type, dataId: preapprovalId, action: payload.action, xRequestId, status: "success",
      details: { dbStatus },
    });
    await markWebhookProcessed(supabase, eventKey);
    return new Response("OK", { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logWebhookError(payload.type, payload.data.id, payload.action, `Unhandled error: ${message}`);
    await persistWebhookLog(supabase, {
      eventKey, topic: payload.type, dataId: payload.data.id, action: payload.action, xRequestId, status: "error",
      errorMessage: message, details: { stage: "handler_preapproval" },
    });
    return new Response("OK", { status: 200 });
  }
}

async function handleSubscriptionAuthorizedPayment(
  payload: ReturnType<typeof parseWebhookPayload>,
  client: IMPClient,
  supabase: AdminClient,
  eventKey: string,
  xRequestId: string,
) {
  try {
    const preapprovalId = payload.data.id;

    // Fetch preapproval details to get amount and frequency
    const preapproval = await client.getPreapproval(preapprovalId);

    // Extract user_id from external_reference
    const userId = preapproval.external_reference;
    if (!userId) {
      logWebhookIgnored(payload.type, preapprovalId, "Missing external_reference in preapproval");
      await persistWebhookLog(supabase, {
        eventKey, topic: payload.type, dataId: preapprovalId, action: payload.action, xRequestId, status: "ignored",
        details: { reason: "missing_external_reference" },
      });
      await markWebhookProcessed(supabase, eventKey);
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
      await persistWebhookLog(supabase, {
        eventKey, topic: payload.type, dataId: preapprovalId, action: payload.action, xRequestId, status: "ignored",
        details: { reason: "profile_not_found", userId },
      });
      await markWebhookProcessed(supabase, eventKey);
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
      await persistWebhookLog(supabase, {
        eventKey, topic: payload.type, dataId: preapprovalId, action: payload.action, xRequestId, status: "error",
        errorMessage: error.message, details: { stage: "subscriptions_upsert" },
      });
      return new Response("OK", { status: 200 });
    }

    logWebhookSuccess(payload.type, preapprovalId, payload.action, "active");
    await persistWebhookLog(supabase, {
      eventKey, topic: payload.type, dataId: preapprovalId, action: payload.action, xRequestId, status: "success",
      details: { dbStatus: "active" },
    });
    await markWebhookProcessed(supabase, eventKey);
    return new Response("OK", { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logWebhookError(payload.type, payload.data.id, payload.action, `Unhandled error: ${message}`);
    await persistWebhookLog(supabase, {
      eventKey, topic: payload.type, dataId: payload.data.id, action: payload.action, xRequestId, status: "error",
      errorMessage: message, details: { stage: "handler_authorized_payment" },
    });
    return new Response("OK", { status: 200 });
  }
}

async function handleChargeback(
  payload: ReturnType<typeof parseWebhookPayload>,
  supabase: AdminClient,
  eventKey: string,
  xRequestId: string,
) {
  try {
    const preapprovalId = payload.data.id;

    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("mp_preapproval_id", preapprovalId)
      .maybeSingle();

    if (!existingSub) {
      logWebhookIgnored(payload.type, preapprovalId, `Subscription not found for mp_preapproval_id: ${preapprovalId}`);
      await persistWebhookLog(supabase, {
        eventKey, topic: payload.type, dataId: preapprovalId, action: payload.action, xRequestId, status: "ignored",
        details: { reason: "subscription_not_found" },
      });
      await markWebhookProcessed(supabase, eventKey);
      return new Response("OK", { status: 200 });
    }

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "chargeback",
        updated_at: new Date().toISOString(),
      })
      .eq("mp_preapproval_id", preapprovalId);

    if (error) {
      logWebhookError(payload.type, preapprovalId, payload.action, `DB update failed: ${error.message}`);
      await persistWebhookLog(supabase, {
        eventKey, topic: payload.type, dataId: preapprovalId, action: payload.action, xRequestId, status: "error",
        errorMessage: error.message, details: { stage: "chargeback_update" },
      });
      return new Response("OK", { status: 200 });
    }

    logWebhookSuccess(payload.type, preapprovalId, payload.action, "chargeback");
    await persistWebhookLog(supabase, {
      eventKey, topic: payload.type, dataId: preapprovalId, action: payload.action, xRequestId, status: "success",
      details: { dbStatus: "chargeback" },
    });
    await markWebhookProcessed(supabase, eventKey);
    return new Response("OK", { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logWebhookError(payload.type, payload.data.id, payload.action, `Unhandled error: ${message}`);
    await persistWebhookLog(supabase, {
      eventKey, topic: payload.type, dataId: payload.data.id, action: payload.action, xRequestId, status: "error",
      errorMessage: message, details: { stage: "handler_chargeback" },
    });
    return new Response("OK", { status: 200 });
  }
}

async function handleRefund(
  payload: ReturnType<typeof parseWebhookPayload>,
  supabase: AdminClient,
  eventKey: string,
  xRequestId: string,
) {
  try {
    const preapprovalId = payload.data.id;

    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("mp_preapproval_id", preapprovalId)
      .maybeSingle();

    if (!existingSub) {
      logWebhookIgnored(payload.type, preapprovalId, `Subscription not found for mp_preapproval_id: ${preapprovalId}`);
      await persistWebhookLog(supabase, {
        eventKey, topic: payload.type, dataId: preapprovalId, action: payload.action, xRequestId, status: "ignored",
        details: { reason: "subscription_not_found" },
      });
      await markWebhookProcessed(supabase, eventKey);
      return new Response("OK", { status: 200 });
    }

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "refunded",
        updated_at: new Date().toISOString(),
      })
      .eq("mp_preapproval_id", preapprovalId);

    if (error) {
      logWebhookError(payload.type, preapprovalId, payload.action, `DB update failed: ${error.message}`);
      await persistWebhookLog(supabase, {
        eventKey, topic: payload.type, dataId: preapprovalId, action: payload.action, xRequestId, status: "error",
        errorMessage: error.message, details: { stage: "refund_update" },
      });
      return new Response("OK", { status: 200 });
    }

    logWebhookSuccess(payload.type, preapprovalId, payload.action, "refunded");
    await persistWebhookLog(supabase, {
      eventKey, topic: payload.type, dataId: preapprovalId, action: payload.action, xRequestId, status: "success",
      details: { dbStatus: "refunded" },
    });
    await markWebhookProcessed(supabase, eventKey);
    return new Response("OK", { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logWebhookError(payload.type, payload.data.id, payload.action, `Unhandled error: ${message}`);
    await persistWebhookLog(supabase, {
      eventKey, topic: payload.type, dataId: payload.data.id, action: payload.action, xRequestId, status: "error",
      errorMessage: message, details: { stage: "handler_refund" },
    });
    return new Response("OK", { status: 200 });
  }
}
