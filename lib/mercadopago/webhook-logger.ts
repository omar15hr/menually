import type { WebhookTopic } from "./types";
import { incrementWebhookCounter } from "./webhook-metrics";

export type WebhookResult =
  | { status: "success"; preapprovalId: string; topic: WebhookTopic }
  | { status: "ignored"; reason: string; preapprovalId?: string }
  | { status: "error"; error: string; preapprovalId?: string };

/**
 * Log a webhook processing result as structured JSON to console.
 */
export function logWebhookResult(result: WebhookResult): void {
  incrementWebhookCounter(result.status);
  if (result.status === "error") {
    console.error("[Webhook]", result);
  } else if (result.status === "ignored") {
    console.warn("[Webhook]", result);
  } else {
    console.info("[Webhook]", result);
  }
}

/**
 * Convenience helper for successful webhook processing.
 */
export function logWebhookSuccess(
  topic: WebhookTopic,
  preapprovalId: string,
  action: string,
  dbStatus: string,
): void {
  incrementWebhookCounter("success");
  console.info("[Webhook]", {
    level: "info",
    topic,
    preapproval_id: preapprovalId,
    action,
    db_status: dbStatus,
  });
}

/**
 * Convenience helper for ignored webhook events.
 */
export function logWebhookIgnored(
  topic: WebhookTopic,
  preapprovalId: string,
  reason: string,
): void {
  incrementWebhookCounter("ignored");
  console.warn("[Webhook]", {
    level: "warn",
    topic,
    preapproval_id: preapprovalId,
    reason,
  });
}

/**
 * Convenience helper for webhook processing errors.
 */
export function logWebhookError(
  topic: WebhookTopic,
  preapprovalId: string,
  action: string,
  error: string,
): void {
  incrementWebhookCounter("error");
  console.error("[Webhook]", {
    level: "error",
    topic,
    preapproval_id: preapprovalId,
    action,
    error,
  });
}
