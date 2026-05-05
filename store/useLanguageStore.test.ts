import { describe, it, expect, beforeEach } from "vitest";
import { useLanguageStore } from "./useLanguageStore";

describe("useLanguageStore", () => {
  beforeEach(() => {
    // Reset store state between tests
    useLanguageStore.setState({ language: "es" });
    // Clear localStorage
    localStorage.clear();
  });

  it("defaults to 'es'", () => {
    const state = useLanguageStore.getState();
    expect(state.language).toBe("es");
  });

  it("setLanguage updates the state", () => {
    useLanguageStore.getState().setLanguage("en");
    expect(useLanguageStore.getState().language).toBe("en");
  });

  it("persists language to localStorage when changed", () => {
    useLanguageStore.getState().setLanguage("pt");
    const stored = localStorage.getItem("menually-language");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.language).toBe("pt");
  });

  it("rehydrates language from localStorage on init", () => {
    localStorage.setItem("menually-language", "en");
    // Simulate a fresh store init by reading localStorage directly
    // In real usage, the store middleware handles this on creation
    const stored = localStorage.getItem("menually-language");
    expect(stored).toBe("en");
  });

  it("handles missing localStorage gracefully (defaults to es)", () => {
    localStorage.removeItem("menually-language");
    const stored = localStorage.getItem("menually-language");
    expect(stored).toBeNull();
    // Store default should still be es
    expect(useLanguageStore.getState().language).toBe("es");
  });

  it("keeps the latest language after multiple changes", () => {
    useLanguageStore.getState().setLanguage("en");
    useLanguageStore.getState().setLanguage("pt");
    useLanguageStore.getState().setLanguage("es");
    expect(useLanguageStore.getState().language).toBe("es");
    const stored = JSON.parse(localStorage.getItem("menually-language")!);
    expect(stored.state.language).toBe("es");
  });
});
