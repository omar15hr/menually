import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe(".env.example", () => {
  const envPath = path.resolve(process.cwd(), ".env.example");
  const envContent = fs.readFileSync(envPath, "utf-8");

  it("contains MP_ACCESS_TOKEN", () => {
    expect(envContent).toContain("MP_ACCESS_TOKEN=");
  });

  it("contains MP_WEBHOOK_SECRET", () => {
    expect(envContent).toContain("MP_WEBHOOK_SECRET=");
  });

  it("contains MP_PLAN_BASIC_MONTHLY_ID", () => {
    expect(envContent).toContain("MP_PLAN_BASIC_MONTHLY_ID=");
  });

  it("contains MP_PLAN_BASIC_ANNUAL_ID", () => {
    expect(envContent).toContain("MP_PLAN_BASIC_ANNUAL_ID=");
  });

  it("contains MP_PLAN_PRO_MONTHLY_ID", () => {
    expect(envContent).toContain("MP_PLAN_PRO_MONTHLY_ID=");
  });

  it("contains MP_PLAN_PRO_ANNUAL_ID", () => {
    expect(envContent).toContain("MP_PLAN_PRO_ANNUAL_ID=");
  });

  it("contains NEXT_PUBLIC_MP_SANDBOX", () => {
    expect(envContent).toContain("NEXT_PUBLIC_MP_SANDBOX=");
  });
});
