import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromotionStep1BasicInfo } from "./PromotionStep1BasicInfo";
import type { PromotionFormData } from "./types";
import type { Product } from "@/types/categories.types";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod-1",
    category_id: "cat-1",
    name: "Café",
    description: null,
    price: 2500,
    image_url: null,
    is_available: true,
    labels: null,
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeFormData(overrides: Partial<PromotionFormData> = {}): PromotionFormData {
  return {
    title: "Promo Verano",
    description: "Desc",
    keyword: "verano",
    image_url: "",
    product_ids: [],
    start_date: "",
    end_date: "",
    days_of_week: [],
    is_active: true,
    has_date_range: false,
    has_day_filter: false,
    ...overrides,
  };
}

describe("PromotionStep1BasicInfo", () => {
  it("renders title, description, keyword inputs with correct values", () => {
    const formData = makeFormData({
      title: "Dos cafés",
      description: "Válido todo el día",
      keyword: "café",
    });

    render(
      <PromotionStep1BasicInfo
        formData={formData}
        updateField={vi.fn()}
        products={[]}
        selectedProducts={new Set()}
        toggleProduct={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Dos cafés")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Válido todo el día")).toBeInTheDocument();
    expect(screen.getByDisplayValue("café")).toBeInTheDocument();
  });

  it("renders product checklist with names and prices", () => {
    const products = [
      makeProduct({ id: "p1", name: "Café", price: 2500 }),
      makeProduct({ id: "p2", name: "Té", price: 1800 }),
    ];

    render(
      <PromotionStep1BasicInfo
        formData={makeFormData()}
        updateField={vi.fn()}
        products={products}
        selectedProducts={new Set()}
        toggleProduct={vi.fn()}
      />,
    );

    expect(screen.getByText("Café")).toBeInTheDocument();
    expect(screen.getByText("Té")).toBeInTheDocument();
    expect(screen.getByText("$2.500")).toBeInTheDocument();
    expect(screen.getByText("$1.800")).toBeInTheDocument();
  });

  it("shows empty message when no products available", () => {
    render(
      <PromotionStep1BasicInfo
        formData={makeFormData()}
        updateField={vi.fn()}
        products={[]}
        selectedProducts={new Set()}
        toggleProduct={vi.fn()}
      />,
    );

    expect(screen.getByText("No hay productos disponibles")).toBeInTheDocument();
  });

  it("checks selected products", () => {
    const products = [
      makeProduct({ id: "p1", name: "Café" }),
      makeProduct({ id: "p2", name: "Té" }),
    ];

    render(
      <PromotionStep1BasicInfo
        formData={makeFormData()}
        updateField={vi.fn()}
        products={products}
        selectedProducts={new Set(["p1"])}
        toggleProduct={vi.fn()}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it("calls updateField when title input changes", () => {
    const updateField = vi.fn();
    render(
      <PromotionStep1BasicInfo
        formData={makeFormData({ title: "" })}
        updateField={updateField}
        products={[]}
        selectedProducts={new Set()}
        toggleProduct={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText("Ej: Dos cafés por $3.990");
    fireEvent.change(input, { target: { value: "Nuevo título" } });

    expect(updateField).toHaveBeenCalledWith("title", "Nuevo título");
  });

  it("calls toggleProduct when checkbox is clicked", async () => {
    const toggleProduct = vi.fn();
    const products = [makeProduct({ id: "p1", name: "Café" })];

    render(
      <PromotionStep1BasicInfo
        formData={makeFormData()}
        updateField={vi.fn()}
        products={products}
        selectedProducts={new Set()}
        toggleProduct={toggleProduct}
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    expect(toggleProduct).toHaveBeenCalledWith("p1");
  });
});
