import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlanSelection from "@/components/onboarding/PlanSelection";
import { useOnboardingStore } from "@/store/useOnboardingStore";

describe("PlanSelection", () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it("renders both plan cards", () => {
    render(<PlanSelection />);
    expect(screen.getByText("Plan Básico")).toBeInTheDocument();
    expect(screen.getByText("Plan Pro")).toBeInTheDocument();
  });

  it("renders billing cycle toggle", () => {
    render(<PlanSelection />);
    expect(screen.getByRole("button", { name: /Mensual/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Anual/ })).toBeInTheDocument();
  });

  it("renders trial callout", () => {
    render(<PlanSelection />);
    expect(screen.getByText(/14 días de prueba gratis\. Cancelá cuando quieras/)).toBeInTheDocument();
  });

  it("shows trial badge on Pro plan card", () => {
    render(<PlanSelection />);
    const proCard = screen.getByText("Plan Pro").closest("button");
    expect(proCard).not.toBeNull();
    expect(proCard!.textContent).toContain("14 días de prueba gratis");
  });

  it("does not show trial badge on Basic plan card", () => {
    render(<PlanSelection />);
    const basicCard = screen.getByText("Plan Básico").closest("button");
    expect(basicCard).not.toBeNull();
    expect(basicCard!.textContent).not.toContain("14 días de prueba gratis");
  });

  it("toggles billing cycle to annual", async () => {
    const user = userEvent.setup();
    render(<PlanSelection />);
    const annualToggle = screen.getByRole("button", { name: /Anual/ });
    await user.click(annualToggle);
    expect(useOnboardingStore.getState().billingCycle).toBe("annual");
  });

  it("updates selected plan in store when card is clicked", async () => {
    const user = userEvent.setup();
    render(<PlanSelection />);
    const basicHeading = screen.getByText("Plan Básico");
    const basicCard = basicHeading.closest("button");
    expect(basicCard).not.toBeNull();
    await user.click(basicCard!);
    expect(useOnboardingStore.getState().selectedPlan).toBe("basic");
  });

  it("shows monthly prices by default", () => {
    render(<PlanSelection />);
    expect(screen.getByText("$24.990")).toBeInTheDocument();
    expect(screen.getByText("$29.990")).toBeInTheDocument();
    expect(screen.getAllByText("/mes").length).toBe(2);
  });

  it("shows annual prices when billing cycle is annual", async () => {
    const user = userEvent.setup();
    render(<PlanSelection />);
    const annualToggle = screen.getByRole("button", { name: /Anual/ });
    await user.click(annualToggle);

    expect(screen.getByText("$254.990")).toBeInTheDocument();
    expect(screen.getByText("$305.990")).toBeInTheDocument();
    expect(screen.getAllByText("/año").length).toBe(2);
  });

  it("shows annual savings text when billing cycle is annual", async () => {
    const user = userEvent.setup();
    render(<PlanSelection />);
    const annualToggle = screen.getByRole("button", { name: /Anual/ });
    await user.click(annualToggle);

    const savingsTexts = screen.getAllByText(/Ahorras 15%/);
    expect(savingsTexts.length).toBe(2);
  });

  it("renders Mercado Pago logo", () => {
    render(<PlanSelection />);
    expect(screen.getByAltText("Mercado Pago")).toBeInTheDocument();
  });

  it("renders 'Pagos seguros con Mercado Pago' text", () => {
    render(<PlanSelection />);
    expect(screen.getByText(/Pagos seguros con Mercado Pago/)).toBeInTheDocument();
  });

  it("renders payment method icons", () => {
    render(<PlanSelection />);
    expect(screen.getByAltText("Visa")).toBeInTheDocument();
    expect(screen.getByAltText("Mastercard")).toBeInTheDocument();
    expect(screen.getByAltText("American Express")).toBeInTheDocument();
  });

  it("shows 'Plan actual' badge when currentPlan is basic", () => {
    render(<PlanSelection currentPlan="basic" />);
    expect(screen.getByText("Plan actual")).toBeInTheDocument();
  });

  it("shows 'Plan actual' badge when currentPlan is pro", () => {
    render(<PlanSelection currentPlan="pro" />);
    expect(screen.getByText("Plan actual")).toBeInTheDocument();
  });

  it("does not show 'Plan actual' badge when no currentPlan", () => {
    render(<PlanSelection />);
    expect(screen.queryByText("Plan actual")).not.toBeInTheDocument();
  });
});
