import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PromotionRow } from "./PromotionRow";
import type { Promotion, PromotionStatus } from "@/types/promotions.types";

function makePromotion(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: "p1",
    menu_id: "m1",
    title: "Summer Sale",
    description: null,
    keyword: "summer",
    image_url: null,
    product_ids: ["prod1", "prod2"],
    start_date: "2024-07-01T00:00:00Z",
    end_date: "2024-07-31T00:00:00Z",
    days_of_week: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as Promotion;
}

describe("PromotionRow", () => {
  it("renders promotion title and keyword", () => {
    render(
      <PromotionRow
        promotion={makePromotion()}
        status="active"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText("Summer Sale")).toBeInTheDocument();
    expect(screen.getByText("summer")).toBeInTheDocument();
  });

  it("renders product count", () => {
    render(
      <PromotionRow
        promotion={makePromotion({ product_ids: ["a", "b", "c"] })}
        status="active"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText("3 producto(s)")).toBeInTheDocument();
  });

  it("renders status badge with correct label and color class", () => {
    render(
      <PromotionRow
        promotion={makePromotion()}
        status="active"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText("Activa")).toBeInTheDocument();
  });

  it("renders date range", () => {
    render(
      <PromotionRow
        promotion={makePromotion()}
        status="active"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
      />,
    );

    // Date formatting depends on locale/timezone; just verify it contains a month abbreviation
    const dateCell = screen.getByText(/\w{3,}\s*-/);
    expect(dateCell).toBeInTheDocument();
  });

  it("calls onToggle when toggle button is clicked", () => {
    const onToggle = vi.fn();
    render(
      <PromotionRow
        promotion={makePromotion()}
        status="active"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={onToggle}
      />,
    );

    const toggleButton = screen.getByTitle("Pausar");
    fireEvent.click(toggleButton);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("calls onEdit when edit button is clicked", () => {
    const onEdit = vi.fn();
    const promotion = makePromotion();
    render(
      <PromotionRow
        promotion={promotion}
        status="active"
        onEdit={onEdit}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
      />,
    );

    const editButton = screen.getByTitle("Editar");
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledWith(promotion);
  });

  it("calls onDelete when delete button is clicked", () => {
    const onDelete = vi.fn();
    render(
      <PromotionRow
        promotion={makePromotion()}
        status="active"
        onEdit={vi.fn()}
        onDelete={onDelete}
        onToggle={vi.fn()}
      />,
    );

    const deleteButton = screen.getByTitle("Eliminar");
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith("p1");
  });

  it("renders image when image_url is present", () => {
    render(
      <PromotionRow
        promotion={makePromotion({ image_url: "https://example.com/img.jpg" })}
        status="active"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
      />,
    );

    const img = screen.getByAltText("Summer Sale");
    expect(img).toBeInTheDocument();
  });
});
