import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";

describe("OnboardingProgress", () => {
  it("renders progress bar with 25% width at step 1", () => {
    render(<OnboardingProgress currentStep={1} totalSteps={2} />);
    const fill = screen.getByTestId("progress-fill");
    expect(fill).toHaveStyle("width: 25%");
  });

  it("renders progress bar with 100% width at step 2", () => {
    render(<OnboardingProgress currentStep={2} totalSteps={2} />);
    const fill = screen.getByTestId("progress-fill");
    expect(fill).toHaveStyle("width: 100%");
  });

  it('renders "Paso 1 de 2" counter text at step 1', () => {
    render(<OnboardingProgress currentStep={1} totalSteps={2} />);
    expect(screen.getByText("Paso 1 de 2")).toBeInTheDocument();
  });

  it('renders "Paso 2 de 2" counter text at step 2', () => {
    render(<OnboardingProgress currentStep={2} totalSteps={2} />);
    expect(screen.getByText("Paso 2 de 2")).toBeInTheDocument();
  });

  it("shows Siguiente button when showNext and onNext are provided", () => {
    render(
      <OnboardingProgress
        currentStep={1}
        totalSteps={2}
        showNext
        onNext={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Siguiente" }),
    ).toBeInTheDocument();
  });

  it("hides Siguiente button when showNext is false", () => {
    render(<OnboardingProgress currentStep={1} totalSteps={2} />);
    expect(
      screen.queryByRole("button", { name: "Siguiente" }),
    ).not.toBeInTheDocument();
  });

  it("hides Siguiente button when onNext is not provided", () => {
    render(<OnboardingProgress currentStep={1} totalSteps={2} showNext />);
    expect(
      screen.queryByRole("button", { name: "Siguiente" }),
    ).not.toBeInTheDocument();
  });

  it("shows Volver button when showBack and onBack are provided", () => {
    render(
      <OnboardingProgress
        currentStep={2}
        totalSteps={2}
        showBack
        onBack={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Volver" }),
    ).toBeInTheDocument();
  });

  it("hides Volver button when showBack is false", () => {
    render(<OnboardingProgress currentStep={2} totalSteps={2} />);
    expect(
      screen.queryByRole("button", { name: "Volver" }),
    ).not.toBeInTheDocument();
  });

  it("hides Volver button when onBack is not provided", () => {
    render(<OnboardingProgress currentStep={2} totalSteps={2} showBack />);
    expect(
      screen.queryByRole("button", { name: "Volver" }),
    ).not.toBeInTheDocument();
  });

  it("disables Siguiente button when nextDisabled is true", () => {
    render(
      <OnboardingProgress
        currentStep={1}
        totalSteps={2}
        showNext
        onNext={vi.fn()}
        nextDisabled
      />,
    );
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
  });

  it("renders action button as link when actionHref is provided", () => {
    render(
      <OnboardingProgress
        currentStep={2}
        totalSteps={2}
        actionLabel="Ir al dashboard"
        actionHref="/dashboard"
      />,
    );
    const link = screen.getByRole("link", { name: "Ir al dashboard" });
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("fires onAction callback when action button is clicked", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <OnboardingProgress
        currentStep={2}
        totalSteps={2}
        actionLabel="Reintentar"
        onAction={onAction}
      />,
    );
    const button = screen.getByRole("button", { name: "Reintentar" });
    await user.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("has correct accessibility attributes on progress bar", () => {
    render(<OnboardingProgress currentStep={1} totalSteps={2} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "1");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "2");
  });

  it("fires onNext when Siguiente is clicked", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(
      <OnboardingProgress
        currentStep={1}
        totalSteps={2}
        showNext
        onNext={onNext}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("fires onBack when Volver is clicked", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(
      <OnboardingProgress
        currentStep={2}
        totalSteps={2}
        showBack
        onBack={onBack}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Volver" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
