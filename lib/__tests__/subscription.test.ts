import { describe, it, expect } from "vitest";
import type { Database } from "@/types/database.types";
import {
  isSubscriptionActive,
  isTrialExpired,
  mapMpStatusToDbStatus,
  formatAmount,
  getPlanDescription,
  calculateTrialEnd,
  getPlanAmount,
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

  it("throws for unknown status", () => {
    expect(() => mapMpStatusToDbStatus("unknown")).toThrow();
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
  it("returns date 30 days from now", () => {
    const before = Date.now();
    const result = calculateTrialEnd();
    const after = Date.now();
    const expected = new Date(before + 30 * 24 * 60 * 60 * 1000);

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
