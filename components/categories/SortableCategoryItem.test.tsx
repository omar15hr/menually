import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SortableCategoryItem from "./SortableCategoryItem";
import type { CategoryWithProducts } from "@/types/categories.types";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: { "aria-describedby": "sortable" },
    listeners: { onPointerDown: vi.fn() },
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

function makeCategory(overrides: Partial<CategoryWithProducts> = {}): CategoryWithProducts {
  return {
    id: "cat-1",
    menu_id: "menu-1",
    name: "Entradas",
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    products: [],
    ...overrides,
  };
}

describe("SortableCategoryItem", () => {
  it("renders category name", () => {
    render(
      <SortableCategoryItem
        category={makeCategory({ name: "Entradas" })}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText("Entradas")).toBeInTheDocument();
  });

  it("shows selected state when isSelected is true", () => {
    const { container } = render(
      <SortableCategoryItem
        category={makeCategory()}
        isSelected={true}
        onSelect={() => {}}
      />,
    );
    const button = container.querySelector("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onSelect with category id when clicked", () => {
    const onSelect = vi.fn();
    render(
      <SortableCategoryItem
        category={makeCategory({ id: "cat-2" })}
        isSelected={false}
        onSelect={onSelect}
      />,
    );
    screen.getByText("Entradas").click();
    expect(onSelect).toHaveBeenCalledWith("cat-2");
  });
});
