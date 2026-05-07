import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlanSelection from "@/components/onboarding/PlanSelection";
import { useOnboardingStore } from "@/store/useOnboardingStore";

describe("PlanSelection", () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it("renders both plan cards", () => {
    render(<PlanSelection />);
    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("renders billing cycle toggle", () => {
    render(<PlanSelection />);
    expect(screen.getByRole("button", { name: /Mensual/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Anual/ })).toBeInTheDocument();
  });

  it("renders trial callout", () => {
    render(<PlanSelection />);
    expect(screen.getByText(/30 días de prueba gratis/)).toBeInTheDocument();
  });

  it("renders Siguiente button disabled when no plan selected", () => {
    render(<PlanSelection />);
    const button = screen.getByRole("button", { name: "Siguiente" });
    expect(button).toBeDisabled();
  });

  it("enables Siguiente button when a plan is selected", async () => {
    const user = userEvent.setup();
    render(<PlanSelection />);
    const proCard = screen.getByRole("button", { name: /Pro/ });
    await user.click(proCard);
    const nextButton = screen.getByRole("button", { name: "Siguiente" });
    expect(nextButton).not.toBeDisabled();
  });

  it("calls nextStep when Siguiente is clicked after selecting a plan", async () => {
    const user = userEvent.setup();
    render(<PlanSelection />);
    const proCard = screen.getByRole("button", { name: /Pro/ });
    await user.click(proCard);
    const nextButton = screen.getByRole("button", { name: "Siguiente" });
    await user.click(nextButton);
    expect(useOnboardingStore.getState().step).toBe("redirecting");
  });

  it("toggles billing cycle to annual", async () => {
    const user = userEvent.setup();
    render(<PlanSelection />);
    const annualToggle = screen.getByRole("button", { name: /Anual/ });
    await user.click(annualToggle);
    expect(useOnboardingStore.getState().billingCycle).toBe("annual");
  });

  it("updates selected plan in store when card is clicked", async () => {
    const user = userEvent.setup();
    render(<PlanSelection />);
    const basicCard = screen.getByRole("button", { name: /Basic/ });
    await user.click(basicCard);
    expect(useOnboardingStore.getState().selectedPlan).toBe("basic");
  });
});
