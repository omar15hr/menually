import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PromotionTable } from "./PromotionTable";
import type { Promotion, PromotionStatus } from "@/types/promotions.types";
import type { FilterStatus } from "@/lib/promotions";

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

describe("PromotionTable", () => {
  it("renders empty state when no promotions", () => {
    render(
      <PromotionTable
        promotions={[]}
        statusMap={new Map()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        activeFilter="all"
      />,
    );

    expect(screen.getByText("No hay promociones aún")).toBeInTheDocument();
  });

  it("renders empty state with filter label when filter is active", () => {
    render(
      <PromotionTable
        promotions={[]}
        statusMap={new Map()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        activeFilter="paused"
      />,
    );

    expect(
      screen.getByText(/No hay promociones con estado "Pausada"/),
    ).toBeInTheDocument();
  });

  it("renders table with promotion rows", () => {
    const promotions = [
      makePromotion({ id: "p1", title: "Promo 1" }),
      makePromotion({ id: "p2", title: "Promo 2" }),
    ];
    const statusMap = new Map<string, PromotionStatus>([
      ["p1", "active"],
      ["p2", "scheduled"],
    ]);

    render(
      <PromotionTable
        promotions={promotions}
        statusMap={statusMap}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        activeFilter="all"
      />,
    );

    expect(screen.getByText("Promo 1")).toBeInTheDocument();
    expect(screen.getByText("Promo 2")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(
      <PromotionTable
        promotions={[makePromotion()]}
        statusMap={new Map([["p1", "active"]])}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        activeFilter="all"
      />,
    );

    expect(screen.getByText("Promoción")).toBeInTheDocument();
    expect(screen.getByText("Palabra clave")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getByText("Vigencia")).toBeInTheDocument();
    expect(screen.getByText("Disponibilidad")).toBeInTheDocument();
    expect(screen.getByText("Acciones")).toBeInTheDocument();
  });

  it("renders pagination when promotions exist", () => {
    render(
      <PromotionTable
        promotions={[makePromotion()]}
        statusMap={new Map([["p1", "active"]])}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
        activeFilter="all"
      />,
    );

    expect(screen.getByText("Anterior")).toBeInTheDocument();
    expect(screen.getByText("Siguiente")).toBeInTheDocument();
  });

  it("passes callbacks to PromotionRow", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onToggle = vi.fn();
    const promotion = makePromotion({ id: "p1" });

    render(
      <PromotionTable
        promotions={[promotion]}
        statusMap={new Map([["p1", "active"]])}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        activeFilter="all"
      />,
    );

    const editButton = screen.getByTitle("Editar");
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledWith(promotion);
  });
});
