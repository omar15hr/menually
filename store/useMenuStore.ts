import { create } from "zustand";
import type { Database } from "@/types/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

type Category = Database["public"]["Tables"]["categories"]["Row"] & {
  products: Product[];
};

interface MenuState {
  categories: Category[];

  selectedCategoryId: string | null;
  selectedProductId: string | null;

  // setters base
  setCategories: (categories: Category[]) => void;
  selectCategory: (id: string) => void;
  selectProduct: (id: string | null) => void;

  // helpers derivados
  getSelectedCategory: () => Category | undefined;
  getSelectedProduct: () => Product | null;

  // mutations
  addProduct: (categoryId: string, product: Product) => void;
  updateProductImage: (productId: string, imageUrl: string) => void;
  updateProduct: (productId: string, data: Partial<Product>) => void;
  reorderCategories: (fromIndex: number, toIndex: number) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],

  selectedCategoryId: null,
  selectedProductId: null,

  // -------------------------
  // SETTERS
  // -------------------------
  setCategories: (categories) =>
    set({
      categories,
      selectedCategoryId: categories[0]?.id ?? null,
      selectedProductId: null,
    }),

  selectCategory: (id) =>
    set({
      selectedCategoryId: id,
      selectedProductId: null,
    }),

  selectProduct: (id) =>
    set({
      selectedProductId: id,
    }),

  // -------------------------
  // GETTERS
  // -------------------------
  getSelectedCategory: () => {
    const { categories, selectedCategoryId } = get();
    return categories.find((c) => c.id === selectedCategoryId);
  },

  getSelectedProduct: () => {
    const { selectedProductId } = get();
    const category = get().getSelectedCategory();

    if (!category) return null;

    return category.products.find((p) => p.id === selectedProductId) ?? null;
  },

  // -------------------------
  // MUTATIONS
  // -------------------------
  addProduct: (categoryId, product) =>
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, products: [...cat.products, product] }
          : cat,
      ),
    })),

  updateProductImage: (productId, imageUrl) =>
    set((state) => ({
      categories: state.categories.map((cat) => ({
        ...cat,
        products: cat.products.map((p) =>
          p.id === productId ? { ...p, image_url: imageUrl } : p,
        ),
      })),
    })),

  updateProduct: (productId, data) =>
    set((state) => ({
      categories: state.categories.map((cat) => ({
        ...cat,
        products: cat.products.map((p) =>
          p.id === productId ? { ...p, ...data } : p,
        ),
      })),
    })),

  reorderCategories: (fromIndex, toIndex) =>
    set((state) => {
      const newCategories = [...state.categories];
      const [removed] = newCategories.splice(fromIndex, 1);
      newCategories.splice(toIndex, 0, removed);
      return { categories: newCategories };
    }),
}));
