import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import MenuWorkflow from "./MenuWorkflow";
import type { TranslationsMap } from "@/types/translations.types";

// ── Mocks ─────────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: ({ src, alt, className, ...props }: Record<string, unknown>) => (
    <img src={src as string} alt={alt as string} className={className as string} {...props} />
  ),
}));

const mockMenuPreviewProps: Record<string, unknown> = {};

vi.mock("@/components/menu/MenuPreview", () => ({
  MenuPreview: vi.fn((props: Record<string, unknown>) => {
    Object.assign(mockMenuPreviewProps, props);
    return <div data-testid="menu-preview-mock" />;
  }),
}));

vi.mock("@/components/menu/MenuEditTable", () => ({
  MenuEditTable: vi.fn(() => <div data-testid="menu-edit-table-mock" />),
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

vi.mock("@/store/useLanguageStore", () => ({
  useLanguageStore: vi.fn((selector?: (state: { language: string }) => unknown) => {
    const state = { language: "es" };
    return selector ? selector(state) : state;
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
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

const mockProfile = {
  id: "user-1",
  business_name: "Mi Restaurante",
  full_name: "Test User",
  email: "test@example.com",
  phone_number: null as string | null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ── Tests ─────────────────────────────────────────────────────────────

describe("MenuWorkflow", () => {
  beforeEach(() => {
    Object.keys(mockMenuPreviewProps).forEach(
      (key) => delete mockMenuPreviewProps[key],
    );
  });

  it("renders MenuPreview and MenuEditTable", () => {
    const { container } = render(
      <MenuWorkflow
        menu={makeMenu()}
        categories={mockCategories}
        profiles={mockProfile}
      />,
    );
    expect(container.querySelector('[data-testid="menu-preview-mock"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="menu-edit-table-mock"]')).toBeTruthy();
  });

  it("passes translations prop to MenuPreview when provided", () => {
    const translations: TranslationsMap = new Map();
    translations.set("category:cat-1:name", { en: "Starters" });

    render(
      <MenuWorkflow
        menu={makeMenu()}
        categories={mockCategories}
        profiles={mockProfile}
        translations={translations}
      />,
    );

    expect(mockMenuPreviewProps.translations).toBe(translations);
    expect(mockMenuPreviewProps.translations).toBeDefined();
  });

  it("translations is undefined when not provided", () => {
    render(
      <MenuWorkflow
        menu={makeMenu()}
        categories={mockCategories}
        profiles={mockProfile}
      />,
    );

    expect(mockMenuPreviewProps.translations).toBeUndefined();
  });

  it("passes showLanguageSelector={true} to MenuPreview", () => {
    render(
      <MenuWorkflow
        menu={makeMenu()}
        categories={mockCategories}
        profiles={mockProfile}
      />,
    );

    expect(mockMenuPreviewProps.showLanguageSelector).toBe(true);
  });

  it("passes categories and promotions to MenuPreview", () => {
    const promotions = [
      {
        id: "promo-1",
        title: "2x1",
        description: "Promo especial",
        menu_id: "menu-1",
        user_id: "user-1",
        business_id: "user-1",
        keyword: "2x1",
        image_url: null,
        product_ids: [],
        is_active: true,
        status: "active",
        position: 0,
        start_date: null,
        end_date: null,
        days_of_week: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    render(
      <MenuWorkflow
        menu={makeMenu()}
        categories={mockCategories}
        profiles={mockProfile}
        promotions={promotions}
      />,
    );

    expect(mockMenuPreviewProps.categories).toBe(mockCategories);
    expect(mockMenuPreviewProps.promotions).toBe(promotions);
  });

  it("passes businessName from profile to MenuPreview", () => {
    render(
      <MenuWorkflow
        menu={makeMenu()}
        categories={mockCategories}
        profiles={mockProfile}
      />,
    );

    expect(mockMenuPreviewProps.businessName).toBe("Mi Restaurante");
  });

  it("passes businessName as empty string when profile has no business_name", () => {
    render(
      <MenuWorkflow
        menu={makeMenu()}
        categories={mockCategories}
        profiles={{ ...mockProfile, business_name: "" }}
      />,
    );

    expect(mockMenuPreviewProps.businessName).toBe("");
  });

  it("passes logoUrlSelected and coverUrlSelected to MenuPreview", () => {
    const menu = makeMenu({
      logo_url: "https://example.com/logo.png",
      bg_image_url: "https://example.com/cover.jpg",
    });

    render(
      <MenuWorkflow
        menu={menu}
        categories={mockCategories}
        profiles={mockProfile}
      />,
    );

    expect(mockMenuPreviewProps.logoUrlSelected).toBe("https://example.com/logo.png");
    expect(mockMenuPreviewProps.coverUrlSelected).toBe("https://example.com/cover.jpg");
  });

  it("empty translations map is passed through correctly", () => {
    const emptyMap: TranslationsMap = new Map();

    render(
      <MenuWorkflow
        menu={makeMenu()}
        categories={mockCategories}
        profiles={mockProfile}
        translations={emptyMap}
      />,
    );

    expect(mockMenuPreviewProps.translations).toBe(emptyMap);
    expect((mockMenuPreviewProps.translations as TranslationsMap).size).toBe(0);
  });
});
