import { MercadoPagoClient } from "./client";
import { MercadoPagoAdapter } from "./adapter";
import type { IMPClient } from "./types";
import { mpEnv } from "./env";

export function createMPClient(accessToken?: string, sandbox?: boolean): IMPClient {
  const token = accessToken ?? mpEnv.MP_ACCESS_TOKEN;
  const isSandbox = sandbox ?? mpEnv.NEXT_PUBLIC_MP_SANDBOX === "true";

  if (mpEnv.MP_USE_SDK === "true") {
    return new MercadoPagoAdapter(token, isSandbox);
  }

  return new MercadoPagoClient(token, isSandbox);
}
