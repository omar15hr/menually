import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { POST } from "@/app/api/webhooks/mercadopago/route";
import {
  logWebhookSuccess,
  logWebhookIgnored,
  logWebhookError,
} from "@/lib/mercadopago/webhook-logger";

// ─── Mock Dependencies ───
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseInsert = vi.fn();
  const mockSupabaseUpsert = vi.fn();
  const mockSupabaseUpdate = vi.fn();
  const mockSupabaseEq = vi.fn();
  const mockSupabaseSingle = vi.fn();

const mockSupabaseClient = {
  from: mockSupabaseFrom,
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

const mockGetPreapproval = vi.fn();

vi.mock("@/lib/mercadopago/factory", () => ({
  createMPClient: vi.fn(() => ({
    getPreapproval: mockGetPreapproval,
    createPreapproval: vi.fn(),
    cancelPreapproval: vi.fn(),
  })),
}));

vi.mock("@/lib/mercadopago/webhook-logger", () => ({
  logWebhookSuccess: vi.fn(),
  logWebhookIgnored: vi.fn(),
  logWebhookError: vi.fn(),
}));

// ─── HMAC Helpers ───
const TEST_SECRET = "test-webhook-secret";
const TEST_TS = String(Math.floor(Date.now() / 1000));
const TEST_X_REQUEST_ID = "test-request-id-123";

function buildManifest(dataId: string, xRequestId: string, ts: string): string {
  return `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
}

function computeHMAC(secret: string, manifest: string): string {
  return crypto.createHmac("sha256", secret).update(manifest).digest("hex");
}

function buildXSignature(ts: string, v1: string): string {
  return `ts=${ts},v1=${v1}`;
}

function createMockNextRequest({
  body,
  headers = {},
  searchParams = {},
}: {
  body: string;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
}): NextRequest {
  const url = new URL("http://localhost/api/webhooks/mercadopago");
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  const request = new Request(url.toString(), {
    method: "POST",
    headers,
    body,
  });

  return Object.assign(request, { nextUrl: url }) as NextRequest;
}

// ─── Test Data ───
const TEST_DATA_ID = "preapproval-123";
const VALID_MANIFEST = buildManifest(TEST_DATA_ID, TEST_X_REQUEST_ID, TEST_TS);
const VALID_V1 = computeHMAC(TEST_SECRET, VALID_MANIFEST);
const VALID_X_SIGNATURE = buildXSignature(TEST_TS, VALID_V1);

const validPreapprovalPayload = {
  data: { id: TEST_DATA_ID },
  type: "subscription_preapproval" as const,
  date_created: "2024-01-01T00:00:00.000Z",
  user_id: "12345",
  api_version: "v1",
  action: "created",
};

const validPaymentPayload = {
  data: { id: TEST_DATA_ID },
  type: "subscription_authorized_payment" as const,
  date_created: "2024-01-01T00:00:00.000Z",
  user_id: "12345",
  api_version: "v1",
  action: "created",
};

describe("POST /api/webhooks/mercadopago", () => {
  let profileResult: { data: unknown; error: unknown } = { data: { id: "user-abc-123" }, error: null };
  let existingSubResult: { data: unknown; error: unknown } = { data: null, error: null };

  beforeAll(() => {
    process.env.MP_WEBHOOK_SECRET = TEST_SECRET;
    process.env.MP_ACCESS_TOKEN = "test-access-token";
  });

  beforeEach(() => {
    vi.clearAllMocks();
    profileResult = { data: { id: "user-abc-123" }, error: null };
    existingSubResult = { data: null, error: null };

    // Default: upsert succeeds
    mockSupabaseUpsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockReturnValue(Promise.resolve({ data: null, error: null })),
      }),
    });

    // Flexible mock that routes by table name
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockReturnValue(Promise.resolve(profileResult)),
            }),
          }),
        };
      }
      if (table === "subscriptions") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockReturnValue(Promise.resolve(existingSubResult)),
              single: mockSupabaseSingle.mockReturnValue(
                Promise.resolve({ data: null, error: null }),
              ),
            }),
          }),
          upsert: mockSupabaseUpsert,
          update: mockSupabaseUpdate.mockReturnValue({
            eq: vi.fn().mockReturnValue(Promise.resolve({ data: null, error: null })),
          }),
        };
      }
      return {};
    });
  });

  // ─── 1. Valid subscription_preapproval webhook ───
  it("handles valid subscription_preapproval webhook: verifies HMAC, fetches preapproval, upserts DB, returns 200", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockGetPreapproval).toHaveBeenCalledWith(TEST_DATA_ID);
    expect(mockSupabaseFrom).toHaveBeenCalledWith("subscriptions");
    expect(mockSupabaseUpsert).toHaveBeenCalled();

    const upsertCall = mockSupabaseUpsert.mock.calls[0][0];
    expect(upsertCall.user_id).toBe(userId);
    expect(upsertCall.mp_preapproval_id).toBe(TEST_DATA_ID);
    expect(upsertCall.status).toBe("active");
    expect(upsertCall.billing_cycle).toBe("monthly");
    expect(upsertCall.amount).toBe(24990);
  });

  // ─── 2. Valid subscription_authorized_payment webhook ───
  it("handles valid subscription_authorized_payment webhook: updates DB, returns 200", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);

    const request = createMockNextRequest({
      body: JSON.stringify(validPaymentPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_authorized_payment",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockSupabaseFrom).toHaveBeenCalledWith("subscriptions");
    expect(mockSupabaseUpsert).toHaveBeenCalled();

    const upsertCall = mockSupabaseUpsert.mock.calls[0][0];
    expect(upsertCall.status).toBe("active");
  });

  // ─── 3. Invalid HMAC ───
  it("returns 401 for tampered signature", async () => {
    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": "ts=123,v1=invalid",
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Invalid signature");
  });

  // ─── 4. Missing headers ───
  it("returns 400 when x-signature is missing", async () => {
    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Missing required headers");
  });

  // ─── 5. Malformed payload ───
  it("returns 200 for invalid JSON body (MP should not retry)", async () => {
    const request = createMockNextRequest({
      body: "not-valid-json",
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  // ─── 6. Unknown topic ───
  it("returns 200 for unsupported webhook topic (MP should not retry)", async () => {
    const unknownDataId = "unknown-123";
    const unknownManifest = buildManifest(unknownDataId, TEST_X_REQUEST_ID, TEST_TS);
    const unknownV1 = computeHMAC(TEST_SECRET, unknownManifest);
    const unknownXSignature = buildXSignature(TEST_TS, unknownV1);

    const unknownPayload = {
      data: { id: unknownDataId },
      type: "unknown_topic",
      date_created: "2024-01-01T00:00:00.000Z",
      user_id: "12345",
      api_version: "v1",
      action: "created",
    };

    const request = createMockNextRequest({
      body: JSON.stringify(unknownPayload),
      headers: {
        "x-signature": unknownXSignature,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": unknownDataId,
        type: "unknown_topic",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  // ─── 7. MP API error ───
  it("returns 200 when getPreapproval fails (logs error, no retry)", async () => {
    mockGetPreapproval.mockRejectedValue(new Error("MP API error"));

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  // ─── 8. DB upsert error ───
  it("returns 200 when DB upsert fails (logs error, no retry)", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);

    const mockUpsertChain = {
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockReturnValue(Promise.resolve({ data: null, error: new Error("DB error") })),
      }),
    };

    mockSupabaseUpsert.mockReturnValue(mockUpsertChain);

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  // ─── 9. User not found ───
  it("returns 200 when external_reference does not match a user (logs error)", async () => {
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: "nonexistent-user",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);
    profileResult = { data: null, error: null };

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockSupabaseUpsert).not.toHaveBeenCalled();
  });

  // ─── 10. Idempotency ───
  it("handles duplicate webhooks as no-op (idempotent upsert)", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    // First call
    const response1 = await POST(request);
    expect(response1.status).toBe(200);

    // Second call (duplicate) — must create a new request because body can only be read once
    const request2 = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });
    const response2 = await POST(request2);
    expect(response2.status).toBe(200);

    // Both should result in upsert calls
    expect(mockSupabaseUpsert).toHaveBeenCalledTimes(2);
  });

  // ─── Phase 3: Data Integrity ───

  it("does NOT default plan_type to basic when existingSub is null", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);
    existingSubResult = { data: null, error: null };

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockSupabaseUpsert).toHaveBeenCalled();

    const upsertCall = mockSupabaseUpsert.mock.calls[0][0];
    expect(upsertCall.plan_type).not.toBe("basic");
    expect(upsertCall.plan_type).toBeUndefined();
  });

  it("sets current_period_start, current_period_end, and next_billing_date on preapproval webhook", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const before = Date.now();
    const response = await POST(request);
    const after = Date.now();

    expect(response.status).toBe(200);
    expect(mockSupabaseUpsert).toHaveBeenCalled();

    const upsertCall = mockSupabaseUpsert.mock.calls[0][0];
    expect(upsertCall.current_period_start).toBeDefined();
    expect(upsertCall.current_period_end).toBeDefined();
    expect(upsertCall.next_billing_date).toBeDefined();

    const periodStart = new Date(upsertCall.current_period_start).getTime();
    const periodEnd = new Date(upsertCall.current_period_end).getTime();
    const nextBilling = new Date(upsertCall.next_billing_date).getTime();

    expect(periodStart).toBeGreaterThanOrEqual(before - 5000);
    expect(periodStart).toBeLessThanOrEqual(after + 5000);
    // periodEnd should be ~1 month after periodStart (28-31 days)
    expect(periodEnd - periodStart).toBeGreaterThanOrEqual(28 * 24 * 60 * 60 * 1000);
    expect(periodEnd - periodStart).toBeLessThanOrEqual(31 * 24 * 60 * 60 * 1000);
    expect(nextBilling).toBe(periodEnd);
  });

  it("sets last_payment_date and next_billing_date on authorized_payment webhook", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);

    const request = createMockNextRequest({
      body: JSON.stringify(validPaymentPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_authorized_payment",
      },
    });

    const before = Date.now();
    const response = await POST(request);
    const after = Date.now();

    expect(response.status).toBe(200);
    expect(mockSupabaseUpsert).toHaveBeenCalled();

    const upsertCall = mockSupabaseUpsert.mock.calls[0][0];
    expect(upsertCall.last_payment_date).toBeDefined();
    expect(upsertCall.next_billing_date).toBeDefined();

    const lastPayment = new Date(upsertCall.last_payment_date).getTime();
    expect(lastPayment).toBeGreaterThanOrEqual(before - 5000);
    expect(lastPayment).toBeLessThanOrEqual(after + 5000);
  });

  // ─── NEW TESTS for fix-mp-upsert-constraints ───

  // ─── 11. Annual billing cycle (frequency 12) ───
  it("sets billing_cycle to annual when frequency is 12", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 12,
        frequency_type: "months" as const,
        transaction_amount: 254990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockSupabaseUpsert).toHaveBeenCalled();

    const upsertCall = mockSupabaseUpsert.mock.calls[0][0];
    expect(upsertCall.billing_cycle).toBe("annual");
    expect(upsertCall.amount).toBe(254990);
  });

  // ─── 12. User not found in profiles ───
  it("returns 200 and skips upsert when user is not found in profiles", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);
    profileResult = { data: null, error: null };

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockSupabaseUpsert).not.toHaveBeenCalled();
  });

  // ─── 13. Preserves plan_type and trial_ends_at ───
  it("preserves existing plan_type and trial_ends_at on upsert", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);
    existingSubResult = {
      data: {
        id: "sub-456",
        user_id: userId,
        plan_type: "pro",
        trial_ends_at: "2025-02-28T00:00:00.000Z",
        billing_cycle: "monthly",
      },
      error: null,
    };

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockSupabaseUpsert).toHaveBeenCalled();

    const upsertCall = mockSupabaseUpsert.mock.calls[0][0];
    expect(upsertCall.plan_type).toBe("pro");
    expect(upsertCall.trial_ends_at).toBe("2025-02-28T00:00:00.000Z");
  });

  // ─── 14. Authorized payment sets status active ───
  it("sets status to active in subscription_authorized_payment webhook", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);

    const request = createMockNextRequest({
      body: JSON.stringify(validPaymentPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_authorized_payment",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockSupabaseUpsert).toHaveBeenCalled();

    const upsertCall = mockSupabaseUpsert.mock.calls[0][0];
    expect(upsertCall.status).toBe("active");
  });

  // ─── 15. Days frequency always maps to monthly ───
  it("sets billing_cycle to monthly when frequency_type is days", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 30,
        frequency_type: "days" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockSupabaseUpsert).toHaveBeenCalled();

    const upsertCall = mockSupabaseUpsert.mock.calls[0][0];
    expect(upsertCall.billing_cycle).toBe("monthly");
  });

  // ─── 16. Frequency 24 months maps to annual ───
  it("sets billing_cycle to annual when frequency is 24 months", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 24,
        frequency_type: "months" as const,
        transaction_amount: 499980,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockSupabaseUpsert).toHaveBeenCalled();

    const upsertCall = mockSupabaseUpsert.mock.calls[0][0];
    expect(upsertCall.billing_cycle).toBe("annual");
  });

  // ─── Webhook Logger Integration ───
  it("calls logWebhookSuccess on successful preapproval webhook", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(logWebhookSuccess).toHaveBeenCalled();
  });

  it("calls logWebhookIgnored when user is not found in profiles", async () => {
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: "nonexistent-user",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);
    profileResult = { data: null, error: null };

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(logWebhookIgnored).toHaveBeenCalled();
  });

  it("calls logWebhookError when DB upsert fails", async () => {
    const userId = "user-abc-123";
    const mockPreapproval = {
      id: TEST_DATA_ID,
      status: "authorized" as const,
      payer_email: "test@example.com",
      external_reference: userId,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months" as const,
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };

    mockGetPreapproval.mockResolvedValue(mockPreapproval);

    // upsert returns { error } directly (no .select().single() chain in route)
    mockSupabaseUpsert.mockReturnValue(Promise.resolve({ error: new Error("DB error") }));

    const request = createMockNextRequest({
      body: JSON.stringify(validPreapprovalPayload),
      headers: {
        "x-signature": VALID_X_SIGNATURE,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": TEST_DATA_ID,
        type: "subscription_preapproval",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(logWebhookError).toHaveBeenCalled();
  });

  // ─── Phase 4: Chargeback & Refund ───

  it("handles chargeback webhook: updates subscription status to chargeback", async () => {
    const chargebackDataId = "preapproval-chargeback-123";
    const chargebackManifest = buildManifest(chargebackDataId, TEST_X_REQUEST_ID, TEST_TS);
    const chargebackV1 = computeHMAC(TEST_SECRET, chargebackManifest);
    const chargebackXSignature = buildXSignature(TEST_TS, chargebackV1);

    const chargebackPayload = {
      data: { id: chargebackDataId },
      type: "chargeback" as const,
      date_created: "2024-01-01T00:00:00.000Z",
      user_id: "12345",
      api_version: "v1",
      action: "created",
    };

    existingSubResult = {
      data: {
        id: "sub-123",
        user_id: "user-abc-123",
        mp_preapproval_id: chargebackDataId,
        status: "active",
        plan_type: "basic",
      },
      error: null,
    };

    const request = createMockNextRequest({
      body: JSON.stringify(chargebackPayload),
      headers: {
        "x-signature": chargebackXSignature,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": chargebackDataId,
        type: "chargeback",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockSupabaseUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "chargeback",
        updated_at: expect.any(String),
      }),
    );
  });

  it("handles refund webhook: updates subscription status to refunded", async () => {
    const refundDataId = "preapproval-refund-123";
    const refundManifest = buildManifest(refundDataId, TEST_X_REQUEST_ID, TEST_TS);
    const refundV1 = computeHMAC(TEST_SECRET, refundManifest);
    const refundXSignature = buildXSignature(TEST_TS, refundV1);

    const refundPayload = {
      data: { id: refundDataId },
      type: "refund" as const,
      date_created: "2024-01-01T00:00:00.000Z",
      user_id: "12345",
      api_version: "v1",
      action: "created",
    };

    existingSubResult = {
      data: {
        id: "sub-123",
        user_id: "user-abc-123",
        mp_preapproval_id: refundDataId,
        status: "pending_refund",
        plan_type: "basic",
      },
      error: null,
    };

    const request = createMockNextRequest({
      body: JSON.stringify(refundPayload),
      headers: {
        "x-signature": refundXSignature,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": refundDataId,
        type: "refund",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockSupabaseUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "refunded",
        updated_at: expect.any(String),
      }),
    );
  });

  it("returns 200 for chargeback when subscription not found (no DB write)", async () => {
    const chargebackDataId = "preapproval-chargeback-456";
    const chargebackManifest = buildManifest(chargebackDataId, TEST_X_REQUEST_ID, TEST_TS);
    const chargebackV1 = computeHMAC(TEST_SECRET, chargebackManifest);
    const chargebackXSignature = buildXSignature(TEST_TS, chargebackV1);

    const chargebackPayload = {
      data: { id: chargebackDataId },
      type: "chargeback" as const,
      date_created: "2024-01-01T00:00:00.000Z",
      user_id: "12345",
      api_version: "v1",
      action: "created",
    };

    existingSubResult = { data: null, error: null };

    const request = createMockNextRequest({
      body: JSON.stringify(chargebackPayload),
      headers: {
        "x-signature": chargebackXSignature,
        "x-request-id": TEST_X_REQUEST_ID,
      },
      searchParams: {
        "data.id": chargebackDataId,
        type: "chargeback",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockSupabaseUpdate).not.toHaveBeenCalled();
  });
});
