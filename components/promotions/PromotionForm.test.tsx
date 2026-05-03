import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PromotionActionResult } from "@/types/promotions.types";

// ── Controlled state for useActionState mock ──────────────────────────

let mockState: PromotionActionResult = {
  success: false,
  message: "",
  errors: {},
};
let mockPending = false;

// ── Mocks (hoisted) ───────────────────────────────────────────────────

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/actions/promotion.action", () => ({
  createPromotion: vi.fn(),
  updatePromotion: vi.fn(),
}));

vi.mock("@/actions/uploadImageToStorage.action", () => ({
  uploadImageToStorage: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => <img src={src} alt={alt} className={className} />,
}));

// Mock useActionState to return our controlled state
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: vi.fn(() => [mockState, vi.fn(), mockPending]),
  };
});

// ── Import AFTER mocks ────────────────────────────────────────────────

import { PromotionForm } from "./PromotionForm";
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

function resetState() {
  mockState = {
    success: false,
    message: "",
    errors: {},
  };
  mockPending = false;
}

// ── Tests ──────────────────────────────────────────────────────────────

describe("PromotionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetState();
  });

  it("renders step 1 with title input and product checklist", () => {
    const products = [
      makeProduct({ id: "p1", name: "Café" }),
      makeProduct({ id: "p2", name: "Té" }),
    ];

    render(
      <PromotionForm
        products={products}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText("Ej: Dos cafés por $3.990")).toBeInTheDocument();
    expect(screen.getByText("Café")).toBeInTheDocument();
    expect(screen.getByText("Té")).toBeInTheDocument();
    expect(screen.getByText("Continuar")).toBeInTheDocument();
  });

  it("advances to step 2 when clicking Continuar", async () => {
    const products = [makeProduct({ id: "p1", name: "Café" })];

    render(
      <PromotionForm
        products={products}
        onClose={vi.fn()}
      />,
    );

    // Select a product first (required to proceed past validation)
    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    fireEvent.click(screen.getByText("Continuar"));

    expect(screen.getByText("Imagen del banner")).toBeInTheDocument();
    expect(screen.getByText("Sube una imagen")).toBeInTheDocument();
  });

  it("advances to step 3 when clicking Continuar from step 2", async () => {
    const products = [makeProduct({ id: "p1", name: "Café" })];

    render(
      <PromotionForm
        products={products}
        onClose={vi.fn()}
      />,
    );

    // Step 1 -> Step 2
    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    fireEvent.click(screen.getByText("Continuar"));

    // Step 2 -> Step 3
    fireEvent.click(screen.getByText("Continuar"));

    expect(screen.getByText("Definir periodo de tiempo")).toBeInTheDocument();
    expect(screen.getByText("Resumen")).toBeInTheDocument();
  });

  it("shows step 3 directly when promotion is provided for editing", () => {
    const products = [makeProduct({ id: "p1", name: "Café" })];

    render(
      <PromotionForm
        promotion={{
          id: "promo-1",
          title: "Promo Test",
          description: null,
          keyword: "test",
          image_url: null,
          product_ids: ["p1"],
          start_date: null,
          end_date: null,
          days_of_week: [],
          is_active: true,
          menu_id: "menu-1",
          business_id: "biz-1",
          user_id: "user-1",
          position: 0,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }}
        products={products}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Definir periodo de tiempo")).toBeInTheDocument();
    expect(screen.getByText("Resumen")).toBeInTheDocument();
    expect(screen.getByText("Guardar cambios")).toBeInTheDocument();
  });

  it("goes back to previous step when clicking Volver", async () => {
    const products = [makeProduct({ id: "p1", name: "Café" })];

    render(
      <PromotionForm
        products={products}
        onClose={vi.fn()}
      />,
    );

    // Advance to step 2
    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    fireEvent.click(screen.getByText("Continuar"));

    expect(screen.getByText("Imagen del banner")).toBeInTheDocument();

    // Go back
    fireEvent.click(screen.getByText("Volver"));

    expect(screen.getByPlaceholderText("Ej: Dos cafés por $3.990")).toBeInTheDocument();
  });

  it("calls onClose when clicking Cerrar on step 1", () => {
    const onClose = vi.fn();
    const products = [makeProduct({ id: "p1", name: "Café" })];

    render(
      <PromotionForm
        products={products}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("Cerrar"));
    expect(onClose).toHaveBeenCalled();
  });
});
