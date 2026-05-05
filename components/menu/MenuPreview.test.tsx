import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MenuPreview } from "./MenuPreview";
import { PublicMenu } from "./PublicMenu";
import { useLanguageStore } from "@/store/useLanguageStore";

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

vi.mock("@/store/useLanguageStore", () => ({
  useLanguageStore: vi.fn((selector?: (state: { language: string; setLanguage: () => void }) => unknown) => {
    const state = { language: "es", setLanguage: vi.fn() };
    return selector ? selector(state) : state;
  }),
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

  it("share overlay renders inside cover when onShare provided and responsive=true", async () => {
    const menu = makeMenu();
    const onShare = vi.fn();
    const { container } = render(
      <MenuPreview
        menu={menu}
        categories={mockCategories}
        responsive={true}
        onShare={onShare}
      />,
    );
    const coverDiv = container.querySelector("div[style=\"height: 190px;\"]");
    const shareButton = coverDiv?.querySelector('button[aria-label="Compartir menú"]');
    expect(shareButton).toBeTruthy();
    if (shareButton) {
      await userEvent.click(shareButton);
      expect(onShare).toHaveBeenCalledTimes(1);
    }
  });

  it("share overlay absent when onShare undefined", () => {
    const menu = makeMenu();
    const { container } = render(
      <MenuPreview menu={menu} categories={mockCategories} responsive={true} />,
    );
    const coverDiv = container.querySelector("div[style=\"height: 190px;\"]");
    const shareButton = coverDiv?.querySelector('button[aria-label="Compartir menú"]');
    expect(shareButton).toBeFalsy();
  });

  it("share overlay absent when responsive=false even if onShare provided", () => {
    const menu = makeMenu();
    const onShare = vi.fn();
    const { container } = render(
      <MenuPreview
        menu={menu}
        categories={mockCategories}
        responsive={false}
        onShare={onShare}
      />,
    );
    const coverDiv = container.querySelector("div[style=\"height: 190px;\"]");
    const shareButton = coverDiv?.querySelector('button[aria-label="Compartir menú"]');
    expect(shareButton).toBeFalsy();
  });

  it("language overlay renders inside cover when show_filters=true and responsive=true", () => {
    const menu = makeMenu({ show_filters: true });
    const { container } = render(
      <MenuPreview menu={menu} categories={mockCategories} responsive={true} />,
    );
    const coverDiv = container.querySelector("div[style=\"height: 190px;\"]");
    const langButton = coverDiv?.querySelector('button[aria-label="Cambiar idioma"]');
    expect(langButton).toBeTruthy();
    expect(langButton?.textContent).toContain("Español");
  });

  it("language overlay absent when show_filters=false (responsive, no showLanguageSelector)", () => {
    const menu = makeMenu({ show_filters: false });
    const { container } = render(
      <MenuPreview menu={menu} categories={mockCategories} responsive={true} />,
    );
    const coverDiv = container.querySelector("div[style=\"height: 190px;\"]");
    const langButton = coverDiv?.querySelector('button[aria-label="Cambiar idioma"]');
    expect(langButton).toBeFalsy();
  });

  it("language overlay absent when responsive=false even if show_filters=true", () => {
    const menu = makeMenu({ show_filters: true });
    const { container } = render(
      <MenuPreview menu={menu} categories={mockCategories} responsive={false} />,
    );
    const coverDiv = container.querySelector("div[style=\"height: 190px;\"]");
    const langButton = coverDiv?.querySelector('button[aria-label="Cambiar idioma"]');
    expect(langButton).toBeFalsy();
  });

  it("'Filtrar' button renders in business-name row when responsive=true", () => {
    const menu = makeMenu();
    const { container } = render(
      <MenuPreview menu={menu} categories={mockCategories} responsive={true} />,
    );
    const filtrarButton = screen.getByText("Filtrar");
    expect(filtrarButton).toBeInTheDocument();
    expect(filtrarButton.tagName).toBe("BUTTON");
  });

  it("'Filtrar' button absent when responsive=false", () => {
    const menu = makeMenu();
    const { container } = render(
      <MenuPreview menu={menu} categories={mockCategories} responsive={false} />,
    );
    const filtrarButton = screen.queryByText("Filtrar");
    expect(filtrarButton).not.toBeInTheDocument();
  });

  it("no share button in business-name row when onShare provided", () => {
    const menu = makeMenu();
    const onShare = vi.fn();
    render(
      <MenuPreview
        menu={menu}
        categories={mockCategories}
        responsive={true}
        onShare={onShare}
      />,
    );
    const shareButton = screen.queryByTitle("Share menu");
    expect(shareButton).not.toBeInTheDocument();
  });

  it("no language button in business-name row when show_filters=true", () => {
    const menu = makeMenu({ show_filters: true });
    render(
      <MenuPreview menu={menu} categories={mockCategories} responsive={true} />,
    );
    const langButton = screen.queryByText("Español");
    // Only the overlay has Español, the old inline button is gone
    // We verify there's no button with "Español" outside the cover
    const allLangButtons = screen.queryAllByText("Español");
    // There should be exactly 1 (the overlay inside cover)
    expect(allLangButtons).toHaveLength(1);
  });

  it("language selector renders when showLanguageSelector=true even if show_filters=false", () => {
    const menu = makeMenu({ show_filters: false });
    const { container } = render(
      <MenuPreview
        menu={menu}
        categories={mockCategories}
        responsive={false}
        showLanguageSelector={true}
      />,
    );
    const coverDiv = container.querySelector("div[style=\"height: 190px;\"]");
    const langButton = coverDiv?.querySelector('button[aria-label="Cambiar idioma"]');
    expect(langButton).toBeTruthy();
  });

  it("renders translated content when translations map provided and language is en", () => {
    (useLanguageStore as any).mockImplementation((selector?: (state: { language: string }) => unknown) => {
      const state = { language: "en", setLanguage: vi.fn() };
      return selector ? selector(state) : state;
    });

    const categories = [
      {
        id: "cat-1",
        name: "Entradas",
        menu_id: "menu-1",
        position: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        products: [
          {
            id: "prod-1",
            name: "Empanada",
            description: "Rica empanada",
            price: 100,
            category_id: "cat-1",
            image_url: null,
            is_available: true,
            labels: null,
            position: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      },
    ];

    const translations: import("@/types/translations.types").TranslationsMap = new Map();
    translations.set("category:cat-1:name", { en: "Starters" });
    translations.set("product:prod-1:name", { en: "Meat Pie" });
    translations.set("product:prod-1:description", { en: "Tasty pastry" });

    render(
      <MenuPreview
        menu={makeMenu()}
        categories={categories}
        translations={translations}
        responsive={true}
      />,
    );

    expect(screen.getByText("Starters")).toBeInTheDocument();
    expect(screen.getByText("Meat Pie")).toBeInTheDocument();
    expect(screen.getByText("Tasty pastry")).toBeInTheDocument();
  });

  it("renders 'Filter' when language is en", () => {
    (useLanguageStore as any).mockImplementation((selector?: (state: { language: string }) => unknown) => {
      const state = { language: "en", setLanguage: vi.fn() };
      return selector ? selector(state) : state;
    });

    render(
      <MenuPreview menu={makeMenu()} categories={mockCategories} responsive={true} />,
    );
    expect(screen.getByText("Filter")).toBeInTheDocument();
  });

  it("falls back to Spanish when translation is missing for a field", () => {
    (useLanguageStore as any).mockImplementation((selector?: (state: { language: string }) => unknown) => {
      const state = { language: "en", setLanguage: vi.fn() };
      return selector ? selector(state) : state;
    });

    const categories = [
      {
        id: "cat-1",
        name: "Entradas",
        menu_id: "menu-1",
        position: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        products: [
          {
            id: "prod-1",
            name: "Empanada",
            description: "Rica empanada",
            price: 100,
            category_id: "cat-1",
            image_url: null,
            is_available: true,
            labels: null,
            position: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      },
    ];

    const translations: import("@/types/translations.types").TranslationsMap = new Map();
    translations.set("category:cat-1:name", { en: "Starters" });
    // No product translations

    render(
      <MenuPreview
        menu={makeMenu()}
        categories={categories}
        translations={translations}
        responsive={true}
      />,
    );

    expect(screen.getByText("Starters")).toBeInTheDocument();
    expect(screen.getByText("Empanada")).toBeInTheDocument();
    expect(screen.getByText("Rica empanada")).toBeInTheDocument();
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

  it("language selector renders when showLanguageSelector=true even with responsive=true and show_filters=false", () => {
    const menu = makeMenu({ show_filters: false });
    render(
      <MenuPreview
        menu={menu}
        categories={mockCategories}
        responsive={true}
        showLanguageSelector={true}
      />,
    );
    const langButton = screen.getByRole("button", { name: /Cambiar idioma|Change language|Mudar idioma/i });
    expect(langButton).toBeInTheDocument();
  });

  it("page wrapper constrains PublicMenu to max-w-md mx-auto", () => {
    const menu = makeMenu();
    const { container } = render(
      <div className="max-w-md mx-auto">
        <PublicMenu menu={menu} categories={mockCategories} />
      </div>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains("max-w-md")).toBe(true);
    expect(wrapper.classList.contains("mx-auto")).toBe(true);
  });

 // ── Tests: PublicMenu + Translations integration ─────────────────────

 describe("PublicMenu with translations", () => {
    it("renders LanguageSelector even when show_filters is false", () => {
      const menu = makeMenu({ show_filters: false });
      render(
        <PublicMenu menu={menu} categories={mockCategories} />,
      );
      const langButton = screen.getByRole("button", { name: /Cambiar idioma|Change language|Mudar idioma/i });
      expect(langButton).toBeInTheDocument();
    });

    it("renders LanguageSelector when show_filters is true", () => {
      const menu = makeMenu({ show_filters: true });
      render(
        <PublicMenu menu={menu} categories={mockCategories} />,
      );
      const langButton = screen.getByRole("button", { name: /Cambiar idioma|Change language|Mudar idioma/i });
      expect(langButton).toBeInTheDocument();
    });

   it("passes translations to MenuPreview and applies them", () => {
     (useLanguageStore as any).mockImplementation((selector?: (state: { language: string }) => unknown) => {
       const state = { language: "en", setLanguage: vi.fn() };
       return selector ? selector(state) : state;
     });

     const categories = [
       {
         id: "cat-1",
         name: "Entradas",
         menu_id: "menu-1",
         position: 0,
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString(),
         products: [
           {
             id: "prod-1",
             name: "Empanada",
             description: "Rica empanada",
             price: 100,
             category_id: "cat-1",
             image_url: null,
             is_available: true,
             labels: null,
             position: 0,
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString(),
           },
         ],
       },
     ];

     const translations: import("@/types/translations.types").TranslationsMap = new Map();
     translations.set("category:cat-1:name", { en: "Starters" });
     translations.set("product:prod-1:name", { en: "Meat Pie" });
     translations.set("product:prod-1:description", { en: "Tasty pastry" });

     render(
       <PublicMenu
         menu={makeMenu()}
         categories={categories}
         translations={translations}
       />,
     );

     expect(screen.getByText("Starters")).toBeInTheDocument();
     expect(screen.getByText("Meat Pie")).toBeInTheDocument();
     expect(screen.getByText("Tasty pastry")).toBeInTheDocument();
   });

   it("falls back to Spanish content when translations map is provided but no translations exist for a language", () => {
     (useLanguageStore as any).mockImplementation((selector?: (state: { language: string }) => unknown) => {
       const state = { language: "pt", setLanguage: vi.fn() };
       return selector ? selector(state) : state;
     });

     const categories = [
       {
         id: "cat-1",
         name: "Entradas",
         menu_id: "menu-1",
         position: 0,
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString(),
         products: [
           {
             id: "prod-1",
             name: "Empanada",
             description: "Rica empanada",
             price: 100,
             category_id: "cat-1",
             image_url: null,
             is_available: true,
             labels: null,
             position: 0,
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString(),
           },
         ],
       },
     ];

     // Only English translations exist, no Portuguese
     const translations: import("@/types/translations.types").TranslationsMap = new Map();
     translations.set("category:cat-1:name", { en: "Starters" });
     translations.set("product:prod-1:name", { en: "Meat Pie" });

     render(
       <PublicMenu
         menu={makeMenu()}
         categories={categories}
         translations={translations}
       />,
     );

     // Falls back to Spanish because no Portuguese translations
     expect(screen.getByText("Entradas")).toBeInTheDocument();
     expect(screen.getByText("Empanada")).toBeInTheDocument();
     expect(screen.getByText("Rica empanada")).toBeInTheDocument();
   });

   it("does not translate when translations prop is undefined", () => {
     (useLanguageStore as any).mockImplementation((selector?: (state: { language: string }) => unknown) => {
       const state = { language: "en", setLanguage: vi.fn() };
       return selector ? selector(state) : state;
     });

     const categories = [
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

     render(
       <PublicMenu
         menu={makeMenu()}
         categories={categories}
       />,
     );

     // Content stays in Spanish since no translations provided
      expect(screen.getByText("Entradas")).toBeInTheDocument();
    });
  });
});

