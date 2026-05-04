import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MenuFieldRow } from "./MenuFieldRow";

describe("MenuFieldRow", () => {
  it("renders label and children", () => {
    render(
      <MenuFieldRow label="Test Label">
        <div data-testid="child">Child Content</div>
      </MenuFieldRow>,
    );

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("uses column layout by default", () => {
    render(
      <MenuFieldRow label="Default Layout">
        <span>content</span>
      </MenuFieldRow>,
    );

    const row = screen.getByText("Default Layout").closest("div");
    expect(row).toHaveClass("flex-col");
  });

  it("uses row layout when specified", () => {
    render(
      <MenuFieldRow label="Row Layout" layout="row">
        <span>content</span>
      </MenuFieldRow>,
    );

    const row = screen.getByText("Row Layout").closest("div");
    expect(row).toHaveClass("flex-row");
  });
});
