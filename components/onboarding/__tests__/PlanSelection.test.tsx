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
    expect(screen.getByText("Plan Básico")).toBeInTheDocument();
    expect(screen.getByText("Plan Pro")).toBeInTheDocument();
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
    const basicHeading = screen.getByText("Plan Básico");
    const basicCard = basicHeading.closest("button");
    expect(basicCard).not.toBeNull();
    await user.click(basicCard!);
    expect(useOnboardingStore.getState().selectedPlan).toBe("basic");
  });

  it("shows monthly prices by default", () => {
    render(<PlanSelection />);
    expect(screen.getByText("$24.990")).toBeInTheDocument();
    expect(screen.getByText("$29.990")).toBeInTheDocument();
    expect(screen.getAllByText("/mes").length).toBe(2);
  });

  it("shows annual prices when billing cycle is annual", async () => {
    const user = userEvent.setup();
    render(<PlanSelection />);
    const annualToggle = screen.getByRole("button", { name: /Anual/ });
    await user.click(annualToggle);

    expect(screen.getByText("$254.990")).toBeInTheDocument();
    expect(screen.getByText("$305.990")).toBeInTheDocument();
    expect(screen.getAllByText("/año").length).toBe(2);
  });

  it("shows annual savings text when billing cycle is annual", async () => {
    const user = userEvent.setup();
    render(<PlanSelection />);
    const annualToggle = screen.getByRole("button", { name: /Anual/ });
    await user.click(annualToggle);

    const savingsTexts = screen.getAllByText(/Ahorras 15%/);
    expect(savingsTexts.length).toBe(2);
  });
});
