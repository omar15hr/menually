import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MenuPreview } from "./MenuPreview";
import { PublicMenu } from "./PublicMenu";

// ── Mocks ─────────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
    ...props
  }: {
    src: string;
    alt: string;
    className?: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} className={className} {...props} />,
}));

vi.mock("@/store/useMenuStore", () => ({
  useMenuStore: vi.fn((selector) =>
    selector({
      setCategories: vi.fn(),
      selectCategory: vi.fn(),
      selectedCategoryId: null,
    }),
  ),
}));

vi.mock("@/hooks/useMenuTracking", () => ({
  useMenuTracking: vi.fn(() => ({
    trackShare: vi.fn(),
    trackProductClick: vi.fn(),
  })),
}));

vi.mock("@/hooks/useCategoryHydration", () => ({
  useCategoryHydration: vi.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────

function makeMenu(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "menu-1",
    user_id: "user-1",
    name: "Test Menu",
    slug: "test-menu",
    typography: "inter",
    bg_color: "#FFFFFF",
    text_color: "#000000",
    description_color: "#666666",
    price_color: "#000000",
    primary_color: "#2563EB",
    layout_card: "horizontal",
    image_product_shape: "rounded",
    show_filters: false,
    show_descriptions: true,
    show_price: true,
    bg_image_url: null,
    logo_url: null,
    position: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

const mockCategories = [
  {
    id: "cat-1",
    name: "Entradas",
    menu_id: "menu-1",
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    products: [],
  },
];

// ── Tests: MenuPreview ────────────────────────────────────────────────

describe("MenuPreview", () => {
  it("default (no responsive prop) renders fixed 344x800 dimensions", () => {
    const menu = makeMenu();
    const { container } = render(
      <MenuPreview menu={menu} categories={mockCategories} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe("344px");
    expect(wrapper.style.height).toBe("800px");
  });

  it("responsive={true} renders full-viewport dimensions", () => {
    const menu = makeMenu();
    const { container } = render(
      <MenuPreview menu={menu} categories={mockCategories} responsive={true} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe("100%");
    expect(wrapper.style.height).toBe("100dvh");
  });

  it("default has decorative classes (rounded-2xl, border, p-2, my-10, mx-auto)", () => {
    const menu = makeMenu();
    const { container } = render(
      <MenuPreview menu={menu} categories={mockCategories} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains("rounded-2xl")).toBe(true);
    expect(wrapper.classList.contains("border")).toBe(true);
    expect(wrapper.classList.contains("p-2")).toBe(true);
    expect(wrapper.classList.contains("my-10")).toBe(true);
    expect(wrapper.classList.contains("mx-auto")).toBe(true);
  });

  it("responsive={true} has no decorative chrome", () => {
    const menu = makeMenu();
    const { container } = render(
      <MenuPreview menu={menu} categories={mockCategories} responsive={true} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains("rounded-2xl")).toBe(false);
    expect(wrapper.classList.contains("border")).toBe(false);
    expect(wrapper.classList.contains("p-2")).toBe(false);
    expect(wrapper.classList.contains("my-10")).toBe(false);
    expect(wrapper.classList.contains("mx-auto")).toBe(false);
  });

  it("cover image has rounded-2xl when not responsive", () => {
    const menu = makeMenu({ bg_image_url: "https://example.com/cover.jpg" });
    const { container } = render(
      <MenuPreview menu={menu} categories={mockCategories} />,
    );
    const coverImg = container.querySelector('img[alt="Portada del menú"]');
    expect(coverImg?.classList.contains("rounded-2xl")).toBe(true);
  });

  it("cover image has NO rounded-2xl when responsive", () => {
    const menu = makeMenu({ bg_image_url: "https://example.com/cover.jpg" });
    const { container } = render(
      <MenuPreview menu={menu} categories={mockCategories} responsive={true} />,
    );
    const coverImg = container.querySelector('img[alt="Portada del menú"]');
    expect(coverImg?.classList.contains("rounded-2xl")).toBe(false);
  });
});

// ── Tests: PublicMenu ─────────────────────────────────────────────────

describe("PublicMenu", () => {
  it("renders MenuPreview with responsive={true}", () => {
    const menu = makeMenu();
    const { container } = render(
      <PublicMenu menu={menu} categories={mockCategories} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe("100%");
    expect(wrapper.style.height).toBe("100dvh");
  });
});
