import { MercadoPagoAdapter } from "./adapter";
import type { IMPClient } from "./types";
import { getMPEnv } from "./env";

function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    return e.status === 429 || e.statusCode === 429 || e.code === 429;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function withRetry(client: IMPClient, maxRetries = 4): IMPClient {
  const delays = [1000, 2000, 4000, 8000];

  async function retry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries || !isRateLimitError(error)) {
          throw error;
        }
        const delay = Math.min(delays[attempt] ?? 30000, 30000);
        await sleep(delay);
      }
    }
    throw lastError;
  }

  return {
    createPreapproval: (params, idempotencyKey?) =>
      retry(() => client.createPreapproval(params, idempotencyKey)),
    getPreapproval: (id) => retry(() => client.getPreapproval(id)),
    cancelPreapproval: (id, idempotencyKey?) =>
      retry(() => client.cancelPreapproval(id, idempotencyKey)),
  };
}

export function createMPClient(accessToken?: string, sandbox?: boolean): IMPClient {
  const mpEnv = getMPEnv();
  const token = accessToken ?? mpEnv.MP_ACCESS_TOKEN;
  const isSandbox = sandbox ?? mpEnv.NEXT_PUBLIC_MP_SANDBOX === "true";

  if (!mpEnv.MP_USE_SDK || mpEnv.MP_USE_SDK !== "true") {
    throw new Error("Mercado Pago SDK must be enabled (MP_USE_SDK=true).");
  }

  return withRetry(new MercadoPagoAdapter(token, isSandbox));
}
