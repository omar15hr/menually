import { z } from "zod";

const mpEnvSchema = z.object({
  MP_ACCESS_TOKEN: z.string().min(1, "MP_ACCESS_TOKEN is required"),
  MP_WEBHOOK_SECRET: z.string().min(1, "MP_WEBHOOK_SECRET is required"),
  NEXT_PUBLIC_MP_SANDBOX: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL"),
  MP_PLAN_BASIC_MONTHLY_ID: z.string().optional(),
  MP_PLAN_BASIC_ANNUAL_ID: z.string().optional(),
  MP_PLAN_PRO_MONTHLY_ID: z.string().optional(),
  MP_PLAN_PRO_ANNUAL_ID: z.string().optional(),
  MP_USE_SDK: z.enum(["true", "false"]).default("false"),
});

export const mpEnv = mpEnvSchema.parse(process.env);
