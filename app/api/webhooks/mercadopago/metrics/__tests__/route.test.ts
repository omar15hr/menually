import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/webhooks/mercadopago/metrics/route";
import {
  incrementWebhookCounter,
  resetWebhookCounters,
} from "@/lib/mercadopago/webhook-metrics";

vi.mock("@/lib/mercadopago/webhook-metrics", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/mercadopago/webhook-metrics")>();
  return {
    ...mod,
    resetWebhookCounters: vi.fn(),
  };
});

function createMockNextRequest(): NextRequest {
  const url = new URL("http://localhost/api/webhooks/mercadopago/metrics");
  const request = new Request(url.toString(), { method: "GET" });
  return Object.assign(request, { nextUrl: url }) as NextRequest;
}

describe("GET /api/webhooks/mercadopago/metrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns webhook stats with default zeros", async () => {
    const request = createMockNextRequest();
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      total: 0,
      success: 0,
      ignored: 0,
      error: 0,
      period_hours: 24,
    });
  });

  it("reflects incremented counters", async () => {
    incrementWebhookCounter("success");
    incrementWebhookCounter("success");
    incrementWebhookCounter("ignored");
    incrementWebhookCounter("error");

    const request = createMockNextRequest();
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      total: 4,
      success: 2,
      ignored: 1,
      error: 1,
      period_hours: 24,
    });
  });
});
