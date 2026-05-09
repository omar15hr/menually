import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RedirectingScreen from "@/components/onboarding/RedirectingScreen";

describe("RedirectingScreen", () => {
  beforeEach(() => {
    vi.stubGlobal("location", { href: "" });
  });

  it("renders loading spinner", () => {
    render(<RedirectingScreen />);
    expect(screen.getByTestId("loader-spinner")).toBeInTheDocument();
  });

  it("renders redirecting message when checkoutUrl is provided", () => {
    render(<RedirectingScreen checkoutUrl="https://mp.com/checkout" />);
    expect(
      screen.getByText("Redirigiendo a Mercado Pago..."),
    ).toBeInTheDocument();
  });

  it("renders fallback message when no checkoutUrl is provided", () => {
    render(<RedirectingScreen />);
    expect(
      screen.getByText("Serás redirigido en un momento..."),
    ).toBeInTheDocument();
  });

  it("redirects to checkoutUrl when provided", () => {
    render(<RedirectingScreen checkoutUrl="https://mp.com/checkout" />);
    expect(window.location.href).toBe("https://mp.com/checkout");
  });

  it("shows retry button when no checkoutUrl is provided", () => {
    const onRetry = vi.fn();
    render(<RedirectingScreen onRetry={onRetry} />);
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<RedirectingScreen onRetry={onRetry} />);
    const retryButton = screen.getByRole("button", { name: "Reintentar" });
    await user.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
