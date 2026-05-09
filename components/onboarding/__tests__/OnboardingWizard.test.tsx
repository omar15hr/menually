import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { useOnboardingStore } from "@/store/useOnboardingStore";

const mockCreateSubscription = vi.fn();
const mockHandlePreapprovalCallback = vi.fn();

vi.mock("@/actions/subscription.action", () => ({
  createSubscription: (...args: unknown[]) => mockCreateSubscription(...args),
  handlePreapprovalCallback: (...args: unknown[]) => mockHandlePreapprovalCallback(...args),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe("OnboardingWizard", () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
    mockCreateSubscription.mockClear();
    mockHandlePreapprovalCallback.mockClear();
    vi.stubGlobal("location", { href: "" });
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
      screen.getByText("Serás redirigido en un momento..."),
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

  it("shows Continuar button on plan step", () => {
    render(<OnboardingWizard />);
    expect(
      screen.getByRole("button", { name: "Continuar" }),
    ).toBeInTheDocument();
  });

  it("shows Reintentar button on redirecting step when no checkoutUrl", () => {
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().nextStep();
    render(<OnboardingWizard />);
    expect(
      screen.queryByRole("button", { name: "Continuar" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Ir al dashboard" }),
    ).not.toBeInTheDocument();
    // Reintentar button appears because no checkoutUrl (redirect failed or not yet started)
    expect(
      screen.getByRole("button", { name: "Reintentar" }),
    ).toBeInTheDocument();
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

  it("calls createSubscription when Continuar is clicked with a plan selected", async () => {
    const user = userEvent.setup();
    mockCreateSubscription.mockResolvedValue({
      success: true,
      message: "Suscripción creada",
      errors: {},
      checkoutUrl: "https://mp.com/checkout",
    });

    render(<OnboardingWizard />);
    const proCard = screen.getByRole("button", { name: /Plan Pro/ });
    await user.click(proCard);

    const nextButton = screen.getByRole("button", { name: "Continuar" });
    await user.click(nextButton);

    await waitFor(() => {
      expect(mockCreateSubscription).toHaveBeenCalledTimes(1);
    });
    expect(mockCreateSubscription).toHaveBeenCalledWith("pro", "monthly");
  });

  it("redirects to checkoutUrl on successful subscription creation", async () => {
    const user = userEvent.setup();
    mockCreateSubscription.mockResolvedValue({
      success: true,
      message: "Suscripción creada",
      errors: {},
      checkoutUrl: "https://mp.com/checkout",
    });

    render(<OnboardingWizard />);
    const proCard = screen.getByRole("button", { name: /Plan Pro/ });
    await user.click(proCard);

    const nextButton = screen.getByRole("button", { name: "Continuar" });
    await user.click(nextButton);

    await waitFor(() => {
      expect(window.location.href).toBe("https://mp.com/checkout");
    });
  });

  it("shows error step when subscription creation fails", async () => {
    const user = userEvent.setup();
    mockCreateSubscription.mockResolvedValue({
      success: false,
      message: "Error al crear suscripción",
      errors: {},
    });

    render(<OnboardingWizard />);
    const proCard = screen.getByRole("button", { name: /Plan Pro/ });
    await user.click(proCard);

    const nextButton = screen.getByRole("button", { name: "Continuar" });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("Error al crear suscripción")).toBeInTheDocument();
    });
  });

  it("disables Continuar button while subscription is pending", async () => {
    const user = userEvent.setup();
    let resolveSubscription: (value: unknown) => void;
    const subscriptionPromise = new Promise((resolve) => {
      resolveSubscription = resolve;
    });
    mockCreateSubscription.mockReturnValue(subscriptionPromise);

    render(<OnboardingWizard />);
    const proCard = screen.getByRole("button", { name: /Plan Pro/ });
    await user.click(proCard);

    const nextButton = screen.getByRole("button", { name: "Continuar" });
    await user.click(nextButton);

    expect(nextButton).toBeDisabled();

    resolveSubscription!({
      success: true,
      message: "Suscripción creada",
      errors: {},
      checkoutUrl: "https://mp.com/checkout",
    });
  });
});
