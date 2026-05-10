import { describe, it, expect, vi, beforeEach } from "vitest";
import { MercadoPagoAdapter } from "@/lib/mercadopago/adapter";
import type {
  CreatePreapprovalRequest,
  CreatePreapprovalResponse,
  GetPreapprovalResponse,
} from "@/lib/mercadopago/types";

// Mock the mercadopago SDK
const mockCreate = vi.fn();
const mockGet = vi.fn();
const mockUpdate = vi.fn();

vi.mock("mercadopago", () => ({
  MercadoPagoConfig: vi.fn(function () {
    return {};
  }),
  PreApproval: vi.fn(function () {
    return {
      create: mockCreate,
      get: mockGet,
      update: mockUpdate,
    };
  }),
}));

describe("MercadoPagoAdapter", () => {
  const accessToken = "test-access-token";
  let adapter: MercadoPagoAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new MercadoPagoAdapter(accessToken, false);
  });

  describe("createPreapproval", () => {
    it("calls SDK PreApproval.create with correct params and returns mapped response", async () => {
      const sdkResponse = {
        id: "preapproval-123",
        status: "authorized",
        init_point: "https://www.mercadopago.com/checkout",
        payer_email: "test@example.com",
        external_reference: "user-456",
      };
      mockCreate.mockResolvedValueOnce(sdkResponse);

      const request: CreatePreapprovalRequest = {
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

      const result: CreatePreapprovalResponse = await adapter.createPreapproval(request);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        body: {
          reason: request.reason,
          external_reference: request.external_reference,
          payer_email: request.payer_email,
          auto_recurring: request.auto_recurring,
          back_url: request.back_url,
          status: request.status,
        },
      });

      expect(result).toEqual({
        id: "preapproval-123",
        status: "authorized",
        init_point: "https://www.mercadopago.com/checkout",
        payer_email: "test@example.com",
        external_reference: "user-456",
      });
    });

    it("handles undefined auto_recurring gracefully", async () => {
      mockCreate.mockResolvedValueOnce({
        id: "preapproval-789",
        status: "pending",
        init_point: "https://mp.com",
        payer_email: "a@b.com",
        external_reference: "ref",
      });

      const request: CreatePreapprovalRequest = {
        reason: "Plan sin recurring",
        external_reference: "ref",
        back_url: "https://example.com",
        status: "pending",
      };

      await adapter.createPreapproval(request);

      expect(mockCreate).toHaveBeenCalledWith({
        body: {
          reason: request.reason,
          external_reference: request.external_reference,
          payer_email: undefined,
          auto_recurring: undefined,
          back_url: request.back_url,
          status: request.status,
        },
      });
    });
  });

  describe("getPreapproval", () => {
    it("calls SDK PreApproval.get and returns mapped response", async () => {
      const sdkResponse = {
        id: "preapproval-789",
        status: "authorized",
        payer_email: "user@test.com",
        external_reference: "ref-999",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 24990,
          currency_id: "CLP",
        },
      };
      mockGet.mockResolvedValueOnce(sdkResponse);

      const result: GetPreapprovalResponse = await adapter.getPreapproval("preapproval-789");

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith({ id: "preapproval-789" });

      expect(result).toEqual({
        id: "preapproval-789",
        status: "authorized",
        payer_email: "user@test.com",
        external_reference: "ref-999",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 24990,
          currency_id: "CLP",
        },
      });
    });
  });

  describe("cancelPreapproval", () => {
    it("calls SDK PreApproval.update with cancelled status", async () => {
      mockUpdate.mockResolvedValueOnce({ status: "cancelled" });

      await adapter.cancelPreapproval("preapproval-to-cancel");

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        id: "preapproval-to-cancel",
        body: { status: "cancelled" },
      });
    });
  });

  describe("constructor", () => {
    it("creates MercadoPagoConfig with access token and timeout", async () => {
      const { MercadoPagoConfig } = await import("mercadopago");
      // constructor was already called in beforeEach
      expect(MercadoPagoConfig).toHaveBeenCalledWith({
        accessToken,
        options: {
          timeout: 10000,
        },
      });
    });
  });
});
