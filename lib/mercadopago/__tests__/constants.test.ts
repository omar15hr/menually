import { describe, it, expect } from "vitest";
import {
  MP_API_BASE_URL,
  MP_SANDBOX_BASE_URL,
} from "@/lib/mercadopago/constants";

describe("MP_API_BASE_URL", () => {
  it("exports production base URL", () => {
    expect(MP_API_BASE_URL).toBe("https://api.mercadopago.com");
  });
});

describe("MP_SANDBOX_BASE_URL", () => {
  it("exports sandbox base URL", () => {
    expect(MP_SANDBOX_BASE_URL).toBe("https://api.mercadopago.com");
  });
});
