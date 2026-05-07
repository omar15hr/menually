import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OnboardingPage from "@/app/onboarding/page";

describe("OnboardingPage", () => {
  it("renders without errors", () => {
    render(<OnboardingPage />);
    expect(screen.getByText("Plan")).toBeInTheDocument();
  });

  it("renders wizard progress indicators", () => {
    render(<OnboardingPage />);
    expect(screen.getByText("Pago")).toBeInTheDocument();
    expect(screen.getByText("¡Listo!")).toBeInTheDocument();
  });
});
