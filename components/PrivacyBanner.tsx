"use client";

import { useState } from "react";
import { getAnalyticsConsent, setAnalyticsConsent } from "@/lib/analytics/session";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PrivacyBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    return !getAnalyticsConsent();
  });

  function dismiss() {
    setAnalyticsConsent();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0F172A]/95 backdrop-blur-sm text-white px-4 py-3 flex items-center justify-between gap-4">
      <p className="text-sm flex-1">
        We use cookies to improve your experience.{" "}
        <a
          href="https://www.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#CDF545] transition-colors"
        >
          Learn more
        </a>
      </p>
      <button
        onClick={dismiss}
        className={cn(
          "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full",
          "bg-[#CDF545] text-[#114821] hover:bg-[#b8e07a] transition-colors",
          "flex-shrink-0"
        )}
      >
        Accept
      </button>
      <button
        onClick={dismiss}
        className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}