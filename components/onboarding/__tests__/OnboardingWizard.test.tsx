import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { useOnboardingStore } from "@/store/useOnboardingStore";

describe("OnboardingWizard", () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it("renders PlanSelection when step is plan", () => {
    render(<OnboardingWizard />);
    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
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
    expect(screen.getByText("¡Tu suscripción está activa!")).toBeInTheDocument();
  });

  it("renders ErrorScreen when step is error", () => {
    useOnboardingStore.getState().setError("Pago rechazado");
    useOnboardingStore.getState().goToStep("error");
    render(<OnboardingWizard />);
    expect(screen.getByText("Pago rechazado")).toBeInTheDocument();
  });

  it("renders progress bar", () => {
    render(<OnboardingWizard />);
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Pago")).toBeInTheDocument();
    expect(screen.getByText("¡Listo!")).toBeInTheDocument();
  });

  it("hides Volver button on plan step", () => {
    render(<OnboardingWizard />);
    const nav = screen.getByTestId("wizard-nav");
    expect(
      within(nav).queryByRole("button", { name: "Volver" }),
    ).not.toBeInTheDocument();
  });

  it("shows Volver button on redirecting step", () => {
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().nextStep();
    render(<OnboardingWizard />);
    const nav = screen.getByTestId("wizard-nav");
    expect(
      within(nav).getByRole("button", { name: "Volver" }),
    ).toBeInTheDocument();
  });

  it("shows Siguiente button on plan step in nav", () => {
    render(<OnboardingWizard />);
    const nav = screen.getByTestId("wizard-nav");
    expect(
      within(nav).getByRole("button", { name: "Siguiente" }),
    ).toBeInTheDocument();
  });

  it("shows no right button on redirecting step in nav", () => {
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().nextStep();
    render(<OnboardingWizard />);
    const nav = screen.getByTestId("wizard-nav");
    expect(
      within(nav).queryByRole("button", { name: "Siguiente" }),
    ).not.toBeInTheDocument();
    expect(
      within(nav).queryByRole("button", { name: "Ir al dashboard" }),
    ).not.toBeInTheDocument();
    expect(
      within(nav).queryByRole("button", { name: "Reintentar" }),
    ).not.toBeInTheDocument();
  });

  it("shows Ir al dashboard link on success step in nav", () => {
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().nextStep();
    useOnboardingStore.getState().nextStep();
    render(<OnboardingWizard />);
    const nav = screen.getByTestId("wizard-nav");
    expect(
      within(nav).getByRole("link", { name: "Ir al dashboard" }),
    ).toBeInTheDocument();
  });

  it("shows Reintentar button on error step in nav", () => {
    useOnboardingStore.getState().setError("Error");
    useOnboardingStore.getState().goToStep("error");
    render(<OnboardingWizard />);
    const nav = screen.getByTestId("wizard-nav");
    expect(
      within(nav).getByRole("button", { name: "Reintentar" }),
    ).toBeInTheDocument();
  });

  it("Volver calls prevStep when clicked", async () => {
    const user = userEvent.setup();
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().nextStep();
    render(<OnboardingWizard />);
    const nav = screen.getByTestId("wizard-nav");
    const backButton = within(nav).getByRole("button", { name: "Volver" });
    await user.click(backButton);
    expect(useOnboardingStore.getState().step).toBe("plan");
  });
});
