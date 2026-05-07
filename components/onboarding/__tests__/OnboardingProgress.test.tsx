import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";

describe("OnboardingProgress", () => {
  const steps = [
    { label: "Plan" },
    { label: "Pago" },
    { label: "¡Listo!" },
  ];

  it("renders 3 step indicators", () => {
    render(<OnboardingProgress currentStep={1} steps={steps} />);
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Pago")).toBeInTheDocument();
    expect(screen.getByText("¡Listo!")).toBeInTheDocument();
  });

  it("marks first step as active when currentStep is 1", () => {
    render(<OnboardingProgress currentStep={1} steps={steps} />);
    const indicators = screen.getAllByRole("listitem");
    expect(indicators[0]).toHaveAttribute("data-status", "active");
    expect(indicators[1]).toHaveAttribute("data-status", "pending");
    expect(indicators[2]).toHaveAttribute("data-status", "pending");
  });

  it("marks first as completed and second as active when currentStep is 2", () => {
    render(<OnboardingProgress currentStep={2} steps={steps} />);
    const indicators = screen.getAllByRole("listitem");
    expect(indicators[0]).toHaveAttribute("data-status", "completed");
    expect(indicators[1]).toHaveAttribute("data-status", "active");
    expect(indicators[2]).toHaveAttribute("data-status", "pending");
  });

  it("marks first two as completed and third as active when currentStep is 3", () => {
    render(<OnboardingProgress currentStep={3} steps={steps} />);
    const indicators = screen.getAllByRole("listitem");
    expect(indicators[0]).toHaveAttribute("data-status", "completed");
    expect(indicators[1]).toHaveAttribute("data-status", "completed");
    expect(indicators[2]).toHaveAttribute("data-status", "active");
  });

  it("renders checkmark for completed steps", () => {
    render(<OnboardingProgress currentStep={3} steps={steps} />);
    const checkmarks = screen.getAllByTestId("check-icon");
    expect(checkmarks).toHaveLength(2);
  });

  it("does not render checkmarks when currentStep is 1", () => {
    render(<OnboardingProgress currentStep={1} steps={steps} />);
    const checkmarks = screen.queryAllByTestId("check-icon");
    expect(checkmarks).toHaveLength(0);
  });
});
