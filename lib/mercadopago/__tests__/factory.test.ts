import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

    expect(client.constructor.name).toBe("MercadoPagoAdapter");
    expect(typeof client.createPreapproval).toBe("function");
    expect(typeof client.getPreapproval).toBe("function");
    expect(typeof client.cancelPreapproval).toBe("function");
  });

  it("returns MercadoPagoClient when MP_USE_SDK is false", async () => {
    process.env.MP_USE_SDK = "false";
    process.env.MP_ACCESS_TOKEN = "test-token";
    process.env.MP_WEBHOOK_SECRET = "secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    const { createMPClient } = await loadFactory();
    const client = createMPClient();

    expect(client.constructor.name).toBe("MercadoPagoClient");
    expect(typeof client.createPreapproval).toBe("function");
    expect(typeof client.getPreapproval).toBe("function");
    expect(typeof client.cancelPreapproval).toBe("function");
  });

  it("returns MercadoPagoClient when MP_USE_SDK is undefined", async () => {
    delete process.env.MP_USE_SDK;
    process.env.MP_ACCESS_TOKEN = "test-token";
    process.env.MP_WEBHOOK_SECRET = "secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    const { createMPClient } = await loadFactory();
    const client = createMPClient();

    expect(client.constructor.name).toBe("MercadoPagoClient");
  });

  it("uses provided access token over env var", async () => {
    process.env.MP_USE_SDK = "true";
    process.env.MP_ACCESS_TOKEN = "env-token";
    process.env.MP_WEBHOOK_SECRET = "secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    const { createMPClient } = await loadFactory();
    const client = createMPClient("provided-token");

    expect(client.constructor.name).toBe("MercadoPagoAdapter");
  });

  it("uses provided sandbox flag over env var", async () => {
    process.env.MP_USE_SDK = "false";
    process.env.MP_ACCESS_TOKEN = "test-token";
    process.env.MP_WEBHOOK_SECRET = "secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    process.env.NEXT_PUBLIC_MP_SANDBOX = "false";

    const { createMPClient } = await loadFactory();
    const client = createMPClient(undefined, true);

    expect(client.constructor.name).toBe("MercadoPagoClient");
  });
});
