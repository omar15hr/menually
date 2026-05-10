import { describe, it, expect } from "vitest";
import type { IMPClient } from "@/lib/mercadopago/types";
import type {
  CreatePreapprovalRequest,
  CreatePreapprovalResponse,
  GetPreapprovalResponse,
} from "@/lib/mercadopago/types";

describe("IMPClient interface", () => {
  it("can be implemented with all required methods", () => {
    const mockClient: IMPClient = {
      createPreapproval: async (_params: CreatePreapprovalRequest): Promise<CreatePreapprovalResponse> => ({
        id: "mock-id",
        status: "pending",
        init_point: "https://mp.com",
        payer_email: "test@test.com",
        external_reference: "ref",
      }),
      getPreapproval: async (_id: string): Promise<GetPreapprovalResponse> => ({
        id: "mock-id",
        status: "authorized",
        payer_email: "test@test.com",
        external_reference: "ref",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 100,
          currency_id: "CLP",
        },
      }),
      cancelPreapproval: async (_id: string): Promise<void> => {
        // no-op
      },
    };

    expect(mockClient).toBeDefined();
    expect(typeof mockClient.createPreapproval).toBe("function");
    expect(typeof mockClient.getPreapproval).toBe("function");
    expect(typeof mockClient.cancelPreapproval).toBe("function");
  });

  it("createPreapproval returns a Promise of CreatePreapprovalResponse", async () => {
    const mockClient: IMPClient = {
      createPreapproval: async () => ({
        id: "id",
        status: "pending",
        init_point: "https://mp.com",
        payer_email: "a@b.com",
        external_reference: "ref",
      }),
      getPreapproval: async () => ({ id: "", status: "pending", payer_email: "", external_reference: "", auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: 0, currency_id: "" } }),
      cancelPreapproval: async () => {},
    };

    const result = await mockClient.createPreapproval({
      reason: "Plan",
      external_reference: "user-1",
      back_url: "https://example.com",
      status: "pending",
    });

    expect(result.id).toBe("id");
    expect(result.init_point).toBe("https://mp.com");
  });

  it("getPreapproval returns a Promise of GetPreapprovalResponse", async () => {
    const mockClient: IMPClient = {
      createPreapproval: async () => ({ id: "", status: "pending", init_point: "", payer_email: "", external_reference: "" }),
      getPreapproval: async () => ({
        id: "pre-1",
        status: "authorized",
        payer_email: "user@test.com",
        external_reference: "user-1",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 24990,
          currency_id: "CLP",
        },
      }),
      cancelPreapproval: async () => {},
    };

    const result = await mockClient.getPreapproval("pre-1");
    expect(result.status).toBe("authorized");
    expect(result.auto_recurring.currency_id).toBe("CLP");
  });

  it("cancelPreapproval returns a Promise of void", async () => {
    const mockClient: IMPClient = {
      createPreapproval: async () => ({ id: "", status: "pending", init_point: "", payer_email: "", external_reference: "" }),
      getPreapproval: async () => ({ id: "", status: "pending", payer_email: "", external_reference: "", auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: 0, currency_id: "" } }),
      cancelPreapproval: async () => {},
    };

    await expect(mockClient.cancelPreapproval("pre-1")).resolves.toBeUndefined();
  });
});
