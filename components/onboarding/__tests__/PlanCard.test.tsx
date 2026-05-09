import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlanCard from "@/components/onboarding/PlanCard";

describe("PlanCard", () => {
  const defaultProps = {
    name: "Plan Básico",
    price: 24990,
    annualPrice: 254990,
    currency: "CLP",
    features: ["1 menú digital", "QR personalizado"],
    billingCycle: "monthly" as const,
    isRecommended: false,
    isSelected: false,
    onSelect: vi.fn(),
  };

  it("renders plan name", () => {
    render(<PlanCard {...defaultProps} />);
    expect(screen.getByText("Plan Básico")).toBeInTheDocument();
  });

  it("renders monthly price correctly", () => {
    render(<PlanCard {...defaultProps} />);
    expect(screen.getByText("$24.990")).toBeInTheDocument();
    expect(screen.getByText("/mes")).toBeInTheDocument();
  });

  it("renders annual price correctly", () => {
    render(<PlanCard {...defaultProps} billingCycle="annual" />);
    expect(screen.getByText("$254.990")).toBeInTheDocument();
    expect(screen.getByText("/año")).toBeInTheDocument();
  });

  it("renders feature list", () => {
    render(<PlanCard {...defaultProps} />);
    expect(screen.getByText("1 menú digital")).toBeInTheDocument();
    expect(screen.getByText("QR personalizado")).toBeInTheDocument();
  });

  it("renders recommended badge when isRecommended is true", () => {
    render(<PlanCard {...defaultProps} isRecommended />);
    expect(screen.getByText("Recomendado")).toBeInTheDocument();
  });

  it("does not render recommended badge when isRecommended is false", () => {
    render(<PlanCard {...defaultProps} />);
    expect(screen.queryByText("Recomendado")).not.toBeInTheDocument();
  });

  it("calls onSelect when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<PlanCard {...defaultProps} onSelect={onSelect} />);
    const card = screen.getByRole("button");
    await user.click(card);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("has selected styling when isSelected is true", () => {
    render(<PlanCard {...defaultProps} isSelected />);
    const card = screen.getByRole("button");
    expect(card).toHaveAttribute("data-selected", "true");
  });

  it("does not have selected styling when isSelected is false", () => {
    render(<PlanCard {...defaultProps} />);
    const card = screen.getByRole("button");
    expect(card).toHaveAttribute("data-selected", "false");
  });

  it("renders annual savings text when billingCycle is annual", () => {
    render(<PlanCard {...defaultProps} billingCycle="annual" />);
    expect(screen.getByText(/Ahorras 15%/)).toBeInTheDocument();
  });

  it("does not render annual savings text when billingCycle is monthly", () => {
    render(<PlanCard {...defaultProps} billingCycle="monthly" />);
    expect(screen.queryByText(/Ahorras 15%/)).not.toBeInTheDocument();
  });
});
