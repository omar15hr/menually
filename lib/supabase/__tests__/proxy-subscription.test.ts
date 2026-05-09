import { describe, it, expect } from "vitest";
import type { Database } from "@/types/database.types";
import {
  resolveSubscriptionAccess,
  isSubscriptionExempt,
} from "@/lib/supabase/proxy";

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

function makeSubscription(
  overrides: Partial<SubscriptionRow> = {},
): SubscriptionRow {
  const now = new Date().toISOString();
  const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: "sub-1",
    user_id: "user-1",
    plan_type: "basic",
    billing_cycle: "monthly",
    status: "trial",
    amount: 0,
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

describe("resolveSubscriptionAccess", () => {
  it("returns isAllowed: true when no subscription (null)", () => {
    const result = resolveSubscriptionAccess(null);
    expect(result).toEqual({ isAllowed: true });
  });

  it("returns isAllowed: true for active subscription", () => {
    const sub = makeSubscription({ status: "active" });
    const result = resolveSubscriptionAccess(sub);
    expect(result).toEqual({ isAllowed: true });
  });

  it("returns isAllowed: true for trial not expired", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const sub = makeSubscription({ status: "trial", trial_ends_at: future });
    const result = resolveSubscriptionAccess(sub);
    expect(result).toEqual({ isAllowed: true });
  });

  it("returns isAllowed: false with redirectTo /onboarding for trial expired", () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const sub = makeSubscription({ status: "trial", trial_ends_at: past });
    const result = resolveSubscriptionAccess(sub);
    expect(result).toEqual({ isAllowed: false, redirectTo: "/onboarding" });
  });

  it("returns isAllowed: false with redirectTo /settings/subscription for cancelled", () => {
    const sub = makeSubscription({ status: "cancelled" });
    const result = resolveSubscriptionAccess(sub);
    expect(result).toEqual({
      isAllowed: false,
      redirectTo: "/settings/subscription",
    });
  });

  it("returns isAllowed: false with redirectTo /settings/subscription for past_due", () => {
    const sub = makeSubscription({ status: "past_due" });
    const result = resolveSubscriptionAccess(sub);
    expect(result).toEqual({
      isAllowed: false,
      redirectTo: "/settings/subscription",
    });
  });

  it("returns isAllowed: false with redirectTo /onboarding when trial_ends_at is null", () => {
    const sub = makeSubscription({ status: "trial", trial_ends_at: null });
    const result = resolveSubscriptionAccess(sub);
    expect(result).toEqual({ isAllowed: false, redirectTo: "/onboarding" });
  });
});

describe("isSubscriptionExempt", () => {
  it("returns true for /onboarding", () => {
    expect(isSubscriptionExempt("/onboarding")).toBe(true);
  });

  it("returns true for /onboarding/plan", () => {
    expect(isSubscriptionExempt("/onboarding/plan")).toBe(true);
  });

  it("returns true for /api/webhooks/mercadopago", () => {
    expect(isSubscriptionExempt("/api/webhooks/mercadopago")).toBe(true);
  });

  it("returns true for /auth/signin", () => {
    expect(isSubscriptionExempt("/auth/signin")).toBe(true);
  });

  it("returns true for /auth/signup", () => {
    expect(isSubscriptionExempt("/auth/signup")).toBe(true);
  });

  it("returns true for /menu/restaurant-slug", () => {
    expect(isSubscriptionExempt("/menu/restaurant-slug")).toBe(true);
  });

  it("returns false for /dashboard", () => {
    expect(isSubscriptionExempt("/dashboard")).toBe(false);
  });

  it("returns false for /dashboard/menu", () => {
    expect(isSubscriptionExempt("/dashboard/menu")).toBe(false);
  });

  it("returns false for /settings", () => {
    expect(isSubscriptionExempt("/settings")).toBe(false);
  });

  it("returns false for /settings/subscription", () => {
    expect(isSubscriptionExempt("/settings/subscription")).toBe(false);
  });

  it("returns false for /plan", () => {
    expect(isSubscriptionExempt("/plan")).toBe(false);
  });

  it("returns false for /business", () => {
    expect(isSubscriptionExempt("/business")).toBe(false);
  });
});
