import crypto from "crypto";
import type { WebhookPayload, WebhookTopic } from "@/lib/mercadopago/types";

interface ValidateHMACParams {
  xSignature: string;
  xRequestId: string;
  dataId: string;
  secret: string;
}

/**
 * Validate HMAC signature from Mercado Pago webhook.
 *
 * Algorithm:
 * 1. Parse x-signature: split by ',' -> extract ts and v1 values
 * 2. Convert data.id to LOWERCASE (MP quirk)
 * 3. Build manifest: id:{dataId_lowercase};request-id:{xRequestId};ts:{ts};
 * 4. Compute HMAC-SHA256
 * 5. Compare with v1
 * 6. Validate ts is within 5 minutes to prevent replay attacks
 */
export function validateHMAC(params: ValidateHMACParams): boolean {
  const { xSignature, xRequestId, dataId, secret } = params;

  if (!xSignature || !xRequestId || !dataId || !secret) {
    return false;
  }

  // 1. Parse x-signature: ts=...,v1=...
  const parts = xSignature.split(",");
  let ts: string | null = null;
  let v1: string | null = null;

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith("ts=")) {
      ts = trimmed.slice(3);
    } else if (trimmed.startsWith("v1=")) {
      v1 = trimmed.slice(3);
    }
  }

  if (!ts || !v1) {
    return false;
  }

  // 2. Convert dataId to lowercase
  const dataIdLower = dataId.toLowerCase();

  // 3. Build manifest
  const manifest = `id:${dataIdLower};request-id:${xRequestId};ts:${ts};`;

  // 4. Compute HMAC-SHA256
  const computed = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  // 5. Compare with v1 using timing-safe comparison
  const computedBuffer = Buffer.from(computed, "hex");
  const v1Buffer = Buffer.from(v1, "hex");
  if (computedBuffer.length !== v1Buffer.length) {
    return false;
  }
  if (!crypto.timingSafeEqual(computedBuffer, v1Buffer)) {
    return false;
  }

  // 6. Replay protection: ts must be within 15 minutes.
  // Mercado Pago sends ts in milliseconds in x-signature.
  const tsNum = parseInt(ts, 10);
  const nowMs = Date.now();
  if (isNaN(tsNum) || Math.abs(nowMs - tsNum) > 15 * 60 * 1000) {
    return false;
  }

  return true;
}

/**
 * Parse webhook payload into typed WebhookPayload.
 * Throws if payload is invalid or missing required fields.
 */
export function parseWebhookPayload(body: unknown): WebhookPayload {
  if (typeof body !== "object" || body === null) {
    throw new Error("Invalid webhook payload: expected object");
  }

  const payload = body as Record<string, unknown>;

  if (
    typeof payload.data !== "object" ||
    payload.data === null ||
    typeof (payload.data as Record<string, unknown>).id !== "string"
  ) {
    throw new Error("Invalid webhook payload: missing data.id");
  }

  const validTopics: WebhookTopic[] = [
    "subscription_preapproval",
    "subscription_authorized_payment",
    "chargeback",
    "refund",
  ];

  if (!validTopics.includes(payload.type as WebhookTopic)) {
    throw new Error(`Invalid webhook payload: unsupported type ${payload.type}`);
  }

  if (typeof payload.date_created !== "string") {
    throw new Error("Invalid webhook payload: missing date_created");
  }

  if (typeof payload.user_id !== "string") {
    throw new Error("Invalid webhook payload: missing user_id");
  }

  if (typeof payload.api_version !== "string") {
    throw new Error("Invalid webhook payload: missing api_version");
  }

  if (typeof payload.action !== "string") {
    throw new Error("Invalid webhook payload: missing action");
  }

  return payload as unknown as WebhookPayload;
}

/**
 * Extract the topic from a parsed webhook payload.
 */
export function extractWebhookTopic(payload: WebhookPayload): WebhookTopic {
  return payload.type;
}
