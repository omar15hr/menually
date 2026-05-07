import { describe, it, expect } from "vitest";
import { PLANS, BILLING_CYCLES, TRIAL_BADGE } from "@/lib/plans";

describe("PLANS", () => {
  it("exports basic plan with correct pricing", () => {
    expect(PLANS.basic).toBeDefined();
    expect(PLANS.basic.name).toBe("Basic");
    expect(PLANS.basic.monthlyPrice).toBe(24990);
    expect(PLANS.basic.annualPrice).toBe(24990 * 12);
    expect(PLANS.basic.currency).toBe("CLP");
    expect(PLANS.basic.isRecommended).toBe(false);
  });

  it("exports pro plan with correct pricing", () => {
    expect(PLANS.pro).toBeDefined();
    expect(PLANS.pro.name).toBe("Pro");
    expect(PLANS.pro.monthlyPrice).toBe(29990);
    expect(PLANS.pro.annualPrice).toBe(29990 * 12);
    expect(PLANS.pro.currency).toBe("CLP");
    expect(PLANS.pro.isRecommended).toBe(true);
  });

  it("exports feature lists for both plans", () => {
    expect(PLANS.basic.features.length).toBeGreaterThan(0);
    expect(PLANS.pro.features.length).toBeGreaterThan(0);
  });

  it("exports BILLING_CYCLES constant", () => {
    expect(BILLING_CYCLES).toEqual(["monthly", "annual"]);
  });

  it("exports default trial badge text", () => {
    expect(TRIAL_BADGE).toBe("Prueba gratis");
  });
});
