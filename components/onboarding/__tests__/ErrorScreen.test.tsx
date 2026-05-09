import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorScreen from "@/components/onboarding/ErrorScreen";
import { useOnboardingStore } from "@/store/useOnboardingStore";

describe("ErrorScreen", () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it("renders warning icon", () => {
    useOnboardingStore.getState().setError("Pago rechazado");
    render(<ErrorScreen />);
    expect(screen.getByTestId("warning-icon")).toBeInTheDocument();
  });

  it("renders error message from store", () => {
    useOnboardingStore.getState().setError("Pago rechazado");
    render(<ErrorScreen />);
    expect(screen.getByText("Pago rechazado")).toBeInTheDocument();
  });

  it("renders Contactar soporte link", () => {
    useOnboardingStore.getState().setError("Error");
    render(<ErrorScreen />);
    const link = screen.getByRole("link", { name: "Contactar soporte" });
    expect(link).toHaveAttribute("href", "https://menually.cl/soporte");
  });
});
