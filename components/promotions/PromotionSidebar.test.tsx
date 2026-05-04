import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PromotionSidebar } from "./PromotionSidebar";
import type { Promotion } from "@/types/promotions.types";
import type { Product } from "@/types/categories.types";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod-1",
    category_id: "cat-1",
    name: "Café",
    description: null,
    price: 2500,
    image_url: null,
    is_available: true,
    labels: null,
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function makePromotion(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: "p1",
    menu_id: "m1",
    title: "Summer Sale",
    description: null,
    keyword: "summer",
    image_url: null,
    product_ids: [],
    start_date: null,
    end_date: null,
    days_of_week: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as Promotion;
}

describe("PromotionSidebar", () => {
  it("renders overlay and sidebar when open", () => {
    render(
      <PromotionSidebar
        isOpen={true}
        promotion={null}
        products={[]}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByText("Nueva promoción")).toBeInTheDocument();
  });

  it("renders 'Editar promoción' when promotion is provided", () => {
    render(
      <PromotionSidebar
        isOpen={true}
        promotion={makePromotion()}
        products={[]}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByText("Editar promoción")).toBeInTheDocument();
  });

  it("does not render overlay when closed", () => {
    render(
      <PromotionSidebar
        isOpen={false}
        promotion={null}
        products={[]}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
  });

  it("calls onClose when X button is clicked", () => {
    const onClose = vi.fn();
    render(
      <PromotionSidebar
        isOpen={true}
        promotion={null}
        products={[]}
        onClose={onClose}
        onSuccess={vi.fn()}
      />,
    );

    const closeButton = screen.getByLabelText("Cerrar");
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when overlay is clicked", () => {
    const onClose = vi.fn();
    render(
      <PromotionSidebar
        isOpen={true}
        promotion={null}
        products={[]}
        onClose={onClose}
        onSuccess={vi.fn()}
      />,
    );

    const overlay = screen.getByRole("presentation");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
