import { describe, it, expect } from "vitest";
import { generateIdempotencyKey } from "@/lib/mercadopago/idempotency";

describe("generateIdempotencyKey", () => {
  it("returns a string in the correct format", () => {
    const key = generateIdempotencyKey("preapproval");
    const parts = key.split("_");

    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe("preapproval");
    // UUID v4 has 36 chars
    expect(parts[1]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    // Timestamp is a number
    expect(Number(parts[2])).not.toBeNaN();
    expect(Number(parts[2])).toBeGreaterThan(0);
  });

  it("generates unique keys on successive calls", () => {
    const key1 = generateIdempotencyKey("preapproval");
    const key2 = generateIdempotencyKey("preapproval");

    expect(key1).not.toBe(key2);
  });

  it("uses the provided prefix", () => {
    const key = generateIdempotencyKey("payment");
    expect(key.startsWith("payment_")).toBe(true);
  });

  it("includes a recent timestamp", () => {
    const before = Date.now();
    const key = generateIdempotencyKey("test");
    const after = Date.now();
    const timestamp = Number(key.split("_").pop());

    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });
});
