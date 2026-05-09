import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  MercadoPagoClient,
  MercadoPagoError,
} from "@/lib/mercadopago/client";
import type {
  CreatePreapprovalRequest,
  CreatePreapprovalResponse,
  GetPreapprovalResponse,
} from "@/lib/mercadopago/types";
import { MP_API_BASE_URL, MP_SANDBOX_BASE_URL } from "@/lib/mercadopago/constants";

describe("MercadoPagoClient", () => {
  const accessToken = "test-access-token";
  let client: MercadoPagoClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof global.fetch;
    client = new MercadoPagoClient(accessToken);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createPreapproval", () => {
    it("returns expected response on success", async () => {
      const mockResponse: CreatePreapprovalResponse = {
        id: "preapproval-123",
        status: "authorized",
        init_point: "https://www.mercadopago.com/checkout",
        payer_email: "test@example.com",
        external_reference: "user-456",
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

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

      const result = await client.createPreapproval(request);

      expect(result).toEqual(mockResponse);
      expect(result.id).toBe("preapproval-123");
      expect(result.init_point).toBe("https://www.mercadopago.com/checkout");
    });

    it("sends correct request shape", async () => {
      const mockResponse: CreatePreapprovalResponse = {
        id: "preapproval-456",
        status: "authorized",
        init_point: "https://mp.com/init",
        payer_email: "payer@test.com",
        external_reference: "ref-789",
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const request: CreatePreapprovalRequest = {
        preapproval_plan_id: "plan-abc",
        reason: "Plan Pro",
        external_reference: "ref-789",
        payer_email: "payer@test.com",
        auto_recurring: {
          frequency: 12,
          frequency_type: "months",
          transaction_amount: 199990,
          currency_id: "CLP",
        },
        back_url: "https://app.com/return",
        status: "authorized",
      };

      await client.createPreapproval(request);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe(`${MP_API_BASE_URL}/preapproval`);
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(JSON.parse(options.body)).toEqual(request);
    });
  });

  describe("getPreapproval", () => {
    it("returns preapproval data on success", async () => {
      const mockResponse: GetPreapprovalResponse = {
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

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.getPreapproval("preapproval-789");

      expect(result).toEqual(mockResponse);
      expect(result.id).toBe("preapproval-789");
      expect(result.status).toBe("authorized");
    });

    it("sends GET to correct endpoint", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: "preapproval-abc",
          status: "paused",
          payer_email: "a@b.com",
          external_reference: "ref",
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 100,
            currency_id: "CLP",
          },
        }),
      });

      await client.getPreapproval("preapproval-abc");

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe(`${MP_API_BASE_URL}/preapproval/preapproval-abc`);
      expect(options.method).toBe("GET");
    });
  });

  describe("cancelPreapproval", () => {
    it("succeeds on success response", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: "cancelled" }),
      });

      await client.cancelPreapproval("preapproval-to-cancel");

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe(`${MP_API_BASE_URL}/preapproval/preapproval-to-cancel`);
      expect(options.method).toBe("PUT");
      expect(JSON.parse(options.body)).toEqual({ status: "cancelled" });
    });
  });

  describe("error handling", () => {
    it("throws MercadoPagoError when MP returns error status", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          status: 400,
          message: "Invalid preapproval_plan_id",
        }),
      });

      try {
        await client.getPreapproval("invalid-id");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(MercadoPagoError);
        expect((error as Error).message).toBe("Invalid preapproval_plan_id");
      }
    });

    it("throws MercadoPagoError with status code on API failure", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          status: 404,
          message: "Preapproval not found",
        }),
      });

      try {
        await client.getPreapproval("missing-id");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(MercadoPagoError);
        expect((error as MercadoPagoError).statusCode).toBe(404);
      }
    });

    it("throws on network failure", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        client.getPreapproval("any-id"),
      ).rejects.toThrow("Network error");
    });

    it("throws with generic message on non-JSON error response", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      try {
        await client.getPreapproval("any-id");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(MercadoPagoError);
        expect((error as Error).message).toBe("Unknown error");
        expect((error as MercadoPagoError).statusCode).toBe(400);
      }
    });
  });

  describe("sandbox mode", () => {
    it("uses sandbox base URL when sandbox is true", async () => {
      const sandboxClient = new MercadoPagoClient(accessToken, true);

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: "preapproval-sandbox",
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
      });

      await sandboxClient.getPreapproval("preapproval-sandbox");

      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${MP_SANDBOX_BASE_URL}/preapproval/preapproval-sandbox`);
    });
  });

  describe("authentication", () => {
    it("includes Bearer token in Authorization header", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: "preapproval-auth",
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
      });

      await client.getPreapproval("preapproval-auth");

      const [, options] = fetchMock.mock.calls[0];
      expect(options.headers.Authorization).toBe(`Bearer ${accessToken}`);
    });
  });

  describe("retry logic", () => {
    it("retries up to 3 times on 5xx errors then throws", async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ status: 500, message: "Internal Server Error" }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 502,
          json: async () => ({ status: 502, message: "Bad Gateway" }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({ status: 503, message: "Service Unavailable" }),
        });

      await expect(
        client.getPreapproval("retry-test"),
      ).rejects.toThrow(MercadoPagoError);

      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("succeeds on retry after initial 5xx", async () => {
      const mockResponse: GetPreapprovalResponse = {
        id: "retry-success",
        status: "authorized",
        payer_email: "test@test.com",
        external_reference: "ref",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 100,
          currency_id: "CLP",
        },
      };

      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ status: 500, message: "Internal Server Error" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

      const result = await client.getPreapproval("retry-success");

      expect(result).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});

describe("MercadoPagoError", () => {
  it("is an instance of Error", () => {
    const error = new MercadoPagoError("Test error", 400);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(400);
  });
});
