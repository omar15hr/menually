import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("renders Reintentar button", () => {
    useOnboardingStore.getState().setError("Error");
    render(<ErrorScreen />);
    expect(
      screen.getByRole("button", { name: "Reintentar" }),
    ).toBeInTheDocument();
  });

  it("calls reset when Reintentar is clicked", async () => {
    const user = userEvent.setup();
    useOnboardingStore.getState().setError("Error");
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().setBillingCycle("annual");
    render(<ErrorScreen />);
    const retryButton = screen.getByRole("button", { name: "Reintentar" });
    await user.click(retryButton);
    expect(useOnboardingStore.getState().step).toBe("plan");
    expect(useOnboardingStore.getState().selectedPlan).toBeNull();
    expect(useOnboardingStore.getState().error).toBeNull();
  });

  it("renders Contactar soporte link", () => {
    useOnboardingStore.getState().setError("Error");
    render(<ErrorScreen />);
    const link = screen.getByRole("link", { name: "Contactar soporte" });
    expect(link).toHaveAttribute("href", "https://menually.cl/soporte");
  });
});
