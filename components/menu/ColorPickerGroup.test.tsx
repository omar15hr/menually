import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ColorPickerGroup } from "./ColorPickerGroup";

describe("ColorPickerGroup", () => {
  const colorFields = [
    { label: "Primario", field: "primary_color" as const },
    { label: "Texto", field: "text_color" as const },
  ];

  it("renders all color fields with labels", () => {
    render(
      <ColorPickerGroup
        colorFields={colorFields}
        values={{ primary_color: "#114821", text_color: "#FFFFFF" }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Colores")).toBeInTheDocument();
    expect(screen.getByText("Primario")).toBeInTheDocument();
    expect(screen.getByText("Texto")).toBeInTheDocument();
  });

  it("displays current color values", () => {
    render(
      <ColorPickerGroup
        colorFields={colorFields}
        values={{ primary_color: "#114821", text_color: "#FFFFFF" }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("#114821")).toBeInTheDocument();
    expect(screen.getByText("#FFFFFF")).toBeInTheDocument();
  });

  it("calls onChange when a color input changes", () => {
    const onChange = vi.fn();
    render(
      <ColorPickerGroup
        colorFields={colorFields}
        values={{ primary_color: "#114821", text_color: "#FFFFFF" }}
        onChange={onChange}
      />,
    );

    const inputs = screen.getAllByDisplayValue("#114821");
    fireEvent.change(inputs[0], { target: { value: "#FF0000" } });
    expect(onChange).toHaveBeenCalledWith("primary_color", "#ff0000");
  });
});
