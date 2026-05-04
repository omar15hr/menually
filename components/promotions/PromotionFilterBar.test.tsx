import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PromotionFilterBar } from "./PromotionFilterBar";
import type { FilterStatus } from "@/lib/promotions";

const filterButtons: { label: string; value: FilterStatus }[] = [
  { label: "Todas (4)", value: "all" },
  { label: "Programadas (1)", value: "scheduled" },
  { label: "Vencidas (1)", value: "expired" },
  { label: "Pausadas (1)", value: "paused" },
];

describe("PromotionFilterBar", () => {
  it("renders filter buttons with labels", () => {
    render(
      <PromotionFilterBar
        filterButtons={filterButtons}
        activeFilter="all"
        onFilterChange={vi.fn()}
        searchValue=""
        onSearchChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Todas (4)")).toBeInTheDocument();
    expect(screen.getByText("Programadas (1)")).toBeInTheDocument();
    expect(screen.getByText("Vencidas (1)")).toBeInTheDocument();
    expect(screen.getByText("Pausadas (1)")).toBeInTheDocument();
  });

  it("highlights active filter button", () => {
    render(
      <PromotionFilterBar
        filterButtons={filterButtons}
        activeFilter="scheduled"
        onFilterChange={vi.fn()}
        searchValue=""
        onSearchChange={vi.fn()}
      />,
    );

    const activeButton = screen.getByText("Programadas (1)");
    expect(activeButton).toHaveClass("bg-[#F5FDDA]");
  });

  it("calls onFilterChange when a filter button is clicked", () => {
    const onFilterChange = vi.fn();
    render(
      <PromotionFilterBar
        filterButtons={filterButtons}
        activeFilter="all"
        onFilterChange={onFilterChange}
        searchValue=""
        onSearchChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Programadas (1)"));
    expect(onFilterChange).toHaveBeenCalledWith("scheduled");
  });

  it("renders search input with current value", () => {
    render(
      <PromotionFilterBar
        filterButtons={filterButtons}
        activeFilter="all"
        onFilterChange={vi.fn()}
        searchValue="summer"
        onSearchChange={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText("Buscar promoción...") as HTMLInputElement;
    expect(input.value).toBe("summer");
  });

  it("calls onSearchChange when search input changes", () => {
    const onSearchChange = vi.fn();
    render(
      <PromotionFilterBar
        filterButtons={filterButtons}
        activeFilter="all"
        onFilterChange={vi.fn()}
        searchValue=""
        onSearchChange={onSearchChange}
      />,
    );

    const input = screen.getByPlaceholderText("Buscar promoción...");
    fireEvent.change(input, { target: { value: "sale" } });
    expect(onSearchChange).toHaveBeenCalledWith("sale");
  });
});
