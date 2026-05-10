import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SubscriptionSettings from "@/components/settings/SubscriptionSettings";
import type { Database } from "@/types/database.types";

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

function makeSubscription(overrides: Partial<SubscriptionRow> = {}): SubscriptionRow {
  const now = new Date().toISOString();
  const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: "sub-1",
    user_id: "user-1",
    plan_type: "basic",
    billing_cycle: "monthly",
    status: "active",
    amount: 24990,
    mp_preapproval_id: "preapproval-123",
    mp_subscription_id: null,
    trial_ends_at: null,
    current_period_start: now,
    current_period_end: future,
    last_payment_date: null,
    next_billing_date: future,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

const mockUpgradePlan = vi.fn();
const mockInitiateRefund = vi.fn();
const mockCancelSubscription = vi.fn();
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();

vi.mock("@/actions/subscription.action", () => ({
  upgradePlan: (...args: unknown[]) => mockUpgradePlan(...args),
  initiateRefund: (...args: unknown[]) => mockInitiateRefund(...args),
  cancelSubscription: (...args: unknown[]) => mockCancelSubscription(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

describe("SubscriptionSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpgradePlan.mockResolvedValue({ success: true, message: "Plan actualizado", errors: {}, checkoutUrl: "https://checkout.test" });
    mockInitiateRefund.mockResolvedValue({ success: true, message: "Reembolso iniciado", errors: {} });
    mockCancelSubscription.mockResolvedValue({ success: true, message: "Suscripción cancelada", errors: {} });
  });

  it("renders active subscription with plan info", () => {
    render(<SubscriptionSettings subscription={makeSubscription()} />);
    expect(screen.getByText("Plan Básico Mensual")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("shows 'Upgrade to Pro' button when on basic and active", () => {
    render(<SubscriptionSettings subscription={makeSubscription({ plan_type: "basic", status: "active" })} />);
    expect(screen.getByRole("button", { name: /Upgrade a Pro/i })).toBeInTheDocument();
  });

  it("shows 'Downgrade to Basic' button when on pro and active", () => {
    render(<SubscriptionSettings subscription={makeSubscription({ plan_type: "pro", status: "active", amount: 29990 })} />);
    expect(screen.getByRole("button", { name: /Downgrade a Basic/i })).toBeInTheDocument();
  });

  it("does not show upgrade button when status is not active", () => {
    render(<SubscriptionSettings subscription={makeSubscription({ status: "cancelled" })} />);
    expect(screen.queryByRole("button", { name: /Upgrade a Pro/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Downgrade a Basic/i })).not.toBeInTheDocument();
  });

  it("shows 'Reembolso en progreso' badge for pending_refund", () => {
    render(<SubscriptionSettings subscription={makeSubscription({ status: "pending_refund" })} />);
    expect(screen.getByText("Reembolso en progreso")).toBeInTheDocument();
  });

  it("shows 'Reembolsado' badge for refunded", () => {
    render(<SubscriptionSettings subscription={makeSubscription({ status: "refunded" })} />);
    expect(screen.getByText("Reembolsado")).toBeInTheDocument();
  });

  it("shows chargeback warning banner for chargeback", () => {
    render(<SubscriptionSettings subscription={makeSubscription({ status: "chargeback" })} />);
    expect(screen.getByText(/Se detectó un contracargo/i)).toBeInTheDocument();
    expect(screen.getByText(/soporte@menually.app/i)).toBeInTheDocument();
  });

  it("shows 'Solicitar reembolso' button for active subscription", () => {
    render(<SubscriptionSettings subscription={makeSubscription({ status: "active" })} />);
    expect(screen.getByRole("button", { name: /Solicitar reembolso/i })).toBeInTheDocument();
  });

  it("hides cancel button for chargeback status", () => {
    render(<SubscriptionSettings subscription={makeSubscription({ status: "chargeback" })} />);
    expect(screen.queryByRole("button", { name: /Cancelar suscripción/i })).not.toBeInTheDocument();
  });

  it("hides cancel button for refunded status", () => {
    render(<SubscriptionSettings subscription={makeSubscription({ status: "refunded" })} />);
    expect(screen.queryByRole("button", { name: /Cancelar suscripción/i })).not.toBeInTheDocument();
  });

  it("calls upgradePlan when upgrade is confirmed", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("confirm", () => true);

    render(<SubscriptionSettings subscription={makeSubscription({ plan_type: "basic", status: "active" })} />);
    const upgradeButton = screen.getByRole("button", { name: /Upgrade a Pro/i });
    await user.click(upgradeButton);

    expect(mockUpgradePlan).toHaveBeenCalledWith("pro", "monthly");
    vi.unstubAllGlobals();
  });

  it("does not call upgradePlan when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("confirm", () => false);

    render(<SubscriptionSettings subscription={makeSubscription({ plan_type: "basic", status: "active" })} />);
    const upgradeButton = screen.getByRole("button", { name: /Upgrade a Pro/i });
    await user.click(upgradeButton);

    expect(mockUpgradePlan).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
