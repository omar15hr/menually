import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("mpEnv validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset module cache so re-import re-evaluates
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws when MP_ACCESS_TOKEN is missing", async () => {
    delete process.env.MP_ACCESS_TOKEN;
    process.env.MP_WEBHOOK_SECRET = "secret";

    await expect(import("@/lib/mercadopago/env")).rejects.toThrow(
      /MP_ACCESS_TOKEN/
    );
  });

  it("throws when MP_WEBHOOK_SECRET is missing", async () => {
    process.env.MP_ACCESS_TOKEN = "token";
    delete process.env.MP_WEBHOOK_SECRET;

    await expect(import("@/lib/mercadopago/env")).rejects.toThrow(
      /MP_WEBHOOK_SECRET/
    );
  });

  it("returns validated env when both required vars are present", async () => {
    process.env.MP_ACCESS_TOKEN = "test-token";
    process.env.MP_WEBHOOK_SECRET = "test-secret";
    process.env.MP_USE_SDK = "true";
    process.env.NEXT_PUBLIC_MP_SANDBOX = "true";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    const { mpEnv } = await import("@/lib/mercadopago/env");

    expect(mpEnv.MP_ACCESS_TOKEN).toBe("test-token");
    expect(mpEnv.MP_WEBHOOK_SECRET).toBe("test-secret");
    expect(mpEnv.MP_USE_SDK).toBe("true");
    expect(mpEnv.NEXT_PUBLIC_MP_SANDBOX).toBe("true");
    expect(mpEnv.NEXT_PUBLIC_SITE_URL).toBe("https://example.com");
  });

  it("uses defaults for optional vars", async () => {
    process.env.MP_ACCESS_TOKEN = "token";
    process.env.MP_WEBHOOK_SECRET = "secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    delete process.env.MP_USE_SDK;
    delete process.env.NEXT_PUBLIC_MP_SANDBOX;

    const { mpEnv } = await import("@/lib/mercadopago/env");

    expect(mpEnv.MP_USE_SDK).toBe("false");
    expect(mpEnv.NEXT_PUBLIC_MP_SANDBOX).toBe("false");
  });

  it("contains MP_USE_SDK in .env.example", () => {
    const fs = require("fs");
    const path = require("path");
    const envPath = path.resolve(process.cwd(), ".env.example");
    const envContent = fs.readFileSync(envPath, "utf-8");
    expect(envContent).toContain("MP_USE_SDK");
  });

  it("throws when NEXT_PUBLIC_SITE_URL is invalid", async () => {
    process.env.MP_ACCESS_TOKEN = "token";
    process.env.MP_WEBHOOK_SECRET = "secret";
    process.env.NEXT_PUBLIC_SITE_URL = "not-a-url";

    await expect(import("@/lib/mercadopago/env")).rejects.toThrow(
      /NEXT_PUBLIC_SITE_URL/
    );
  });
});
