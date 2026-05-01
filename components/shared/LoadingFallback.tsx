"use client";

import { MenuallySpinner } from "./MenuallySpinner";

interface Props {
  /** Minimum height of the container. Default: "100vh" for full-page loading. */
  minHeight?: string;
  /** Spinner size in pixels. Default: 80. */
  spinnerSize?: number;
  /** Optional message shown below the spinner. */
  message?: string;
}

/**
 * Full-page (or section) loading fallback for React Suspense boundaries.
 *
 * Use this as the `fallback` prop of a `<Suspense>` boundary to display
 * the animated Menually spinner while server components or lazy-loaded
 * code splits are loading.
 *
 * @example
 * // In a layout or page
 * <Suspense fallback={<LoadingFallback />}>
 *   <DashboardContent />
 * </Suspense>
 *
 * // Section-level loading
 * <Suspense fallback={<LoadingFallback minHeight="400px" message="Cargando datos..." />}>
 *   <AnalyticsChart />
 * </Suspense>
 */
export function LoadingFallback({
  minHeight = "100vh",
  spinnerSize = 80,
  message,
}: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      style={{ minHeight }}
      role="status"
      aria-label={message ?? "Cargando"}
    >
      <MenuallySpinner size={spinnerSize} />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
