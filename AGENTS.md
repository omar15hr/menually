# Menually — Agent Guidelines

> **Stack:** Next.js 16 + React 19 + TypeScript + Supabase + shadcn/ui + Zustand + Tailwind CSS v4
> **Package Manager:** `pnpm` (NEVER npm/yarn)
> **PRD:** `PRD.md` — feature specs, data model, roadmap
> **Types:** `types/database.types.ts` — Supabase auto-generated (DO NOT edit manually)

---

## PROJECT MAP — Where Everything Lives

Use this as your index. When asked to add/modify a feature, find it here first — do NOT explore the project from scratch.

### Routes

| Route                                  | Purpose                                      | Key Files                                                                                                           |
| -------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/`                                    | Landing page                                 | `app/page.tsx`, `components/landing/HeroSection.tsx`, `Navbar.tsx`                                                  |
| `/auth/signin`                         | Email sign-in                                | `app/auth/signin/page.tsx`, `components/auth/SignInForm.tsx`                                                        |
| `/auth/signup`                         | Email sign-up                                | `app/auth/signup/page.tsx`, `components/auth/SignUpForm.tsx`                                                        |
| `/auth/callback`                       | Supabase OAuth callback                      | `app/auth/callback/route.ts`                                                                                        |
| `/auth/reset-password`                 | Request password reset                       | `app/auth/reset-password/page.tsx`                                                                                  |
| `/auth/update-password`                | Set new password (from reset link)           | `app/auth/update-password/page.tsx`, `UpdatePasswordForm.tsx`                                                       |
| `/auth/check-email`                    | Post-signup confirmation                     | `app/auth/check-email/page.tsx`                                                                                     |
| `/onboarding`                          | Plan selection → MP redirect                 | `app/onboarding/page.tsx`, `components/onboarding/OnboardingWizard.tsx`                                             |
| `/dashboard/(main)`                    | Dashboard home (with/without menu)           | `app/dashboard/(main)/page.tsx`, `components/dashboard/`                                                            |
| `/dashboard/(main)/analytics`          | Analytics dashboard (mock)                   | `app/dashboard/(main)/analytics/page.tsx`, `components/analytics/AnalyticsDashboard.tsx`                            |
| `/dashboard/(main)/product-management` | Centralized product listing                  | `app/dashboard/(main)/product-management/page.tsx`, `DashboardProductTable.tsx`                                     |
| `/dashboard/(main)/promotions`         | Promotions UI (mock data)                    | `app/dashboard/(main)/promotions/page.tsx`, `components/promotions/`                                                |
| `/dashboard/menu/menu-content`         | CRUD categories + products                   | `app/dashboard/menu/menu-content/page.tsx`, `components/categories/CategoriesWorkflow.tsx`, `store/useMenuStore.ts` |
| `/dashboard/menu/menu-appearance`      | Branding editor (colors, typography, layout) | `app/dashboard/menu/menu-appearance/page.tsx`, `components/menu/MenuWorkflow.tsx`                                   |
| `/dashboard/menu/menu-import`          | AI menu import (GPT-4o-mini Vision)          | `app/dashboard/menu/menu-import/page.tsx`, `components/menu-import/`, `store/useImportStore.ts`                     |
| `/dashboard/menu/qr`                   | QR code download                             | `app/dashboard/menu/qr/page.tsx`, `components/menu/QrDisplay.tsx`                                                   |
| `/menu/[slug]`                         | Public menu view (guest-facing)              | `app/menu/[slug]/page.tsx`, `components/menu/PublicMenu.tsx`, `MenuPreview.tsx`                                     |
| `/settings`                            | Settings index (redirects to business)       | `app/settings/page.tsx`                                                                                             |
| `/settings/business`                   | Business info + address/schedule             | `app/settings/business/page.tsx`, `components/settings/BusinessSettingsForm.tsx`                                    |
| `/settings/contact-data`               | Contact details                              | `app/settings/contact-data/page.tsx`                                                                                |
| `/settings/preferences`                | User preferences                             | `app/settings/preferences/page.tsx`                                                                                 |
| `/settings/subscription`               | Subscription status/upgrade                  | `app/settings/subscription/page.tsx`, `components/settings/SubscriptionSettings.tsx`                                |
| `/api/webhooks/mercadopago`            | MP subscription webhooks                     | `app/api/webhooks/mercadopago/route.ts`, `lib/mercadopago/webhook.ts`                                               |

### Server Actions (`actions/`)

| File                             | Domain     | Functions                                                                 |
| -------------------------------- | ---------- | ------------------------------------------------------------------------- |
| `auth.action.ts`                 | Auth       | `signIn`, `signUp`, `resetPassword`, `updatePassword`, `signOut`          |
| `product.action.ts`              | Products   | `createProduct`, `updateProduct`, `deleteProduct`, `reorderProducts`      |
| `categories.action.ts`           | Categories | `createCategory`, `updateCategory`, `deleteCategory`, `reorderCategories` |
| `menu.action.ts`                 | Menu       | `createMenu`, `updateMenu`, `deleteMenu`, `activateMenu`                  |
| `ai-process-menu.action.ts`      | AI Import  | `processMenuImage` — GPT-4o-mini Vision OCR                               |
| `ai-import-menu.action.ts`       | AI Import  | `importMenuData` — write extracted JSON to DB                             |
| `generateQrCode.action.ts`       | QR         | `generateQrCode` — PNG 512px to Supabase Storage                          |
| `uploadImageToStorage.action.ts` | Images     | `uploadImageToStorage` — generic image upload                             |
| `business.action.ts`             | Profile    | `createBusinessInfo`, `updateAddressSchedule`                             |
| `profile.action.ts`              | Profile    | `updateProfile`                                                           |
| `promotion.action.ts`            | Promotions | `createPromotion`, `updatePromotion`, `deletePromotion`                   |
| `subscription.action.ts`         | Billing    | `createSubscription` — Mercado Pago preapproval flow                      |
| `scan.action.ts`                 | Analytics  | `trackScan` — QR scan recording                                           |
| `track.event.action.ts`          | Analytics  | `trackEvent` — menu event recording                                       |

**Pattern:** All Server Actions return `{ success: boolean, message: string, errors?: Record<string, string>, ...entity }`. For optimistic UI, include the created entity in the response.

### Zustand Stores (`store/`)

| Store                   | Purpose                             | Key State                                                                    |
| ----------------------- | ----------------------------------- | ---------------------------------------------------------------------------- | -------------------- |
| `useMenuStore.ts`       | Menu editor (categories + products) | `categories[]`, `selectedCategoryId`, `selectedProductId`, CRUD mutations    |
| `useImportStore.ts`     | AI import wizard                    | `step` (upload→processing→preview→importing→done), `extractedData`, `status` |
| `useLanguageStore.ts`   | i18n language selection             | `language` ('en'                                                             | 'es'), `setLanguage` |
| `useOnboardingStore.ts` | Onboarding flow                     | Tracks plan selection + wizard progress                                      |

### Hooks (`hooks/`)

| Hook                      | Purpose                                                          |
| ------------------------- | ---------------------------------------------------------------- |
| `use-mobile.ts`           | Responsive detection (`isMobile` boolean)                        |
| `useCategoryHydration.ts` | Hydrates `useMenuStore` from server props (React 19 key pattern) |
| `useMenuTracking.ts`      | Menu analytics event tracking                                    |

### Components by Domain

| Domain              | Directory                 | Key Components                                                                                                                                                 |
| ------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Analytics**       | `components/analytics/`   | `AnalyticsDashboard`, `AnalyticsView`, `AnalyticsData`                                                                                                         |
| **Auth**            | `components/auth/`        | `SignInForm`, `SignUpForm`, `ResetPasswordForm`, `UpdatePasswordForm`                                                                                          |
| **Categories**      | `components/categories/`  | `CategoriesWorkflow` (main editor), `CategoryEditTable`, `SortableCategoryItem`, `AddCategoryForm`                                                             |
| **Menu**            | `components/menu/`        | `MenuWorkflow` (appearance editor), `MenuPreview` (public view), `PublicMenu`, `ProductCard`, `CategoryTabs`, `MenuEditTable`, `QrDisplay`, `LanguageSelector` |
| **Menu Import**     | `components/menu-import/` | `MenuImportDropzone`, `MenuImportPreview`, `MenuImportLoading`                                                                                                 |
| **Onboarding**      | `components/onboarding/`  | `OnboardingWizard`, `PlanSelection`, `PlanCard`, `SuccessScreen`, `ErrorScreen`                                                                                |
| **Products**        | `components/products/`    | `ProductForm`, `ProductPanel`, `MultiSelectChips`                                                                                                              |
| **Promotions**      | `components/promotions/`  | `PromotionForm` (multi-step), `PromotionTable`, `PromotionCarousel`, `PromotionCard`, `PromotionRow`                                                           |
| **Dashboard**       | `components/dashboard/`   | `AppSidebar`, `WithMenu`, `WithoutMenu`, `DashboardProductTable`, `SearchInput`                                                                                |
| **Settings**        | `components/settings/`    | `BusinessSettingsForm`, `ProfileForm`, `SubscriptionSettings`, `DeleteMenuForm`, `SettingsSidebar`                                                             |
| **Shared**          | `components/shared/`      | `Header`, `HeaderLogo`, `ImageUploader`, `PhotoUpload`, `LoadingFallback`, `MenuallySpinner`                                                                   |
| **Icons**           | `components/icons/`       | Custom SVG icons (ArrowLeft, Camera, Analytics, Bell, Avocado, Alert)                                                                                          |
| **UI (PRIMITIVES)** | `components/ui/`          | shadcn/ui base — **DO NOT MODIFY** (button, input, select, dialog, table, tabs, etc.)                                                                          |

### Lib Modules (`lib/`)

| Module         | Purpose                  | Key Files                                                                                                                       |
| -------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/`    | DB clients               | `server.ts` (RSC), `client.ts` (browser), `proxy.ts` (middleware + subscription enforcement)                                    |
| `mercadopago/` | Mercado Pago integration | `client.ts` (fetch wrapper), `constants.ts` (plan IDs, URLs), `types.ts`, `webhook.ts`                                          |
| `queries/`     | Reusable DB queries      | `auth.queries.ts`, `categories.queries.ts`, `menu.queries.ts`, `profile.queries.ts`, `promotions.queries.ts`                    |
| `security/`    | Auth guards              | `server-action-guards.ts` — `requireAuth()` wrapper for Server Actions                                                          |
| `validations/` | Zod schemas              | `auth.schemas.ts`, `menu.schemas.ts`, `promotion.schemas.ts`                                                                    |
| `analytics/`   | Session tracking         | `session.ts`                                                                                                                    |
| `utils/`       | Utilities                | `slug.ts` (slug generation), `cn()` + misc in root `utils.ts`                                                                   |
| _Root_         | Misc                     | `openai.ts` (GPT-4o-mini client), `plans.ts` (subscription tiers), `promotions.ts`, `subscription.ts`, `fonts.ts`, `timeAgo.ts` |

### Database Tables

| Table              | Purpose                                                                | RLS |
| ------------------ | ---------------------------------------------------------------------- | --- |
| `profiles`         | User profiles (1:1 with auth.users)                                    | ✅  |
| `menus`            | Menu config + branding (colors, typography, layout, slug)              | ✅  |
| `categories`       | Menu sections (name, position, menu_id FK)                             | ✅  |
| `products`         | Menu items (name, description, price, image, labels, availability)     | ✅  |
| `menu_events`      | Analytics events (page_view, category_view, product_view, share, exit) | ✅  |
| `qr_scans`         | QR scan analytics (device_type, referrer)                              | ✅  |
| `subscriptions`    | Billing (status, billing_cycle, mp_subscription_id)                    | ✅  |
| `translations`     | i18n translations (product/category names + descriptions)              | ✅  |
| `translation_jobs` | Translation job queue                                                  | ✅  |

**Enums:** `event_type`, `device_type`, `product_label` (vegan, gluten_free, etc.), `subscription_status`, `billing_cycle`, `plan_type`, `font_family`

> **Full data model →** See `PRD.md` Section 4 and `types/database.types.ts`

### External Integrations

| Service         | Usage                                  | Files                                                                                         |
| --------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Supabase**    | Auth + DB + Storage                    | `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/proxy.ts`                   |
| **OpenAI**      | GPT-4o-mini Vision for menu OCR        | `lib/openai.ts`, `actions/ai-process-menu.action.ts`                                          |
| **MercadoPago** | Subscription billing (preapproval API) | `lib/mercadopago/`, `app/api/webhooks/mercadopago/route.ts`, `actions/subscription.action.ts` |

### Feature Status Dashboard

| Feature                          | Status         | What's Missing                                                                    |
| -------------------------------- | -------------- | --------------------------------------------------------------------------------- |
| Auth (email/password)            | ✅ Complete    | —                                                                                 |
| Menu Content CRUD                | ✅ Complete    | —                                                                                 |
| QR Code Generation               | ✅ Complete    | —                                                                                 |
| Onboarding → MP Payment          | 🟡 Partial     | UI polish, error recovery edge cases                                              |
| Menu Appearance/Branding         | 🟡 Partial     | Full wire-up of appearance settings to public menu render                         |
| AI Menu Import                   | 🟡 Partial     | UX flow complete, but import dedup edge cases need work                           |
| Public Menu View (`MenuPreview`) | 🟡 Partial     | Basic render works; missing: guest interaction, promo carousel, analytics events  |
| Promotions                       | 🟡 Partial     | UI complete (multi-step form, table, carousel); backend logic + DB wiring missing |
| Analytics Dashboard              | 🔴 Mock Only   | All charts show hardcoded data; needs event tracking pipeline                     |
| Event Tracking Runtime           | 🔴 Schema Only | `menu_events` + `qr_scans` tables exist, no insert logic at runtime               |
| Subscription/Upgrade UI          | 🟡 Partial     | MP gateway works; upgrade/cancel UI in settings incomplete                        |
| Product Availability Toggle      | 🔴 Missing     | `is_available` field exists in schema, not reflected in UI                        |

### Testing

- **Framework:** Vitest (config: `vitest.config.ts`, setup: `vitest.setup.tsx`)
- **Pattern:** Test files colocated with source (`*.test.ts` or `*.test.tsx`)
- **Coverage:** Stores, hooks, components (especially promotions, menu, auth, settings)

---

## CONVENTIONS

### Architecture

- **Server Components** (default in `app/`, no `"use client"`): Fetch data, handle redirects. Use `createClient()` from `lib/supabase/server.ts`.
- **Client Components** (`"use client"` directive): Interactive UI, hooks, event handlers, Zustand stores.
- **Server Actions** (`"use server"` in `actions/*.action.ts`): Form submissions, mutations. Always return `{ success, message, errors }`.

**File placement:**

```
components/{domain}/     # New components go in the matching domain folder
actions/                 # Server Actions (one per domain)
store/                   # Zustand stores
hooks/                   # Custom hooks
lib/                     # Utilities, clients, queries, validations
types/                   # TypeScript type definitions (not generated)
```

### TypeScript

```typescript
// ✅ Use import type for types
import type { Database } from "@/types/database.types";
type Product = Database["public"]["Tables"]["products"]["Row"];

// ✅ Row / Insert / Update pattern
type CreateProduct = Database["public"]["Tables"]["products"]["Insert"];

// ✅ Custom relation types
type CategoryWithProducts =
  Database["public"]["Tables"]["categories"]["Row"] & { products: Product[] };

// ✅ Optional chaining + nullish coalescing (NEVER non-null assertion)
const name = product?.name ?? "";
```

**Naming:** PascalCase (components, files, types), camelCase (hooks, server actions, stores), snake_case (DB tables/enums).

### React Patterns

```typescript
// ✅ Form submissions: useActionState + Server Action
const [state, formAction, isPending] = useActionState(createProduct, null);

// ✅ Remount via key (NOT setState in useEffect)
<ProductForm key={selectedProductId ?? `new-${categoryId}`} product={selectedProduct} />

// ✅ Store hydration from server props
useEffect(() => { setCategories(categories); }, [categories, setCategories]);
```

### Styling (Tailwind v4 + shadcn/ui)

```typescript
import { cn } from "@/lib/utils";

// Brand colors: #CDF545 (green), #114821 (dark green), #58606E (muted), #FBFBFA (light bg)
// DO NOT modify components/ui/ — shadcn-managed. Add new via `pnpm shadcn add <name>`
// DO NOT add new colors/spacing/CSS unless explicitly requested
```

### Supabase

```typescript
// Server Component (RSC)
const supabase = await createClient();
const { data } = await supabase.from("table").select("*");

// Server Action — always verify auth first
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) return { success: false, message: "No autenticado", errors: {} };

// Insert with returning (for optimistic UI)
const { data: inserted } = await supabase
  .from("products")
  .insert(data)
  .select()
  .single();
```

### Error Handling

- Server Actions: always return `{ success, message, errors }` — never throw
- Client: use `toast` from `sonner` for notifications
- Auth checks in BOTH Server Components (`redirect("/login")`) and Server Actions
- Validation: use Zod schemas from `lib/validations/`

### SDD Workflow Rules

1. **Check existing inventory first** — use PROJECT MAP above, don't re-explore
2. **Show current state** — what exists, what's pending, affected files
3. **Wait for approval** before implementing
4. **DO NOT create openspec files** — SDD artifacts stay in memory (Engram), never on disk
5. **Never change styles** when implementing functionality
6. **Run `npx tsc --noEmit`** after implementing — must compile clean
7. **Use existing patterns** — match the conventions in this document

---

## Commands

```bash
pnpm dev              # Dev server
pnpm build            # Production build
pnpm lint             # ESLint
npx tsc --noEmit      # TypeScript check
pnpm shadcn add <c>   # Add shadcn/ui component
pnpm test             # Vitest
pnpm test -- --run    # Vitest single run (no watch)
```
