import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MenuLayoutSelector } from "./MenuLayoutSelector";

describe("MenuLayoutSelector", () => {
  it("renders horizontal and vertical options", () => {
    render(
      <MenuLayoutSelector value="horizontal" onChange={vi.fn()} />,
    );

    expect(screen.getByText("Horizontal")).toBeInTheDocument();
    expect(screen.getByText("Vertical")).toBeInTheDocument();
  });

  it("marks the selected layout as active", () => {
    render(
      <MenuLayoutSelector value="vertical" onChange={vi.fn()} />,
    );

    const verticalButton = screen.getByText("Vertical").closest("button");
    expect(verticalButton).toHaveClass("border-[#114821]");

    const horizontalButton = screen.getByText("Horizontal").closest("button");
    expect(horizontalButton).toHaveClass("border-[#E4E4E6]");
  });

  it("calls onChange when a layout is clicked", () => {
    const onChange = vi.fn();
    render(
      <MenuLayoutSelector value="horizontal" onChange={onChange} />,
    );

    fireEvent.click(screen.getByText("Vertical"));
    expect(onChange).toHaveBeenCalledWith("vertical");

    fireEvent.click(screen.getByText("Horizontal"));
    expect(onChange).toHaveBeenCalledWith("horizontal");
  });
});
