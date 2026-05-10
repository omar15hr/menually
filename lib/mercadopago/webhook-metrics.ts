export type WebhookMetricStatus = "success" | "ignored" | "error";

interface WebhookMetrics {
  success: number;
  ignored: number;
  error: number;
}

const metrics: WebhookMetrics = {
  success: 0,
  ignored: 0,
  error: 0,
};

/**
 * Increment a webhook processing counter.
 */
export function incrementWebhookCounter(status: WebhookMetricStatus): void {
  metrics[status]++;
}

/**
 * Get current webhook metrics.
 */
export function getWebhookMetrics(): WebhookMetrics & { total: number; period_hours: number } {
  return {
    total: metrics.success + metrics.ignored + metrics.error,
    success: metrics.success,
    ignored: metrics.ignored,
    error: metrics.error,
    period_hours: 24,
  };
}

/**
 * Reset all webhook counters to zero.
 * Primarily intended for testing.
 */
export function resetWebhookCounters(): void {
  metrics.success = 0;
  metrics.ignored = 0;
  metrics.error = 0;
}
