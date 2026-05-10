import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("MP branding assets", () => {
  const mpDir = path.resolve(process.cwd(), "public/images/mp");

  it("logo.svg exists and contains SVG markup", () => {
    const logoPath = path.join(mpDir, "logo.svg");
    expect(fs.existsSync(logoPath)).toBe(true);
    const content = fs.readFileSync(logoPath, "utf-8");
    expect(content).toContain("<svg");
    expect(content).toContain("</svg>");
    expect(content).toContain("#00B1EA");
  });

  it("visa.svg exists and contains SVG markup", () => {
    const visaPath = path.join(mpDir, "payment-methods/visa.svg");
    expect(fs.existsSync(visaPath)).toBe(true);
    const content = fs.readFileSync(visaPath, "utf-8");
    expect(content).toContain("<svg");
    expect(content).toContain("</svg>");
  });

  it("mastercard.svg exists and contains SVG markup", () => {
    const mcPath = path.join(mpDir, "payment-methods/mastercard.svg");
    expect(fs.existsSync(mcPath)).toBe(true);
    const content = fs.readFileSync(mcPath, "utf-8");
    expect(content).toContain("<svg");
    expect(content).toContain("</svg>");
  });

  it("amex.svg exists and contains SVG markup", () => {
    const amexPath = path.join(mpDir, "payment-methods/amex.svg");
    expect(fs.existsSync(amexPath)).toBe(true);
    const content = fs.readFileSync(amexPath, "utf-8");
    expect(content).toContain("<svg");
    expect(content).toContain("</svg>");
  });
});
