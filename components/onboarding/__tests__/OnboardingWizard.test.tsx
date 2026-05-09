import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { useOnboardingStore } from "@/store/useOnboardingStore";

describe("OnboardingWizard", () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it("renders PlanSelection when step is plan", () => {
    render(<OnboardingWizard />);
    expect(screen.getByText("Plan Básico")).toBeInTheDocument();
    expect(screen.getByText("Plan Pro")).toBeInTheDocument();
  });

  it("renders RedirectingScreen when step is redirecting", () => {
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().nextStep();
    render(<OnboardingWizard />);
    expect(
      screen.getByText("Redirigiendo a Mercado Pago..."),
    ).toBeInTheDocument();
  });

  it("renders SuccessScreen when step is success", () => {
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().nextStep();
    useOnboardingStore.getState().nextStep();
    render(<OnboardingWizard />);
    expect(
      screen.getByText("¡Tu suscripción está activa!"),
    ).toBeInTheDocument();
  });

  it("renders ErrorScreen when step is error", () => {
    useOnboardingStore.getState().setError("Pago rechazado");
    useOnboardingStore.getState().goToStep("error");
    render(<OnboardingWizard />);
    expect(screen.getByText("Pago rechazado")).toBeInTheDocument();
  });

  it("renders progress bar with step counter", () => {
    render(<OnboardingWizard />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText("Paso 1 de 2")).toBeInTheDocument();
  });

  it("hides Volver button on plan step", () => {
    render(<OnboardingWizard />);
    expect(
      screen.queryByRole("button", { name: "Volver" }),
    ).not.toBeInTheDocument();
  });

  it("shows Volver button on redirecting step", () => {
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().nextStep();
    render(<OnboardingWizard />);
    expect(
      screen.getByRole("button", { name: "Volver" }),
    ).toBeInTheDocument();
  });

  it("shows Siguiente button on plan step", () => {
    render(<OnboardingWizard />);
    expect(
      screen.getByRole("button", { name: "Siguiente" }),
    ).toBeInTheDocument();
  });

  it("shows no action buttons on redirecting step", () => {
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().nextStep();
    render(<OnboardingWizard />);
    expect(
      screen.queryByRole("button", { name: "Siguiente" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Ir al dashboard" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reintentar" }),
    ).not.toBeInTheDocument();
  });

  it("shows Ir al dashboard link on success step", () => {
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().nextStep();
    useOnboardingStore.getState().nextStep();
    render(<OnboardingWizard />);
    expect(
      screen.getByRole("link", { name: "Ir al dashboard" }),
    ).toBeInTheDocument();
  });

  it("shows Reintentar button on error step", () => {
    useOnboardingStore.getState().setError("Error");
    useOnboardingStore.getState().goToStep("error");
    render(<OnboardingWizard />);
    expect(
      screen.getByRole("button", { name: "Reintentar" }),
    ).toBeInTheDocument();
  });

  it("Volver calls prevStep when clicked", async () => {
    const user = userEvent.setup();
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().nextStep();
    render(<OnboardingWizard />);
    const backButton = screen.getByRole("button", { name: "Volver" });
    await user.click(backButton);
    expect(useOnboardingStore.getState().step).toBe("plan");
  });
});
