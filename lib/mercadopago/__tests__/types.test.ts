import { describe, it, expect } from "vitest";
import type {
  CreatePreapprovalPlanRequest,
  CreatePreapprovalPlanResponse,
  CreatePreapprovalRequest,
  CreatePreapprovalResponse,
  GetPreapprovalResponse,
  WebhookPayload,
  WebhookTopic,
  MpPreapprovalStatus,
} from "@/lib/mercadopago/types";

describe("MercadoPago types", () => {
  it("WebhookTopic accepts valid topics", () => {
    const validTopics: WebhookTopic[] = [
      "subscription_preapproval",
      "subscription_authorized_payment",
    ];
    expect(validTopics).toHaveLength(2);
  });

  it("MpPreapprovalStatus accepts valid statuses", () => {
    const validStatuses: MpPreapprovalStatus[] = [
      "authorized",
      "cancelled",
      "paused",
    ];
    expect(validStatuses).toHaveLength(3);
  });

  it("CreatePreapprovalPlanRequest has correct shape", () => {
    const request: CreatePreapprovalPlanRequest = {
      reason: "Plan Básico",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };
    expect(request.reason).toBe("Plan Básico");
    expect(request.auto_recurring.frequency).toBe(1);
    expect(request.auto_recurring.frequency_type).toBe("months");
    expect(request.auto_recurring.transaction_amount).toBe(24990);
    expect(request.auto_recurring.currency_id).toBe("CLP");
  });

  it("CreatePreapprovalRequest has correct shape", () => {
    const request: CreatePreapprovalRequest = {
      preapproval_plan_id: "plan-123",
      reason: "Plan Básico",
      external_reference: "user-456",
      payer_email: "test@example.com",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 24990,
        currency_id: "CLP",
      },
      back_url: "https://example.com/callback",
      status: "pending",
    };
    expect(request.preapproval_plan_id).toBe("plan-123");
    expect(request.payer_email).toBe("test@example.com");
    expect(request.status).toBe("pending");
  });

  it("CreatePreapprovalResponse has correct shape", () => {
    const response: CreatePreapprovalResponse = {
      id: "preapproval-123",
      status: "authorized",
      init_point: "https://www.mercadopago.com/checkout",
      payer_email: "test@example.com",
      external_reference: "user-456",
    };
    expect(response.id).toBe("preapproval-123");
    expect(response.init_point).toBe("https://www.mercadopago.com/checkout");
  });

  it("GetPreapprovalResponse has correct shape", () => {
    const response: GetPreapprovalResponse = {
      id: "preapproval-123",
      status: "authorized",
      payer_email: "test@example.com",
      external_reference: "user-456",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 24990,
        currency_id: "CLP",
      },
    };
    expect(response.status).toBe("authorized");
    expect(response.auto_recurring.transaction_amount).toBe(24990);
  });

  it("WebhookPayload has correct shape", () => {
    const payload: WebhookPayload = {
      data: {
        id: "preapproval-123",
      },
      type: "subscription_preapproval",
      date_created: "2024-01-01T00:00:00.000Z",
      user_id: "12345",
      api_version: "v1",
      action: "created",
    };
    expect(payload.data.id).toBe("preapproval-123");
    expect(payload.type).toBe("subscription_preapproval");
  });
});
