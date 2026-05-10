import { describe, it, expect, beforeEach } from "vitest";
import {
  incrementWebhookCounter,
  getWebhookMetrics,
  resetWebhookCounters,
} from "@/lib/mercadopago/webhook-metrics";

describe("webhook-metrics", () => {
  beforeEach(() => {
    resetWebhookCounters();
  });

  it("starts with all zeros", () => {
    const metrics = getWebhookMetrics();
    expect(metrics).toEqual({
      total: 0,
      success: 0,
      ignored: 0,
      error: 0,
      period_hours: 24,
    });
  });

  it("increments success counter", () => {
    incrementWebhookCounter("success");
    const metrics = getWebhookMetrics();
    expect(metrics.success).toBe(1);
    expect(metrics.total).toBe(1);
  });

  it("increments ignored counter", () => {
    incrementWebhookCounter("ignored");
    const metrics = getWebhookMetrics();
    expect(metrics.ignored).toBe(1);
    expect(metrics.total).toBe(1);
  });

  it("increments error counter", () => {
    incrementWebhookCounter("error");
    const metrics = getWebhookMetrics();
    expect(metrics.error).toBe(1);
    expect(metrics.total).toBe(1);
  });

  it("accumulates multiple counters", () => {
    incrementWebhookCounter("success");
    incrementWebhookCounter("success");
    incrementWebhookCounter("ignored");
    incrementWebhookCounter("error");
    incrementWebhookCounter("error");

    const metrics = getWebhookMetrics();
    expect(metrics.success).toBe(2);
    expect(metrics.ignored).toBe(1);
    expect(metrics.error).toBe(2);
    expect(metrics.total).toBe(5);
  });

  it("resets all counters to zero", () => {
    incrementWebhookCounter("success");
    incrementWebhookCounter("error");
    resetWebhookCounters();

    const metrics = getWebhookMetrics();
    expect(metrics.total).toBe(0);
    expect(metrics.success).toBe(0);
    expect(metrics.error).toBe(0);
  });
});
