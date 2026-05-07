import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SuccessScreen from "@/components/onboarding/SuccessScreen";
import { useOnboardingStore } from "@/store/useOnboardingStore";

describe("SuccessScreen", () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it("renders checkmark icon", () => {
    render(<SuccessScreen />);
    expect(screen.getByTestId("success-checkmark")).toBeInTheDocument();
  });

  it("renders plan name from store", () => {
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().setBillingCycle("monthly");
    render(<SuccessScreen />);
    expect(screen.getByText(/Pro/)).toBeInTheDocument();
  });

  it("renders price for monthly billing", () => {
    useOnboardingStore.getState().setSelectedPlan("basic");
    useOnboardingStore.getState().setBillingCycle("monthly");
    render(<SuccessScreen />);
    expect(screen.getByText(/24\.990/)).toBeInTheDocument();
  });

  it("renders price for annual billing", () => {
    useOnboardingStore.getState().setSelectedPlan("basic");
    useOnboardingStore.getState().setBillingCycle("annual");
    render(<SuccessScreen />);
    expect(screen.getByText(/299\.880/)).toBeInTheDocument();
  });

  it("renders Ir al dashboard link pointing to /dashboard", () => {
    render(<SuccessScreen />);
    const link = screen.getByRole("link", { name: "Ir al dashboard" });
    expect(link).toHaveAttribute("href", "/dashboard");
  });
});
