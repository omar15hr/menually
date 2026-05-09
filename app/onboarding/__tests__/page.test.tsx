import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import OnboardingPage from "@/app/onboarding/page";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe("OnboardingPage", () => {
  it("renders without errors", () => {
    render(<OnboardingPage />);
    expect(screen.getByText("Plan Básico")).toBeInTheDocument();
  });

  it("renders plan selection content", () => {
    render(<OnboardingPage />);
    expect(screen.getByText("Plan Pro")).toBeInTheDocument();
    expect(screen.getByText("Escoge el plan que quieres contratar")).toBeInTheDocument();
  });
});
