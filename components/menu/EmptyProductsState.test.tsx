import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyProductsState } from "./EmptyProductsState";

describe("EmptyProductsState", () => {
  it("renders empty state message", () => {
    render(<EmptyProductsState />);
    expect(screen.getByText(/Aún no hay productos/)).toBeInTheDocument();
    expect(screen.getByText(/en esta categoría./)).toBeInTheDocument();
  });

  it("renders the empty box icon", () => {
    const { container } = render(<EmptyProductsState />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
