import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RedirectingScreen from "@/components/onboarding/RedirectingScreen";

describe("RedirectingScreen", () => {
  it("renders loading spinner", () => {
    render(<RedirectingScreen />);
    expect(screen.getByTestId("loader-spinner")).toBeInTheDocument();
  });

  it("renders redirecting message", () => {
    render(<RedirectingScreen />);
    expect(
      screen.getByText("Redirigiendo a Mercado Pago..."),
    ).toBeInTheDocument();
  });
});
