import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MenuVisibilitySection } from "./MenuVisibilitySection";

describe("MenuVisibilitySection", () => {
  const fields = [
    { label: "Mostrar precio", field: "show_price" as const },
    { label: "Mostrar descripciones", field: "show_descriptions" as const },
    { label: "Mostrar filtros", field: "show_filters" as const },
  ];

  it("renders all visibility fields with labels", () => {
    render(
      <MenuVisibilitySection
        fields={fields}
        values={{ show_price: true, show_descriptions: false, show_filters: true }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Visibilidad")).toBeInTheDocument();
    expect(screen.getByText("Mostrar precio")).toBeInTheDocument();
    expect(screen.getByText("Mostrar descripciones")).toBeInTheDocument();
    expect(screen.getByText("Mostrar filtros")).toBeInTheDocument();
  });

  it("renders toggles with correct initial state", () => {
    render(
      <MenuVisibilitySection
        fields={fields}
        values={{ show_price: true, show_descriptions: false, show_filters: true }}
        onChange={vi.fn()}
      />,
    );

    const toggles = screen.getAllByRole("switch");
    expect(toggles).toHaveLength(3);
    expect(toggles[0]).toHaveAttribute("aria-checked", "true");
    expect(toggles[1]).toHaveAttribute("aria-checked", "false");
    expect(toggles[2]).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange when a toggle is clicked", () => {
    const onChange = vi.fn();
    render(
      <MenuVisibilitySection
        fields={fields}
        values={{ show_price: true, show_descriptions: false, show_filters: true }}
        onChange={onChange}
      />,
    );

    const toggles = screen.getAllByRole("switch");
    fireEvent.click(toggles[1]);
    expect(onChange).toHaveBeenCalledWith("show_descriptions", true);
  });
});
