# Agent Guidelines — Menually

## Project Overview

Next.js 16 + React 19 + TypeScript + Supabase + shadcn/ui + Zustand stack. A digital menu management app.

---

## Commands

```bash
# Development
pnpm dev          # Start dev server (uses pnpm, not npm)
pnpm build        # Production build
pnpm start        # Start production server

# Code Quality
pnpm lint         # ESLint (eslint-config-next + TypeScript rules)
npx tsc --noEmit  # TypeScript check only

# Utilities
pnpm shadcn add <component>  # Add shadcn/ui components
pnpm shadcn add <component> --yes  # Skip prompts
```

> **Note:** This project uses `pnpm`, not `npm` or `yarn`.

---

## Architecture Conventions

### Server vs Client Components

- **Server Components** (`.tsx` files without `"use client"`): Default in `app/`. Fetch data, handle redirects.
- **Client Components** (with `"use client"`): Interactive UI, hooks, event handlers.
- **Server Actions** (`.action.ts` files with `"use server"`): Form submissions, mutations.

### File Structure

```
app/                    # Next.js App Router (routes, layouts, pages)
├── (auth)/            # Route groups (no URL segment)
├── dashboard/         # Protected routes
└── api/              # API routes (rarely used — prefer Server Actions)

components/
├── ui/               # shadcn/ui components (do not modify manually)
├── icons/            # Custom SVG icons
├── categories/       # Category-related components
├── products/         # Product-related components
└── shared/           # Shared/reusable components

actions/               # Server Actions (use server)
store/                 # Zustand stores
hooks/                 # Custom React hooks
lib/                   # Utilities, Supabase client, config
types/                 # TypeScript types (especially database.types.ts)
```

### State Management (Zustand)

Use Zustand (`@/store/`) for client-side state shared across components. Currently in use:

- `useMenuStore` — Categories/products state for the menu editor

```typescript
// Store pattern: setters + getters + mutations
interface MenuState {
  // State
  categories: Category[];
  selectedCategoryId: string | null;

  // Setters
  setCategories: (categories: Category[]) => void;
  selectCategory: (id: string) => void;

  // Getters (derived state)
  getSelectedCategory: () => Category | undefined;

  // Mutations (immutable updates)
  addProduct: (categoryId: string, product: Product) => void;
  updateProduct: (productId: string, data: Partial<Product>) => void;
}
```

---

## TypeScript Conventions

### Import Types Safely

```typescript
// ✅ Correct — import type for types only
import type { Database } from "@/types/database.types";

// ✅ Correct — local type definitions
type Product = Database["public"]["Tables"]["products"]["Row"];

// ✅ Correct — use pre-defined types from types/
import { Category } from "@/types/categories.types";

// ❌ Avoid — don't redefine what Supabase generates
interface MyProduct {
  id: string;
  name: string;
}
```

### Database Types

Types are auto-generated in `types/database.types.ts`. Use these patterns:

```typescript
// Row type (read)
type Product = Database["public"]["Tables"]["products"]["Row"];

// Insert type (create)
type CreateProduct = Database["public"]["Tables"]["products"]["Insert"];

// Update type (patch)
type UpdateProduct = Database["public"]["Tables"]["products"]["Update"];

// Enum type
type ProductLabel = Database["public"]["Enums"]["product_label"];

// Custom types with relationships
type CategoryWithProducts =
  Database["public"]["Tables"]["categories"]["Row"] & {
    products: Product[];
  };
```

### Naming Conventions

| Element          | Convention             | Example                             |
| ---------------- | ---------------------- | ----------------------------------- |
| Files            | PascalCase             | `CategoryEditTable.tsx`             |
| Components       | PascalCase             | `ProductForm`                       |
| Hooks            | camelCase + use prefix | `useMobile`, `useMenuStore`         |
| Types/Interfaces | PascalCase             | `CategoryWithProducts`, `MenuState` |
| Server Actions   | camelCase              | `createProduct`, `updateCategory`   |
| Store            | camelCase              | `useMenuStore`                      |
| Database tables  | snake_case             | `product_labels`, `menu_items`      |

### Component Naming Rules

- **Always use PascalCase** for component file names: `ProductCard.tsx`, `CategoryList.tsx`
- **File extension matters:**
  - `.tsx` for components with JSX (React components)
  - `.ts` for utility types, hooks, or non-UI modules

### Component Structure Rules

- **New components go in the appropriate domain folder** inside `components/`:
  ```
  components/
  ├── ui/               # shadcn/ui base components
  ├── icons/            # Custom SVG icons
  ├── categories/      # Category-specific components
  ├── products/         # Product-specific components
  ├── settings/        # Settings-related components
  └── shared/           # Reusable components across domains
  ```
- Example: A new product card component → `components/products/ProductCard.tsx`
- Example: A shared button group → `components/shared/ButtonGroup.tsx`

---

## SDD Workflow Rules

### Before Implementing

1. **Check existing files first** — understand current structure before creating new components
2. **Always show current state analysis** — what's done, what's pending, affected files
3. **Confirm before proceeding** — wait for user approval after analysis

### Implementation Rules

- **DO NOT create openspec files or folders** — SDD artifacts stay in memory, never write to disk
- **DO NOT change styles when implementing functionality changes** — focus only on the requested feature
- **Use existing design system** — don't add new colors, spacing, or CSS unless explicitly requested
- **Follow component structure rules** — new components go in appropriate domain folders

### Code Quality

- Always run `tsc --noEmit` after implementing to verify no type errors
- Ensure TypeScript compiles clean before marking tasks as complete

### Null Handling

```typescript
// ✅ Prefer optional chaining + nullish coalescing
const name = product?.name ?? "";

// ✅ Explicit null checks when needed
if (product !== null && product !== undefined) {
}

// ❌ Avoid non-null assertion unless absolutely certain
const name = product!.name;
```

---

## React Conventions

### Client Components

Always add `"use client"` at the top of files that use:

- Hooks (`useState`, `useEffect`, etc.)
- Event handlers (`onClick`, `onChange`)
- Browser APIs
- Zustand stores

### Form Patterns

Use React 19's `useActionState` for form submissions with Server Actions:

```typescript
const [state, formAction, isPending] = useActionState(createProduct, null);

return (
  <form action={formAction}>
    {/* form fields */}
    <button type="submit" disabled={isPending}>
      {isPending ? <LoaderIcon /> : "Submit"}
    </button>
  </form>
);
```

### Component Props

```typescript
// ✅ Use interface for props
interface Props {
  categoryId: string;
  product?: Product | null; // Optional props at end
}

// ✅ Default exports for page components
export default function ProductForm({ categoryId, product }: Props) {
  // ...
}

// ✅ Named exports for reusable utility components
export { Button, buttonVariants };
```

### Avoid setState in Effects

```typescript
// ❌ Anti-pattern — causes cascading renders
useEffect(() => {
  setProductImageUrl(product?.image_url ?? "");
}, [product?.id]);

// ✅ Correct — use key prop to remount component
<ProductForm
  key={selectedProductId ?? `new-${categoryId}`}
  product={selectedProduct}
  categoryId={categoryId}
/>
```

### Store Hydration Pattern

When a Server Component passes data to a Client Component that hydrates a store:

```typescript
// In the client component (CategoriesWorkflow.tsx)
"use client";

useEffect(() => {
  setCategories(categories); // Hydrate store from server props
}, [categories, setCategories]);

// Select first category if none selected
useEffect(() => {
  if (!selectedCategoryId && categories.length > 0) {
    selectCategory(categories[0].id);
  }
}, [categories, selectedCategoryId, selectCategory]);
```

---

## Styling Conventions

### Tailwind CSS

This project uses Tailwind CSS v4 with shadcn/ui. Follow these patterns:

```typescript
// ✅ Use shadcn's cn() utility for conditional classes
import { cn } from "@/lib/utils";

<div className={cn(
  "base classes",
  condition && "conditional classes"
)}>

// ✅ Use design system colors from globals.css
className="bg-[#CDF545]"    // Brand green
className="text-[#114821]"  // Dark green
className="text-[#58606E]"  // Gray/muted
className="bg-[#FBFBFA]"    // Light background

// ✅ Tailwind gap/spacing
className="gap-2"           // 0.5rem
className="gap-6"           // 1.5rem
className="p-4"             // 1rem padding
className="px-2.5"          // 0.625rem horizontal padding
```

### shadcn/ui Components

- **Do not modify** files in `components/ui/` — they are managed by shadcn
- **Add components** via CLI: `pnpm shadcn add button input textarea`
- **Use variants** from `buttonVariants()` when needed

```typescript
import { Button, buttonVariants } from "@/components/ui/button";

// Variant usage
<Button variant="outline" size="sm">
  Click me
</Button>
```

---

## Error Handling

### Server Actions

Always return a consistent shape with `success`, `message`, and `errors`:

```typescript
export async function createProduct(_prevState: unknown, formData: FormData) {
  if (!user) {
    return {
      success: false,
      message: "Usuario no autenticado",
      errors: {},
    };
  }

  if (insertError) {
    return {
      success: false,
      message: insertError.message,
      errors: {},
    };
  }

  // For optimistic updates, return the created record
  return {
    success: true,
    message: "Producto creado correctamente",
    errors: {},
    product: insertedProduct, // Include for store updates
  };
}
```

### Client-Side Error Display

Use `sonner` for toast notifications:

```typescript
import { toast } from "sonner";

toast.success("Operación exitosa");
toast.error("Algo salió mal");
toast.error("Error específico", { description: "Detalles adicionales" });
```

---

## Supabase Patterns

### Server-Side Client

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("table").select("*");
}
```

### Type-Safe Queries

```typescript
// Select with relationships
const { data } = await supabase
  .from("categories")
  .select(
    `
    *,
    products (*)
  `,
  )
  .eq("menu_id", menu.id)
  .order("position", { ascending: true });

// Insert with returning
const { data: inserted, error } = await supabase
  .from("products")
  .insert({ name, price })
  .select()
  .single();
```

---

## Common Patterns

### Optimistic UI Updates

When creating records, return the created object from the Server Action and update the Zustand store immediately:

```typescript
// 1. Server Action returns the created record
return { success: true, product: insertedProduct, message: "..." };

// 2. Client updates store on success
useEffect(() => {
  if (state?.success && state?.product) {
    addProduct(categoryId, state.product);
    selectProduct(state.product.id);
    toast.success(state.message);
  }
}, [state]);
```

### Authentication Checks

Always verify user in Server Components and Server Actions:

```typescript
// Server Component
if (!user) redirect("/login");

// Server Action
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) return { success: false, message: "No autenticado", errors: {} };
```

---

## Key Files Reference

| File                           | Purpose                             |
| ------------------------------ | ----------------------------------- |
| `store/useMenuStore.ts`        | Zustand store for menu editor state |
| `types/database.types.ts`      | Supabase-generated types            |
| `actions/product.action.ts`    | Product CRUD Server Action          |
| `actions/categories.action.ts` | Category CRUD Server Action         |
| `lib/supabase/server.ts`       | Supabase server client factory      |
| `app/dashboard/menu/`          | Menu management routes              |
