import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlanCard from "@/components/onboarding/PlanCard";

describe("PlanCard", () => {
  const defaultProps = {
    name: "Basic",
    price: 24990,
    currency: "CLP",
    features: ["1 menú digital", "QR personalizado"],
    billingCycle: "monthly" as const,
    isRecommended: false,
    isSelected: false,
    onSelect: vi.fn(),
  };

  it("renders plan name", () => {
    render(<PlanCard {...defaultProps} />);
    expect(screen.getByText("Basic")).toBeInTheDocument();
  });

  it("renders monthly price correctly", () => {
    render(<PlanCard {...defaultProps} />);
    expect(screen.getByText(/24\.990/)).toBeInTheDocument();
    expect(screen.getByText("/mes")).toBeInTheDocument();
  });

  it("renders annual price correctly", () => {
    render(<PlanCard {...defaultProps} billingCycle="annual" />);
    expect(screen.getByText(/299\.880/)).toBeInTheDocument();
    expect(screen.getByText("/año")).toBeInTheDocument();
  });

  it("renders feature list", () => {
    render(<PlanCard {...defaultProps} />);
    expect(screen.getByText("1 menú digital")).toBeInTheDocument();
    expect(screen.getByText("QR personalizado")).toBeInTheDocument();
  });

  it("renders trial badge", () => {
    render(<PlanCard {...defaultProps} />);
    expect(screen.getByText("Prueba gratis")).toBeInTheDocument();
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
});
