// Types
interface MenuSession {
  sessionId: string;
  timestamp: number;
  menuSlug: string;
}

// Constants
const SESSION_KEY = "menu_session";
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const CONSENT_KEY = "analytics_consent";

/**
 * Retrieves a valid session for the given menu slug.
 * Returns null if no session exists, is expired, or belongs to a different menu.
 */
export function getSession(menuSlug: string): MenuSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session: MenuSession = JSON.parse(raw);
    const isExpired = Date.now() - session.timestamp > SESSION_TTL_MS;
    const isDifferentMenu = session.menuSlug !== menuSlug;

    if (isExpired || isDifferentMenu) return null;

    return session;
  } catch {
    return null;
  }
}

/**
 * Stores a new session in localStorage.
 */
export function setSession(menuSlug: string, sessionId: string): void {
  if (typeof window === "undefined") return;

  const session: MenuSession = {
    sessionId,
    timestamp: Date.now(),
    menuSlug,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Returns true if user has dismissed the privacy banner.
 */
export function getAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return true;

  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

/**
 * Stores the user's privacy consent decision.
 */
export function setAnalyticsConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, "accepted");
}
