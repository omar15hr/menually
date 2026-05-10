import { describe, it, expect, vi } from "vitest";
import type { Database } from "@/types/database.types";
import {
  isSubscriptionActive,
  isTrialExpired,
  mapMpStatusToDbStatus,
  formatAmount,
  getPlanDescription,
  calculateTrialEnd,
  getPlanAmount,
  calculatePeriodDates,
  calculatePeriodEndFromFrequency,
} from "@/lib/subscription";

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

function makeSubscription(
  overrides: Partial<SubscriptionRow> = {},
): SubscriptionRow {
  const now = new Date().toISOString();
  const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const past = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: "sub-1",
    user_id: "user-1",
    plan_type: "basic",
    billing_cycle: "monthly",
    status: "trial",
    amount: 24990,
    mp_preapproval_id: null,
    mp_subscription_id: null,
    trial_ends_at: future,
    current_period_start: now,
    current_period_end: future,
    last_payment_date: null,
    next_billing_date: null,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

describe("isSubscriptionActive", () => {
  it("returns false for null subscription", () => {
    expect(isSubscriptionActive(null)).toBe(false);
  });

  it("returns true for active status", () => {
    const sub = makeSubscription({ status: "active" });
    expect(isSubscriptionActive(sub)).toBe(true);
  });

  it("returns true for trial not expired", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const sub = makeSubscription({ status: "trial", trial_ends_at: future });
    expect(isSubscriptionActive(sub)).toBe(true);
  });

  it("returns false for trial expired", () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const sub = makeSubscription({ status: "trial", trial_ends_at: past });
    expect(isSubscriptionActive(sub)).toBe(false);
  });

  it("returns false for cancelled status", () => {
    const sub = makeSubscription({ status: "cancelled" });
    expect(isSubscriptionActive(sub)).toBe(false);
  });

  it("returns false for past_due status", () => {
    const sub = makeSubscription({ status: "past_due" });
    expect(isSubscriptionActive(sub)).toBe(false);
  });
});

describe("isTrialExpired", () => {
  it("returns true for null subscription", () => {
    expect(isTrialExpired(null)).toBe(true);
  });

  it("returns false for active trial", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const sub = makeSubscription({ status: "trial", trial_ends_at: future });
    expect(isTrialExpired(sub)).toBe(false);
  });

  it("returns true for expired trial", () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const sub = makeSubscription({ status: "trial", trial_ends_at: past });
    expect(isTrialExpired(sub)).toBe(true);
  });

  it("returns false for active (paid) subscription", () => {
    const sub = makeSubscription({ status: "active" });
    expect(isTrialExpired(sub)).toBe(false);
  });
});

describe("mapMpStatusToDbStatus", () => {
  it('maps "authorized" to "active"', () => {
    expect(mapMpStatusToDbStatus("authorized")).toBe("active");
  });

  it('maps "cancelled" to "cancelled"', () => {
    expect(mapMpStatusToDbStatus("cancelled")).toBe("cancelled");
  });

  it('maps "paused" to "past_due"', () => {
    expect(mapMpStatusToDbStatus("paused")).toBe("past_due");
  });

  it('returns "past_due" for unknown status with warning log', () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(mapMpStatusToDbStatus("unknown")).toBe("past_due");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Unknown Mercado Pago status"),
    );
    warnSpy.mockRestore();
  });

  it('returns "past_due" for "error" status with warning log', () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(mapMpStatusToDbStatus("error")).toBe("past_due");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Unknown Mercado Pago status"),
    );
    warnSpy.mockRestore();
  });
});

describe("formatAmount", () => {
  it('formats 24990 as "$24.990"', () => {
    expect(formatAmount(24990)).toBe("$24.990");
  });

  it('formats 305990 as "$305.990"', () => {
    expect(formatAmount(305990)).toBe("$305.990");
  });
});

describe("getPlanDescription", () => {
  it('returns "Plan Básico Mensual" for basic monthly', () => {
    expect(getPlanDescription("basic", "monthly")).toBe("Plan Básico Mensual");
  });

  it('returns "Plan Pro Anual" for pro annual', () => {
    expect(getPlanDescription("pro", "annual")).toBe("Plan Pro Anual");
  });
});

describe("calculateTrialEnd", () => {
  it("returns date 14 days from now", () => {
    const before = Date.now();
    const result = calculateTrialEnd();
    const after = Date.now();
    const expected = new Date(before + 14 * 24 * 60 * 60 * 1000);

    expect(result.getTime()).toBeGreaterThanOrEqual(expected.getTime() - 1000);
    expect(result.getTime()).toBeLessThanOrEqual(expected.getTime() + 1000 + (after - before));
  });
});

describe("getPlanAmount", () => {
  it("returns 24990 for basic monthly", () => {
    expect(getPlanAmount("basic", "monthly")).toBe(24990);
  });

  it("returns 305990 for pro annual", () => {
    expect(getPlanAmount("pro", "annual")).toBe(305990);
  });
});

describe("calculatePeriodDates", () => {
  it("returns correct dates for monthly billing", () => {
    const ref = new Date("2024-01-15T00:00:00.000Z");
    const result = calculatePeriodDates("monthly", ref);
    expect(result.current_period_start).toEqual(ref);
    expect(result.current_period_end).toEqual(new Date("2024-02-15T00:00:00.000Z"));
    expect(result.next_billing_date).toEqual(new Date("2024-02-15T00:00:00.000Z"));
  });

  it("returns correct dates for annual billing", () => {
    const ref = new Date("2024-01-15T00:00:00.000Z");
    const result = calculatePeriodDates("annual", ref);
    expect(result.current_period_start).toEqual(ref);
    expect(result.current_period_end).toEqual(new Date("2025-01-15T00:00:00.000Z"));
    expect(result.next_billing_date).toEqual(new Date("2025-01-15T00:00:00.000Z"));
  });

  it("does not mutate the reference date", () => {
    const ref = new Date("2024-01-15T00:00:00.000Z");
    const refCopy = new Date(ref.getTime());
    calculatePeriodDates("monthly", ref);
    expect(ref.getTime()).toBe(refCopy.getTime());
  });

  it("defaults reference date to now when omitted", () => {
    const before = Date.now();
    const result = calculatePeriodDates("monthly");
    const after = Date.now();
    expect(result.current_period_start.getTime()).toBeGreaterThanOrEqual(before - 1000);
    expect(result.current_period_start.getTime()).toBeLessThanOrEqual(after + 1000);
  });
});

describe("calculatePeriodEndFromFrequency", () => {
  it("adds days correctly without mutating input", () => {
    const ref = new Date("2024-01-15T00:00:00.000Z");
    const refCopy = new Date(ref.getTime());
    const result = calculatePeriodEndFromFrequency(30, "days", ref);
    expect(result).toEqual(new Date("2024-02-14T00:00:00.000Z"));
    expect(ref.getTime()).toBe(refCopy.getTime());
  });

  it("adds months correctly without mutating input", () => {
    const ref = new Date("2024-01-15T00:00:00.000Z");
    const refCopy = new Date(ref.getTime());
    const result = calculatePeriodEndFromFrequency(1, "months", ref);
    expect(result).toEqual(new Date("2024-02-15T00:00:00.000Z"));
    expect(ref.getTime()).toBe(refCopy.getTime());
  });

  it("adds 12 months for annual frequency", () => {
    const ref = new Date("2024-01-15T00:00:00.000Z");
    const result = calculatePeriodEndFromFrequency(12, "months", ref);
    expect(result).toEqual(new Date("2025-01-15T00:00:00.000Z"));
  });

  it("defaults reference date to now when omitted", () => {
    const before = Date.now();
    const result = calculatePeriodEndFromFrequency(1, "months");
    const after = Date.now();
    expect(result.getTime()).toBeGreaterThanOrEqual(before - 1000 + 30 * 24 * 60 * 60 * 1000);
    expect(result.getTime()).toBeLessThanOrEqual(after + 1000 + 31 * 24 * 60 * 60 * 1000);
  });
});
