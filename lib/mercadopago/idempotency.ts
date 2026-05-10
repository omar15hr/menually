import crypto from "crypto";

/**
 * Generate an idempotency key for Mercado Pago API calls.
 * Format: {prefix}_{uuid}_{timestamp}
 */
export function generateIdempotencyKey(prefix: string): string {
  const uuid = crypto.randomUUID();
  const timestamp = Date.now();
  return `${prefix}_${uuid}_${timestamp}`;
}
