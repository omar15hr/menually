import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMenuTracking } from "./useMenuTracking";
import { trackEvent } from "@/actions/track.event.action";
import { toast } from "sonner";

// ── Mocks ─────────────────────────────────────────────────────────────

vi.mock("@/store/useMenuStore", () => ({
  useMenuStore: vi.fn((selector) => selector({ selectedCategoryId: null })),
}));

vi.mock("@/lib/analytics/session", () => ({
  getSession: vi.fn(() => null),
  setSession: vi.fn(),
}));

vi.mock("@/actions/scan.action", () => ({
  registerScan: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock("@/actions/track.event.action", () => ({
  trackEvent: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock crypto.randomUUID
Object.defineProperty(globalThis, "crypto", {
  value: { randomUUID: vi.fn(() => "test-session-id") },
  configurable: true,
});

// Mock navigator.clipboard
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

const mockTrackEvent = vi.mocked(trackEvent);
const mockToastSuccess = vi.mocked(toast.success);
const mockToastError = vi.mocked(toast.error);

// ── Helpers ───────────────────────────────────────────────────────────

function renderTrackingHook(props: { businessId?: string; menuSlug?: string } = {}) {
  return renderHook(() =>
    useMenuTracking({
      businessId: "biz-123",
      menuSlug: "my-restaurant",
      ...props,
    }),
  );
}

// ── Tests ─────────────────────────────────────────────────────────────

describe("useMenuTracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    mockWriteText.mockResolvedValue(undefined);
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://menually.vercel.app");
  });

  describe("trackShare", () => {
    it("copies correct URL to clipboard on success", async () => {
      const { result } = renderTrackingHook();
      await act(async () => {});
      vi.clearAllMocks();

      await act(async () => {
        result.current.trackShare();
      });

      expect(mockWriteText).toHaveBeenCalledTimes(1);
      expect(mockWriteText).toHaveBeenCalledWith(
        "https://menually.vercel.app/menu/my-restaurant",
      );
    });

    it("shows success toast when clipboard resolves", async () => {
      const { result } = renderTrackingHook();
      await act(async () => {});
      vi.clearAllMocks();

      await act(async () => {
        result.current.trackShare();
      });

      expect(mockToastSuccess).toHaveBeenCalledTimes(1);
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Enlace copiado al portapapeles",
      );
    });

    it("shows error toast when clipboard rejects", async () => {
      mockWriteText.mockRejectedValueOnce(new Error("Permission denied"));

      const { result } = renderTrackingHook();
      await act(async () => {});
      vi.clearAllMocks();

      await act(async () => {
        result.current.trackShare();
      });

      expect(mockToastError).toHaveBeenCalledTimes(1);
      expect(mockToastError).toHaveBeenCalledWith("Error al copiar el enlace");
    });

    it("fires analytics event even when clipboard fails", async () => {
      mockWriteText.mockRejectedValueOnce(new Error("Permission denied"));

      const { result } = renderTrackingHook();
      await act(async () => {});
      vi.clearAllMocks();

      await act(async () => {
        result.current.trackShare();
      });

      expect(mockTrackEvent).toHaveBeenCalledTimes(1);
      const formData = mockTrackEvent.mock.calls[0][1] as FormData;
      expect(formData.get("event_type")).toBe("share");
    });

    it("sends correct analytics payload on share", async () => {
      const { result } = renderTrackingHook();
      await act(async () => {});
      vi.clearAllMocks();

      act(() => {
        result.current.trackShare();
      });

      expect(mockTrackEvent).toHaveBeenCalledTimes(1);
      const formData = mockTrackEvent.mock.calls[0][1] as FormData;
      expect(formData.get("event_type")).toBe("share");
      expect(formData.get("session_id")).toBe("test-session-id");
      expect(formData.get("business_id")).toBe("biz-123");
    });

    it("handles empty slug by showing error toast and not copying", async () => {
      const { result } = renderTrackingHook({ menuSlug: "" });
      await act(async () => {});
      vi.clearAllMocks();

      await act(async () => {
        result.current.trackShare();
      });

      expect(mockWriteText).not.toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith("URL del menú no disponible");
    });

    it("shows error toast when clipboard API is unavailable", async () => {
      const originalClipboard = navigator.clipboard;
      Object.assign(navigator, { clipboard: undefined });

      const { result } = renderTrackingHook();
      await act(async () => {});
      vi.clearAllMocks();

      act(() => {
        result.current.trackShare();
      });

      expect(mockToastError).toHaveBeenCalledWith("Error al copiar el enlace");

      // Restore
      Object.assign(navigator, { clipboard: originalClipboard });
    });
  });
});
