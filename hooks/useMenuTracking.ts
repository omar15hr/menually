"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMenuStore } from "@/store/useMenuStore";
import { getSession, setSession } from "@/lib/analytics/session";
import { registerScan } from "@/actions/scan.action";
import { trackEvent } from "@/actions/track.event.action";

interface UseMenuTrackingProps {
  businessId: string;
  menuSlug: string;
  categories?: unknown[];
  onSessionReady?: (sessionId: string, isNew: boolean) => void;
}

export function useMenuTracking({
  businessId,
  menuSlug,
  onSessionReady,
}: UseMenuTrackingProps) {
  const selectedCategoryId = useMenuStore((s) => s.selectedCategoryId);

  const sessionRef = useRef<{ id: string; isNew: boolean } | null>(null);
  const lastEventTimeRef = useRef<number>(Date.now());
  const categoryDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const existingSession = getSession(menuSlug);
    let sessionId: string;
    let isNew = false;

    if (existingSession) {
      sessionId = existingSession.sessionId;
      isNew = false;
    } else {
      sessionId = crypto.randomUUID();
      setSession(menuSlug, sessionId);
      isNew = true;
    }

    sessionRef.current = { id: sessionId, isNew };
    lastEventTimeRef.current = Date.now();

    onSessionReady?.(sessionId, isNew);

    // Register scan if new session and user is owner (form submission)
    if (isNew) {
      const formData = new FormData();
      formData.set("menu_slug", menuSlug);
      // Fire and forget — don't await
      registerScan(null, formData).catch(() => {});
    }

    // Track page_view
    const eventFormData = new FormData();
    eventFormData.set("event_type", "page_view");
    eventFormData.set("session_id", sessionId);
    eventFormData.set("business_id", businessId);
    trackEvent(null, eventFormData).catch(() => {});

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuSlug, businessId]);

  // Track category views (500ms debounce)
  useEffect(() => {
    if (!selectedCategoryId || !sessionRef.current) return;

    // Clear previous debounce
    if (categoryDebounceRef.current) {
      clearTimeout(categoryDebounceRef.current);
    }

    categoryDebounceRef.current = setTimeout(() => {
      const formData = new FormData();
      formData.set("event_type", "category_view");
      formData.set("session_id", sessionRef.current!.id);
      formData.set("business_id", businessId);
      formData.set("category_id", selectedCategoryId);
      trackEvent(null, formData).catch(() => {});
    }, 500);
  }, [selectedCategoryId, businessId]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (categoryDebounceRef.current) clearTimeout(categoryDebounceRef.current);
    };
  }, []);

  // Track exit on visibility change
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden" && sessionRef.current) {
        const duration = Math.round((Date.now() - lastEventTimeRef.current) / 1000);

        const formData = new FormData();
        formData.set("event_type", "exit");
        formData.set("session_id", sessionRef.current.id);
        formData.set("business_id", businessId);
        formData.set("duration_seconds", String(duration));
        trackEvent(null, formData).catch(() => {});

        lastEventTimeRef.current = Date.now();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [businessId]);

  // Expose trackProductClick for product click tracking
  const trackProductClick = useCallback(
    (productId: string) => {
      if (!sessionRef.current) return;

      const formData = new FormData();
      formData.set("event_type", "product_view");
      formData.set("session_id", sessionRef.current.id);
      formData.set("business_id", businessId);
      formData.set("category_id", selectedCategoryId ?? "");
      formData.set("product_id", productId);
      trackEvent(null, formData).catch(() => {});
    },
    [businessId, selectedCategoryId]
  );

  // Expose trackShare for share button
  const trackShare = useCallback(() => {
    if (!sessionRef.current) return;

    const formData = new FormData();
    formData.set("event_type", "share");
    formData.set("session_id", sessionRef.current.id);
    formData.set("business_id", businessId);
    trackEvent(null, formData).catch(() => {});
  }, [businessId]);

  return { trackShare, trackProductClick, sessionId: sessionRef.current?.id ?? null };
}