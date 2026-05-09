import { describe, it, expect } from "vitest";
import {
  MP_API_BASE_URL,
  MP_SANDBOX_BASE_URL,
  MP_PLAN_ENV_VARS,
  MP_WEBHOOK_TOPICS,
  MP_STATUS_MAPPING,
  getPlanEnvVar,
} from "@/lib/mercadopago/constants";

describe("MP_API_BASE_URL", () => {
  it("exports production base URL", () => {
    expect(MP_API_BASE_URL).toBe("https://api.mercadopago.com");
  });
});

describe("MP_SANDBOX_BASE_URL", () => {
  it("exports sandbox base URL", () => {
    expect(MP_SANDBOX_BASE_URL).toBe("https://api.mercadopago.com");
  });
});

describe("MP_PLAN_ENV_VARS", () => {
  it("contains all plan env var names", () => {
    expect(MP_PLAN_ENV_VARS).toEqual({
      basic: {
        monthly: "MP_PLAN_BASIC_MONTHLY_ID",
        annual: "MP_PLAN_BASIC_ANNUAL_ID",
      },
      pro: {
        monthly: "MP_PLAN_PRO_MONTHLY_ID",
        annual: "MP_PLAN_PRO_ANNUAL_ID",
      },
    });
  });
});

describe("MP_WEBHOOK_TOPICS", () => {
  it("contains subscription webhook topics", () => {
    expect(MP_WEBHOOK_TOPICS).toContain("subscription_preapproval");
    expect(MP_WEBHOOK_TOPICS).toContain("subscription_authorized_payment");
    expect(MP_WEBHOOK_TOPICS).toHaveLength(2);
  });
});

describe("MP_STATUS_MAPPING", () => {
  it("maps authorized to active", () => {
    expect(MP_STATUS_MAPPING.authorized).toBe("active");
  });

  it("maps cancelled to cancelled", () => {
    expect(MP_STATUS_MAPPING.cancelled).toBe("cancelled");
  });

  it("maps paused to past_due", () => {
    expect(MP_STATUS_MAPPING.paused).toBe("past_due");
  });
});

describe("getPlanEnvVar", () => {
  it("returns correct env var for basic monthly", () => {
    expect(getPlanEnvVar("basic", "monthly")).toBe("MP_PLAN_BASIC_MONTHLY_ID");
  });

  it("returns correct env var for basic annual", () => {
    expect(getPlanEnvVar("basic", "annual")).toBe("MP_PLAN_BASIC_ANNUAL_ID");
  });

  it("returns correct env var for pro monthly", () => {
    expect(getPlanEnvVar("pro", "monthly")).toBe("MP_PLAN_PRO_MONTHLY_ID");
  });

  it("returns correct env var for pro annual", () => {
    expect(getPlanEnvVar("pro", "annual")).toBe("MP_PLAN_PRO_ANNUAL_ID");
  });
});
