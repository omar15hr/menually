import { describe, it, expect } from "vitest";

describe("mercadopago SDK", () => {
  it("is installed and importable", async () => {
    const mp = await import("mercadopago");
    expect(mp).toBeDefined();
    expect(mp.MercadoPagoConfig).toBeDefined();
    expect(mp.PreApproval).toBeDefined();
  });
});
