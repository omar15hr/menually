import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  validateHMAC,
  parseWebhookPayload,
  extractWebhookTopic,
} from "@/lib/mercadopago/webhook";
import type { WebhookPayload } from "@/lib/mercadopago/types";

// ─── Known test vectors ───
const TEST_SECRET = "test-secret";
const TEST_TS = String(Math.floor(Date.now() / 1000)); // current timestamp for valid sigs
const TEST_DATA_ID = "abc123def456"; // lowercase
const TEST_DATA_ID_UPPER = "ABC123DEF456"; // uppercase, should normalize to lowercase
const TEST_X_REQUEST_ID = "2066ca19-c6f1-498a-be75-1923005edd06";

function buildManifest(dataId: string, xRequestId: string, ts: string): string {
  return `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
}

function computeHMAC(secret: string, manifest: string): string {
  return crypto.createHmac("sha256", secret).update(manifest).digest("hex");
}

function buildXSignature(ts: string, v1: string): string {
  return `ts=${ts},v1=${v1}`;
}

const VALID_MANIFEST = buildManifest(TEST_DATA_ID, TEST_X_REQUEST_ID, TEST_TS);
const VALID_V1 = computeHMAC(TEST_SECRET, VALID_MANIFEST);
const VALID_X_SIGNATURE = buildXSignature(TEST_TS, VALID_V1);

// ─── HMAC Validation Tests ───
describe("validateHMAC", () => {
  it("returns true for a known valid signature", () => {
    const result = validateHMAC({
      xSignature: VALID_X_SIGNATURE,
      xRequestId: TEST_X_REQUEST_ID,
      dataId: TEST_DATA_ID,
      secret: TEST_SECRET,
    });
    expect(result).toBe(true);
  });

  it("returns false when secret is wrong", () => {
    const result = validateHMAC({
      xSignature: VALID_X_SIGNATURE,
      xRequestId: TEST_X_REQUEST_ID,
      dataId: TEST_DATA_ID,
      secret: "wrong-secret",
    });
    expect(result).toBe(false);
  });

  it("returns false when dataId is tampered", () => {
    const result = validateHMAC({
      xSignature: VALID_X_SIGNATURE,
      xRequestId: TEST_X_REQUEST_ID,
      dataId: "tampered-id",
      secret: TEST_SECRET,
    });
    expect(result).toBe(false);
  });

  it("returns false when timestamp is wrong", () => {
    const wrongTs = "1704908011";
    const wrongManifest = buildManifest(TEST_DATA_ID, TEST_X_REQUEST_ID, wrongTs);
    const wrongV1 = computeHMAC(TEST_SECRET, wrongManifest);
    const wrongXSignature = buildXSignature(wrongTs, wrongV1);

    const result = validateHMAC({
      xSignature: wrongXSignature,
      xRequestId: TEST_X_REQUEST_ID,
      dataId: TEST_DATA_ID,
      secret: TEST_SECRET,
    });
    expect(result).toBe(false);
  });

  it("normalizes dataId to lowercase before validation", () => {
    const result = validateHMAC({
      xSignature: VALID_X_SIGNATURE,
      xRequestId: TEST_X_REQUEST_ID,
      dataId: TEST_DATA_ID_UPPER,
      secret: TEST_SECRET,
    });
    expect(result).toBe(true);
  });

  it("returns false when x-signature is missing ts", () => {
    const result = validateHMAC({
      xSignature: `v1=${VALID_V1}`,
      xRequestId: TEST_X_REQUEST_ID,
      dataId: TEST_DATA_ID,
      secret: TEST_SECRET,
    });
    expect(result).toBe(false);
  });

  it("returns false when x-signature is missing v1", () => {
    const result = validateHMAC({
      xSignature: `ts=${TEST_TS}`,
      xRequestId: TEST_X_REQUEST_ID,
      dataId: TEST_DATA_ID,
      secret: TEST_SECRET,
    });
    expect(result).toBe(false);
  });

  it("returns false when x-signature is empty", () => {
    const result = validateHMAC({
      xSignature: "",
      xRequestId: TEST_X_REQUEST_ID,
      dataId: TEST_DATA_ID,
      secret: TEST_SECRET,
    });
    expect(result).toBe(false);
  });

  it("returns false when x-signature is malformed (no comma)", () => {
    const result = validateHMAC({
      xSignature: `ts=${TEST_TS}v1=${VALID_V1}`,
      xRequestId: TEST_X_REQUEST_ID,
      dataId: TEST_DATA_ID,
      secret: TEST_SECRET,
    });
    expect(result).toBe(false);
  });

  it("returns false when timestamp is outside 15-minute window (replay protection)", () => {
    const oldTs = String(Math.floor(Date.now() / 1000) - 960); // 16 minutes ago
    const oldManifest = buildManifest(TEST_DATA_ID, TEST_X_REQUEST_ID, oldTs);
    const oldV1 = computeHMAC(TEST_SECRET, oldManifest);
    const oldXSignature = buildXSignature(oldTs, oldV1);

    const result = validateHMAC({
      xSignature: oldXSignature,
      xRequestId: TEST_X_REQUEST_ID,
      dataId: TEST_DATA_ID,
      secret: TEST_SECRET,
    });
    expect(result).toBe(false);
  });

  it("returns true when timestamp is within 15-minute window", () => {
    const recentTs = String(Math.floor(Date.now() / 1000) - 840); // 14 minutes ago
    const recentManifest = buildManifest(TEST_DATA_ID, TEST_X_REQUEST_ID, recentTs);
    const recentV1 = computeHMAC(TEST_SECRET, recentManifest);
    const recentXSignature = buildXSignature(recentTs, recentV1);

    const result = validateHMAC({
      xSignature: recentXSignature,
      xRequestId: TEST_X_REQUEST_ID,
      dataId: TEST_DATA_ID,
      secret: TEST_SECRET,
    });
    expect(result).toBe(true);
  });

  it("returns false when v1 signature has different length (timing-safe equal edge case)", () => {
    const result = validateHMAC({
      xSignature: `ts=${TEST_TS},v1=short`,
      xRequestId: TEST_X_REQUEST_ID,
      dataId: TEST_DATA_ID,
      secret: TEST_SECRET,
    });
    expect(result).toBe(false);
  });

  it("returns false when empty strings are passed", () => {
    const result = validateHMAC({
      xSignature: "",
      xRequestId: "",
      dataId: "",
      secret: "",
    });
    expect(result).toBe(false);
  });
});

// ─── Parse Webhook Payload Tests ───
describe("parseWebhookPayload", () => {
  it("parses valid JSON payload into typed WebhookPayload", () => {
    const body = {
      data: { id: "preapproval-123" },
      type: "subscription_preapproval",
      date_created: "2024-01-01T00:00:00.000Z",
      user_id: "12345",
      api_version: "v1",
      action: "created",
    };
    const result = parseWebhookPayload(body);
    expect(result).toEqual(body);
    expect(result.data.id).toBe("preapproval-123");
    expect(result.type).toBe("subscription_preapproval");
  });

  it("throws when payload is not an object", () => {
    expect(() => parseWebhookPayload("not-an-object")).toThrow();
    expect(() => parseWebhookPayload(null)).toThrow();
    expect(() => parseWebhookPayload(42)).toThrow();
  });

  it("throws when payload is missing required fields", () => {
    expect(() => parseWebhookPayload({})).toThrow();
    expect(() => parseWebhookPayload({ data: {} })).toThrow();
    expect(() =>
      parseWebhookPayload({
        data: { id: "preapproval-123" },
        type: "unknown_topic",
      })
    ).toThrow();
  });
});

// ─── Extract Webhook Topic Tests ───
describe("extractWebhookTopic", () => {
  it("extracts subscription_preapproval from payload", () => {
    const payload: WebhookPayload = {
      data: { id: "preapproval-123" },
      type: "subscription_preapproval",
      date_created: "2024-01-01T00:00:00.000Z",
      user_id: "12345",
      api_version: "v1",
      action: "created",
    };
    const result = extractWebhookTopic(payload);
    expect(result).toBe("subscription_preapproval");
  });

  it("extracts subscription_authorized_payment from payload", () => {
    const payload: WebhookPayload = {
      data: { id: "payment-123" },
      type: "subscription_authorized_payment",
      date_created: "2024-01-01T00:00:00.000Z",
      user_id: "12345",
      api_version: "v1",
      action: "created",
    };
    const result = extractWebhookTopic(payload);
    expect(result).toBe("subscription_authorized_payment");
  });
});
