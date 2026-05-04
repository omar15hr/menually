import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MenuShapeSelector } from "./MenuShapeSelector";

describe("MenuShapeSelector", () => {
  it("renders all three shape options", () => {
    render(
      <MenuShapeSelector value="square" onChange={vi.fn()} />,
    );

    expect(screen.getByText("Cuadrada")).toBeInTheDocument();
    expect(screen.getByText("Redondeada")).toBeInTheDocument();
    expect(screen.getByText("Circular")).toBeInTheDocument();
  });

  it("marks the selected shape as active", () => {
    render(
      <MenuShapeSelector value="circle" onChange={vi.fn()} />,
    );

    const circleButton = screen.getByText("Circular").closest("button");
    expect(circleButton).toHaveClass("border-[#114821]");

    const squareButton = screen.getByText("Cuadrada").closest("button");
    expect(squareButton).toHaveClass("border-[#E4E4E6]");
  });

  it("calls onChange when a shape is clicked", () => {
    const onChange = vi.fn();
    render(
      <MenuShapeSelector value="square" onChange={onChange} />,
    );

    fireEvent.click(screen.getByText("Redondeada"));
    expect(onChange).toHaveBeenCalledWith("rounded");

    fireEvent.click(screen.getByText("Circular"));
    expect(onChange).toHaveBeenCalledWith("circle");
  });
});
