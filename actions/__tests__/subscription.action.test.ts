import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

// ─── Mock Dependencies ───
const mockSupabaseAuthGetUser = vi.fn();

const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseEqForSelect = vi.fn();
const mockSupabaseSingle = vi.fn();

const mockSupabaseUpsert = vi.fn();
const mockSupabaseUpsertSelect = vi.fn();
const mockSupabaseUpsertSingle = vi.fn();

const mockSupabaseUpdate = vi.fn();
const mockSupabaseEqForUpdate = vi.fn();

const mockSupabaseClient = {
  auth: {
    getUser: mockSupabaseAuthGetUser,
  },
  from: mockSupabaseFrom,
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

const mockCreatePreapproval = vi.fn();
const mockCancelPreapproval = vi.fn();

vi.mock("@/lib/mercadopago/client", () => {
  class MockMercadoPagoClient {
    createPreapproval = mockCreatePreapproval;
    cancelPreapproval = mockCancelPreapproval;
  }
  return { MercadoPagoClient: MockMercadoPagoClient };
});

vi.mock("@/lib/subscription", () => ({
  calculateTrialEnd: vi.fn(() => new Date("2025-07-08T00:00:00.000Z")),
  getPlanAmount: vi.fn((planId: string, billingCycle: string) => {
    if (planId === "basic" && billingCycle === "monthly") return 24990;
    if (planId === "basic" && billingCycle === "annual") return 254990;
    if (planId === "pro" && billingCycle === "monthly") return 29990;
    if (planId === "pro" && billingCycle === "annual") return 305990;
    return 0;
  }),
  isTrialExpired: vi.fn((sub: { status: string; trial_ends_at: string | null }) => {
    if (!sub || sub.status !== "trial") return false;
    if (!sub.trial_ends_at) return true;
    return new Date(sub.trial_ends_at) <= new Date();
  }),
  calculatePeriodDates: vi.fn((billingCycle: string) => {
    const start = new Date("2024-06-01T00:00:00.000Z");
    const end = billingCycle === "annual"
      ? new Date("2025-06-01T00:00:00.000Z")
      : new Date("2024-07-01T00:00:00.000Z");
    return {
      current_period_start: start,
      current_period_end: end,
      next_billing_date: end,
    };
  }),
}));

import {
  createSubscription,
  cancelSubscription,
  upgradePlan,
  initiateRefund,
} from "@/actions/subscription.action";

describe("subscription.action", () => {
  const TEST_USER = {
    id: "user-abc-123",
    email: "test@example.com",
  };

  beforeAll(() => {
    process.env.MP_ACCESS_TOKEN = "test-access-token";
    process.env.NEXT_PUBLIC_SITE_URL = "https://test.menually.app";
    process.env.MP_PLAN_BASIC_MONTHLY_ID = "plan-basic-monthly-123";
    process.env.MP_PLAN_BASIC_ANNUAL_ID = "plan-basic-annual-123";
    process.env.MP_PLAN_PRO_MONTHLY_ID = "plan-pro-monthly-123";
    process.env.MP_PLAN_PRO_ANNUAL_ID = "plan-pro-annual-123";
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated user
    mockSupabaseAuthGetUser.mockResolvedValue({
      data: { user: TEST_USER },
      error: null,
    });

    // Default supabase chain for subscription queries
    mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect.mockReturnValue({
        eq: mockSupabaseEqForSelect.mockReturnValue({
          single: mockSupabaseSingle.mockReturnValue(
            Promise.resolve({ data: null, error: null }),
          ),
        }),
      }),
      upsert: mockSupabaseUpsert.mockReturnValue({
        select: mockSupabaseUpsertSelect.mockReturnValue({
          single: mockSupabaseUpsertSingle.mockReturnValue(
            Promise.resolve({ data: { id: "sub-123" }, error: null }),
          ),
        }),
      }),
      update: mockSupabaseUpdate.mockReturnValue({
        eq: mockSupabaseEqForUpdate.mockReturnValue(
          Promise.resolve({ data: null, error: null }),
        ),
      }),
    });
  });

  // ─── createSubscription ───

  describe("createSubscription", () => {
    it("returns error when NEXT_PUBLIC_SITE_URL is missing", async () => {
      const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      try {
        delete process.env.NEXT_PUBLIC_SITE_URL;

        const result = await createSubscription("basic", "monthly");

        expect(result.success).toBe(false);
        expect(result.message).toBe("Configuración del servidor incompleta");
      } finally {
        process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
      }
    });

    it("happy path: creates subscription, returns checkoutUrl and period fields", async () => {
      const mockPreapproval = {
        id: "preapproval-123",
        status: "pending",
        init_point: "https://www.mercadopago.com/checkout",
        payer_email: "test@example.com",
        external_reference: TEST_USER.id,
      };

      mockCreatePreapproval.mockResolvedValue(mockPreapproval);

      const result = await createSubscription("basic", "monthly");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Suscripción creada");
      expect(result.checkoutUrl).toBe("https://www.mercadopago.com/checkout");
      expect(result.subscription).toEqual({
        id: "preapproval-123",
        planId: "basic",
        billingCycle: "monthly",
        amount: 24990,
        current_period_start: "2024-06-01T00:00:00.000Z",
        current_period_end: "2024-07-01T00:00:00.000Z",
        next_billing_date: "2024-07-01T00:00:00.000Z",
      });

      expect(mockCreatePreapproval).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: "Menually basic monthly",
          external_reference: TEST_USER.id,
          payer_email: TEST_USER.email,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 24990,
            currency_id: "CLP",
          },
          back_url: "https://test.menually.app/onboarding?status=success&plan=basic&cycle=monthly",
          status: "pending",
          notification_url: "https://test.menually.app/api/webhooks/mercadopago",
        }),
      );

      expect(mockSupabaseUpsert).toHaveBeenCalled();
      const upsertCall = mockSupabaseUpsert.mock.calls[0][0];
      expect(upsertCall.user_id).toBe(TEST_USER.id);
      expect(upsertCall.mp_preapproval_id).toBe("preapproval-123");
      expect(upsertCall.plan_type).toBe("basic");
      expect(upsertCall.billing_cycle).toBe("monthly");
      expect(upsertCall.amount).toBe(24990);
      expect(upsertCall.current_period_start).toBe("2024-06-01T00:00:00.000Z");
      expect(upsertCall.current_period_end).toBe("2024-07-01T00:00:00.000Z");
      expect(upsertCall.next_billing_date).toBe("2024-07-01T00:00:00.000Z");
    });

    it("returns error when user is not authenticated", async () => {
      mockSupabaseAuthGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Not authenticated"),
      });

      const result = await createSubscription("basic", "monthly");

      expect(result.success).toBe(false);
      expect(result.message).toBe("No autenticado");
    });

    it("returns error when user already has active subscription", async () => {
      mockSupabaseSingle.mockReturnValue(
        Promise.resolve({
          data: {
            id: "existing-sub",
            user_id: TEST_USER.id,
            status: "active",
            plan_type: "basic",
            billing_cycle: "monthly",
          },
          error: null,
        }),
      );

      const result = await createSubscription("pro", "annual");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Ya tienes una suscripción activa");
    });

    it("allows creating subscription when trial is expired", async () => {
      const mockPreapproval = {
        id: "preapproval-456",
        status: "pending",
        init_point: "https://www.mercadopago.com/checkout",
        payer_email: "test@example.com",
        external_reference: TEST_USER.id,
      };

      mockCreatePreapproval.mockResolvedValue(mockPreapproval);

      mockSupabaseSingle.mockReturnValue(
        Promise.resolve({
          data: {
            id: "existing-trial",
            user_id: TEST_USER.id,
            status: "trial",
            trial_ends_at: "2024-01-01T00:00:00.000Z", // expired
            plan_type: "basic",
            billing_cycle: "monthly",
          },
          error: null,
        }),
      );

      const result = await createSubscription("pro", "annual");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Suscripción creada");
      expect(result.checkoutUrl).toBe("https://www.mercadopago.com/checkout");
    });

    it("returns error when MP API fails", async () => {
      mockCreatePreapproval.mockRejectedValue(
        new Error("Invalid plan ID"),
      );

      const result = await createSubscription("basic", "monthly");

      expect(result.success).toBe(false);
      expect(result.message).toContain("Invalid plan ID");
    });

    it("returns error when DB upsert fails", async () => {
      const mockPreapproval = {
        id: "preapproval-789",
        status: "pending",
        init_point: "https://www.mercadopago.com/checkout",
        payer_email: "test@example.com",
        external_reference: TEST_USER.id,
      };

      mockCreatePreapproval.mockResolvedValue(mockPreapproval);

      mockSupabaseUpsertSingle.mockReturnValue(
        Promise.resolve({ data: null, error: new Error("DB error") }),
      );

      const result = await createSubscription("basic", "monthly");

      expect(result.success).toBe(false);
      expect(result.message).toContain("DB error");
    });
  });

  // ─── cancelSubscription ───

  describe("cancelSubscription", () => {
    it("happy path: cancels in MP and updates DB", async () => {
      mockSupabaseSingle.mockReturnValue(
        Promise.resolve({
          data: {
            id: "sub-123",
            user_id: TEST_USER.id,
            status: "active",
            mp_preapproval_id: "preapproval-123",
          },
          error: null,
        }),
      );

      mockCancelPreapproval.mockResolvedValue(undefined);

      const result = await cancelSubscription();

      expect(result.success).toBe(true);
      expect(result.message).toBe("Suscripción cancelada");
      expect(mockCancelPreapproval).toHaveBeenCalledWith("preapproval-123");
      expect(mockSupabaseUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "cancelled",
          updated_at: expect.any(String),
        }),
      );
    });

    it("returns error when user has no subscription", async () => {
      mockSupabaseSingle.mockReturnValue(
        Promise.resolve({ data: null, error: null }),
      );

      const result = await cancelSubscription();

      expect(result.success).toBe(false);
      expect(result.message).toBe("No tienes una suscripción activa");
    });

    it("still updates DB when MP cancel fails (best effort)", async () => {
      mockSupabaseSingle.mockReturnValue(
        Promise.resolve({
          data: {
            id: "sub-123",
            user_id: TEST_USER.id,
            status: "active",
            mp_preapproval_id: "preapproval-123",
          },
          error: null,
        }),
      );

      mockCancelPreapproval.mockRejectedValue(new Error("MP API error"));

      const result = await cancelSubscription();

      expect(result.success).toBe(true);
      expect(result.message).toBe("Suscripción cancelada");
      expect(mockSupabaseUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "cancelled",
          updated_at: expect.any(String),
        }),
      );
    });
  });

  // ─── upgradePlan ───

  describe("upgradePlan", () => {
    it("happy path: upgrades basic to pro, cancels old preapproval, creates new one", async () => {
      mockSupabaseSingle.mockReturnValue(
        Promise.resolve({
          data: {
            id: "sub-123",
            user_id: TEST_USER.id,
            status: "active",
            plan_type: "basic",
            billing_cycle: "monthly",
            mp_preapproval_id: "old-preapproval-123",
            amount: 24990,
          },
          error: null,
        }),
      );

      mockCancelPreapproval.mockResolvedValue(undefined);

      const mockNewPreapproval = {
        id: "new-preapproval-456",
        status: "pending",
        init_point: "https://www.mercadopago.com/new-checkout",
        payer_email: "test@example.com",
        external_reference: TEST_USER.id,
      };
      mockCreatePreapproval.mockResolvedValue(mockNewPreapproval);

      const result = await upgradePlan("pro", "monthly");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Plan actualizado");
      expect(result.checkoutUrl).toBe("https://www.mercadopago.com/new-checkout");
      expect(mockCancelPreapproval).toHaveBeenCalledWith("old-preapproval-123");
      expect(mockCreatePreapproval).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: "Menually pro monthly",
          external_reference: TEST_USER.id,
          payer_email: TEST_USER.email,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 29990,
            currency_id: "CLP",
          },
          status: "pending",
        }),
      );

      expect(mockSupabaseUpsert).toHaveBeenCalled();
      const upsertCall = mockSupabaseUpsert.mock.calls[0][0];
      expect(upsertCall.plan_type).toBe("pro");
      expect(upsertCall.amount).toBe(29990);
      expect(upsertCall.mp_preapproval_id).toBe("new-preapproval-456");
    });

    it("downgrades pro to basic", async () => {
      mockSupabaseSingle.mockReturnValue(
        Promise.resolve({
          data: {
            id: "sub-123",
            user_id: TEST_USER.id,
            status: "active",
            plan_type: "pro",
            billing_cycle: "monthly",
            mp_preapproval_id: "old-preapproval-123",
            amount: 29990,
          },
          error: null,
        }),
      );

      mockCancelPreapproval.mockResolvedValue(undefined);

      const mockNewPreapproval = {
        id: "new-preapproval-789",
        status: "pending",
        init_point: "https://www.mercadopago.com/new-checkout",
        payer_email: "test@example.com",
        external_reference: TEST_USER.id,
      };
      mockCreatePreapproval.mockResolvedValue(mockNewPreapproval);

      const result = await upgradePlan("basic", "monthly");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Plan actualizado");
      expect(result.checkoutUrl).toBe("https://www.mercadopago.com/new-checkout");
      expect(mockCancelPreapproval).toHaveBeenCalledWith("old-preapproval-123");
      expect(mockCreatePreapproval).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: "Menually basic monthly",
          auto_recurring: expect.objectContaining({
            transaction_amount: 24990,
          }),
        }),
      );
    });

    it("returns error when user is not authenticated", async () => {
      mockSupabaseAuthGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Not authenticated"),
      });

      const result = await upgradePlan("pro", "monthly");

      expect(result.success).toBe(false);
      expect(result.message).toBe("No autenticado");
    });

    it("returns error when no active subscription", async () => {
      mockSupabaseSingle.mockReturnValue(
        Promise.resolve({
          data: {
            id: "sub-123",
            user_id: TEST_USER.id,
            status: "cancelled",
            plan_type: "basic",
            billing_cycle: "monthly",
            mp_preapproval_id: null,
            amount: 24990,
          },
          error: null,
        }),
      );

      const result = await upgradePlan("pro", "monthly");

      expect(result.success).toBe(false);
      expect(result.message).toBe("No tienes una suscripción activa para cambiar");
    });

    it("returns error when subscription has no mp_preapproval_id", async () => {
      mockSupabaseSingle.mockReturnValue(
        Promise.resolve({
          data: {
            id: "sub-123",
            user_id: TEST_USER.id,
            status: "active",
            plan_type: "basic",
            billing_cycle: "monthly",
            mp_preapproval_id: null,
            amount: 24990,
          },
          error: null,
        }),
      );

      const result = await upgradePlan("pro", "monthly");

      expect(result.success).toBe(false);
      expect(result.message).toBe("No tienes una suscripción activa para cambiar");
    });

    it("returns error when selecting same plan", async () => {
      mockSupabaseSingle.mockReturnValue(
        Promise.resolve({
          data: {
            id: "sub-123",
            user_id: TEST_USER.id,
            status: "active",
            plan_type: "basic",
            billing_cycle: "monthly",
            mp_preapproval_id: "old-preapproval-123",
            amount: 24990,
          },
          error: null,
        }),
      );

      const result = await upgradePlan("basic", "monthly");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Ya estás en este plan");
      expect(mockCancelPreapproval).not.toHaveBeenCalled();
      expect(mockCreatePreapproval).not.toHaveBeenCalled();
    });

    it("returns error when MP API fails", async () => {
      mockSupabaseSingle.mockReturnValue(
        Promise.resolve({
          data: {
            id: "sub-123",
            user_id: TEST_USER.id,
            status: "active",
            plan_type: "basic",
            billing_cycle: "monthly",
            mp_preapproval_id: "old-preapproval-123",
            amount: 24990,
          },
          error: null,
        }),
      );

      mockCancelPreapproval.mockResolvedValue(undefined);
      mockCreatePreapproval.mockRejectedValue(new Error("MP API error"));

      const result = await upgradePlan("pro", "monthly");

      expect(result.success).toBe(false);
      expect(result.message).toContain("MP API error");
    });
  });

  // ─── initiateRefund ───

  describe("initiateRefund", () => {
    it("sets subscription status to pending_refund", async () => {
      mockSupabaseSingle.mockReturnValue(
        Promise.resolve({
          data: {
            id: "sub-123",
            user_id: TEST_USER.id,
            status: "active",
            plan_type: "basic",
            billing_cycle: "monthly",
            mp_preapproval_id: "preapproval-123",
            amount: 24990,
          },
          error: null,
        }),
      );

      const result = await initiateRefund();

      expect(result.success).toBe(true);
      expect(result.message).toBe("Reembolso iniciado");
      expect(mockSupabaseUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "pending_refund",
          updated_at: expect.any(String),
        }),
      );
      expect(mockSupabaseEqForUpdate).toHaveBeenCalledWith("user_id", TEST_USER.id);
    });

    it("returns error when user is not authenticated", async () => {
      mockSupabaseAuthGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Not authenticated"),
      });

      const result = await initiateRefund();

      expect(result.success).toBe(false);
      expect(result.message).toBe("No autenticado");
    });

    it("returns error when no subscription found", async () => {
      mockSupabaseSingle.mockReturnValue(
        Promise.resolve({ data: null, error: null }),
      );

      const result = await initiateRefund();

      expect(result.success).toBe(false);
      expect(result.message).toBe("No tienes una suscripción activa");
    });

    it("returns error when subscription is not active", async () => {
      mockSupabaseSingle.mockReturnValue(
        Promise.resolve({
          data: {
            id: "sub-123",
            user_id: TEST_USER.id,
            status: "cancelled",
            plan_type: "basic",
            billing_cycle: "monthly",
            mp_preapproval_id: "preapproval-123",
            amount: 24990,
          },
          error: null,
        }),
      );

      const result = await initiateRefund();

      expect(result.success).toBe(false);
      expect(result.message).toBe("No tienes una suscripción activa");
    });
  });
});
