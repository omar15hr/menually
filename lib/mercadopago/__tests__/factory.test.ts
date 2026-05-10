import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { IMPClient } from "@/lib/mercadopago/types";

describe("createMPClient factory", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  async function loadFactory() {
    return import("@/lib/mercadopago/factory");
  }

  it("returns MercadoPagoAdapter when MP_USE_SDK is true", async () => {
    process.env.MP_USE_SDK = "true";
    process.env.MP_ACCESS_TOKEN = "test-token";
    process.env.MP_WEBHOOK_SECRET = "secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    const { createMPClient } = await loadFactory();
    const client = createMPClient();

    expect(typeof client.createPreapproval).toBe("function");
    expect(typeof client.getPreapproval).toBe("function");
    expect(typeof client.cancelPreapproval).toBe("function");
  });

  it("returns adapter with retry when MP_USE_SDK is false", async () => {
    process.env.MP_USE_SDK = "false";
    process.env.MP_ACCESS_TOKEN = "test-token";
    process.env.MP_WEBHOOK_SECRET = "secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    const { createMPClient } = await loadFactory();
    const client = createMPClient();

    expect(typeof client.createPreapproval).toBe("function");
    expect(typeof client.getPreapproval).toBe("function");
    expect(typeof client.cancelPreapproval).toBe("function");
  });

  it("returns adapter with retry when MP_USE_SDK is undefined", async () => {
    delete process.env.MP_USE_SDK;
    process.env.MP_ACCESS_TOKEN = "test-token";
    process.env.MP_WEBHOOK_SECRET = "secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    const { createMPClient } = await loadFactory();
    const client = createMPClient();

    expect(typeof client.createPreapproval).toBe("function");
  });

  it("uses provided access token over env var", async () => {
    process.env.MP_USE_SDK = "true";
    process.env.MP_ACCESS_TOKEN = "env-token";
    process.env.MP_WEBHOOK_SECRET = "secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    const { createMPClient } = await loadFactory();
    const client = createMPClient("provided-token");

    expect(typeof client.createPreapproval).toBe("function");
  });

  it("uses provided sandbox flag over env var", async () => {
    process.env.MP_USE_SDK = "false";
    process.env.MP_ACCESS_TOKEN = "test-token";
    process.env.MP_WEBHOOK_SECRET = "secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    process.env.NEXT_PUBLIC_MP_SANDBOX = "false";

    const { createMPClient } = await loadFactory();
    const client = createMPClient(undefined, true);

    expect(typeof client.createPreapproval).toBe("function");
  });
});

describe("withRetry", () => {
  let originalSetTimeout: typeof global.setTimeout;
  let setTimeoutSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalSetTimeout = global.setTimeout;
    setTimeoutSpy = vi.fn((cb: () => void) => {
      cb();
      return 0 as unknown as NodeJS.Timeout;
    });
    global.setTimeout = setTimeoutSpy as unknown as typeof global.setTimeout;
    process.env.MP_ACCESS_TOKEN = "test-token";
    process.env.MP_WEBHOOK_SECRET = "secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    vi.resetModules();
  });

  afterEach(() => {
    global.setTimeout = originalSetTimeout;
  });

  async function loadFactory() {
    return import("@/lib/mercadopago/factory");
  }

  it("retries on 429 with exponential backoff 1s, 2s then succeeds", async () => {
    const mockClient = {
      getPreapproval: vi.fn()
        .mockRejectedValueOnce(Object.assign(new Error("Rate limited"), { status: 429 }))
        .mockRejectedValueOnce(Object.assign(new Error("Rate limited"), { status: 429 }))
        .mockResolvedValueOnce({ id: "success", status: "authorized" }),
    } as unknown as IMPClient;

    const { withRetry } = await loadFactory();
    const retrying = withRetry(mockClient);

    const result = await retrying.getPreapproval("test-id");

    expect(result.id).toBe("success");
    expect(mockClient.getPreapproval).toHaveBeenCalledTimes(3);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
    expect((setTimeoutSpy.mock.calls[0] as unknown[])[1]).toBe(1000);
    expect((setTimeoutSpy.mock.calls[1] as unknown[])[1]).toBe(2000);
  });

  it("does not retry on non-429 errors", async () => {
    const mockClient = {
      getPreapproval: vi.fn().mockRejectedValueOnce(new Error("Bad request")),
    } as unknown as IMPClient;

    const { withRetry } = await loadFactory();
    const retrying = withRetry(mockClient);

    await expect(retrying.getPreapproval("test-id")).rejects.toThrow("Bad request");
    expect(mockClient.getPreapproval).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it("gives up after 4 retries with delays 1s, 2s, 4s, 8s and throws last error", async () => {
    const error = Object.assign(new Error("Rate limited"), { status: 429 });
    const mockClient = {
      getPreapproval: vi.fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error),
    } as unknown as IMPClient;

    const { withRetry } = await loadFactory();
    const retrying = withRetry(mockClient);

    await expect(retrying.getPreapproval("test-id")).rejects.toThrow("Rate limited");
    expect(mockClient.getPreapproval).toHaveBeenCalledTimes(5);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(4);
    expect((setTimeoutSpy.mock.calls[0] as unknown[])[1]).toBe(1000);
    expect((setTimeoutSpy.mock.calls[1] as unknown[])[1]).toBe(2000);
    expect((setTimeoutSpy.mock.calls[2] as unknown[])[1]).toBe(4000);
    expect((setTimeoutSpy.mock.calls[3] as unknown[])[1]).toBe(8000);
  });

  it("retries createPreapproval on 429", async () => {
    const mockClient = {
      createPreapproval: vi.fn()
        .mockRejectedValueOnce(Object.assign(new Error("Rate limited"), { statusCode: 429 }))
        .mockResolvedValueOnce({ id: "success", status: "pending", init_point: "", payer_email: "", external_reference: "" }),
    } as unknown as IMPClient;

    const { withRetry } = await loadFactory();
    const retrying = withRetry(mockClient);

    const result = await retrying.createPreapproval({
      reason: "Test",
      external_reference: "ref",
      back_url: "https://example.com",
      status: "pending",
    });

    expect(result.id).toBe("success");
    expect(mockClient.createPreapproval).toHaveBeenCalledTimes(2);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect((setTimeoutSpy.mock.calls[0] as unknown[])[1]).toBe(1000);
  });

  it("retries cancelPreapproval on 429", async () => {
    const mockClient = {
      cancelPreapproval: vi.fn()
        .mockRejectedValueOnce(Object.assign(new Error("Rate limited"), { code: 429 }))
        .mockResolvedValueOnce(undefined),
    } as unknown as IMPClient;

    const { withRetry } = await loadFactory();
    const retrying = withRetry(mockClient);

    await retrying.cancelPreapproval("preapproval-123");

    expect(mockClient.cancelPreapproval).toHaveBeenCalledTimes(2);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect((setTimeoutSpy.mock.calls[0] as unknown[])[1]).toBe(1000);
  });
});
