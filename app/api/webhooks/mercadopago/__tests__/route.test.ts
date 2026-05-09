import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { POST } from "@/app/api/webhooks/mercadopago/route";

// ─── Mock Dependencies ───
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseUpsert = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseSingle = vi.fn();

const mockSupabaseClient = {
  from: mockSupabaseFrom,
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

const mockGetPreapproval = vi.fn();

vi.mock("@/lib/mercadopago/client", () => {
  class MockMercadoPagoClient {
    getPreapproval = mockGetPreapproval;
  }
  return { MercadoPagoClient: MockMercadoPagoClient };
});

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
  beforeAll(() => {
    process.env.MP_WEBHOOK_SECRET = TEST_SECRET;
    process.env.MP_ACCESS_TOKEN = "test-access-token";
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset supabase chain mocks
    mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect.mockReturnValue({
        eq: mockSupabaseEq.mockReturnValue({
          single: mockSupabaseSingle.mockReturnValue(Promise.resolve({ data: null, error: null })),
        }),
      }),
      upsert: mockSupabaseUpsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockReturnValue(Promise.resolve({ data: null, error: null })),
        }),
      }),
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
  it("returns 401 when x-signature is missing", async () => {
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

    expect(response.status).toBe(401);
    expect(body.error).toBe("Invalid signature");
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

    mockSupabaseFrom.mockReturnValue({
      upsert: vi.fn().mockReturnValue(mockUpsertChain),
    });

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
});
