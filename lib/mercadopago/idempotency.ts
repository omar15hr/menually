import crypto from "crypto";

/**
 * Generate a deterministic idempotency key for Mercado Pago API calls.
 * If `stableOperationId` is reused for retries, the same key is generated.
 */
export function generateIdempotencyKey(stableOperationId: string): string {
  return crypto
    .createHash("sha256")
    .update(stableOperationId)
    .digest("hex")
    .slice(0, 64);
}
