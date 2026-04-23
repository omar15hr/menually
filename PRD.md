# Menually — Product Requirements Document

> **Status**: v0.1 — Alpha
> **Last updated**: 2026-04-22
> **Stack**: Next.js 16 + React 19 + TypeScript + Supabase + shadcn/ui + Zustand

---

## 1. Vision & Goals

### 1.1 Product Vision

Menually es una plataforma SaaS para que negocios de gastronomía (restaurantes, bares, cafeterías) transformen su carta física en un **menú digital interactivo** accesible vía QR. El menú se muestra en el celular del cliente sin necesidad de descargar una app.

### 1.2 North Star

> Reducir la fricción entre el cliente y el pedido, generando engagement medible con el menú.

### 1.3 Target Users

| Usuario | Rol | Goal |
|---------|-----|------|
| **Owner** | Dueño/manager del restaurante | Crear y mantener su menú digital, ver analíticas, gestionar promociones |
| **Guest** | Cliente del restaurante | Visualizar el men�� desde su celular, explorar productos, tomar decisiones |

### 1.4 Success Metrics

- **QR Scans**: Número de veces que se escanea el código QR
- **Engagement**: Tiempo promedio en el menú, productos más vistos, tasa de rebote
- **Conversion**: Relación entre visitas al menú y pedidos (futuro)
- **Retention**: Restaurantes que mantienen y actualizan su menú semanalmente

---

## 2. User Flows

### 2.1 Owner Flow

```
Sign Up → Onboarding → Create Menu → [Import AI | Manual | Templates]
                                            ↓
                                      Configure Appearance
                                            ↓
                                      Customize Content (categories, products)
                                            ↓
                                      Generate QR → Place on table → Go Live
                                            ↓
                                    Manage / Update / View Analytics
```

### 2.2 Guest Flow

```
Scan QR → Public Menu Page (/menu/[slug])
              ↓
         Browse Categories
              ↓
         View Product Details
              ↓
         Share menu (optional)
```

---

## 3. Core Features

### 3.1 Authentication & Profiles

- Supabase Auth (email/password)
- Profile con `business_name`, `full_name`, `email`
- Middleware protegiendo `/dashboard/*`

### 3.2 Menu Creation

- **Create Menu**: Un owner puede tener UN menú por cuenta
- **Slug**: Auto-generado desde `business_name` (ej: "Café Martínez" → `/menu/cafe-martinez`)
- **Intents de creación**: `manual`, `import`, `ai`

### 3.3 Menu Content Management

- CRUD de categorías (nombre, posición)
- CRUD de productos (nombre, descripción, precio, imagen, labels, disponibilidad, posición)
- Drag & drop de categorías y productos (dnd-kit)
- **Store**: `useMenuStore` para estado en memoria del editor
- **Server Actions**: `createProduct`, `updateProduct`, `deleteProduct`, `reorderCategories`

### 3.4 AI Menu Import

- Owner sube imagen/PDF del menú físico
- GPT-4o-mini Vision extrae estructura JSON (categorías, productos, precios, notas)
- Preview editable antes de importar
- Import smart: skip duplicados por nombre exacto
- **Store**: `useImportStore` maneja steps: `upload → processing → preview → importing → success/error`

### 3.5 Menu Appearance / Branding

- Colores personalizables: `primary_color`, `bg_color`, `text_color`, `description_color`, `price_color`
- Logo upload
- Fondo: color sólido o imagen
- Tipografía: `inter`, `roboto`, `montserrat` (font_family enum)
- Layout card: diferentes templates de visualización
- `image_product_shape`: forma de la imagen del producto
- Flags: `show_price`, `show_descriptions`, `show_filters`

### 3.6 QR Code Generation

- Genera PNG 512x512 con logo Menually
- Almacena en Supabase Storage (`images/qrs/[menuId].png`)
- Cachea: si ya existe, retorna URL pública directamente
- Color: `dark: #114821` / `light: #FFFFFF`
- Descarga desde `/dashboard/menu/qr`

### 3.7 Public Menu View

- Server Component en `/menu/[slug]`
- Filtra por `slug` + `is_active = true`
- Fetch eager de categorías con productos
- **Status**: El componente `MenuPreview` está importado pero no implementado (solo renderiza el slug como placeholder)

### 3.8 Analytics Dashboard

- **Métricas generales**: Escaneos totales, tasa de rebote, tiempo de permanencia
- **Heatmap**: Tráfico por hora/día
- **Gráficos**: Área con comparación semanal
- **Rendimiento**: Por categoría y por producto (barras de progreso)
- **Patrones de navegación**: Paths más comunes
- **AI Insights**: Recomendaciones generadas por IA (mock data)
- **Status**: Todo es mock data — no hay data real de Supabase

### 3.9 Promotions (MVP started)

- Carrusel de vista previa de promociones activas
- Historial con filtros: todas / programadas / vencidas / pausadas
- Tabla con estado, keyword, vigencia
- Toggle de disponibilidad por promoción
- **Status**: UI completa pero sin lógica — 100% mock data

### 3.10 Product Management

- Vista centralizada de todos los productos (todas las categorías)
- Tab por categoría
- Búsqueda
- Paginación
- Link a "Descargar QR" y "Editar menú"

### 3.11 Subscription / Billing (Schema ready, impl incomplete)

- Tablas: `subscriptions` (status, billing_cycle, current_period_start/end, trial_ends_at)
- Enums: `subscription_status` (trial, active, past_due, cancelled), `billing_cycle` (monthly, annual), `plan_type` (basic, pro)
- Mercado Pago integration fields (`mp_subscription_id`)
- **Status**: Estructura existe en DB, UI de upgrade/payment no implementada

### 3.12 Event Tracking (Schema ready, impl incomplete)

- Tabla `menu_events`: page_view, category_view, product_view, share, exit
- Tabla `qr_scans`: device_type, referrer, user_agent
- **Status**: Tablas existen, no hay insert en runtime

---

## 4. Data Model

### 4.1 Entity Relationship

```
profiles (1) ────── (1) menus
                      │
                      │ (1:N)
                      ↓
                  categories
                      │
                      │ (1:N)
                      ↓
                  products ── ─ ─ (N:N) product_labels (enum)

menus ────────── (1:N) menu_events
menus ────────── (1:N) qr_scans
profiles ─────── (1:N) subscriptions
```

### 4.2 Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `profiles` | User profiles | business_name, email, full_name |
| `menus` | Menu configuration + branding | slug, branding colors, typography, layout, is_active |
| `categories` | Menu sections | name, position, menu_id |
| `products` | Items in menu | name, description, price, image_url, labels, is_available, position |
| `menu_events` | Analytics events | event_type, category_id, product_id, session_id |
| `qr_scans` | QR analytics | device_type, referrer, scanned_at |
| `subscriptions` | Billing | status, billing_cycle, current_period_*, trial_ends_at |

### 4.3 Enums

| Enum | Values |
|------|--------|
| `event_type` | page_view, category_view, product_view, share, exit |
| `device_type` | mobile, desktop, tablet |
| `product_label` | vegan, gluten_free, vegetarian, spicy, keto, aplv |
| `subscription_status` | trial, active, past_due, cancelled |
| `billing_cycle` | monthly, annual |
| `plan_type` | basic, pro |
| `font_family` | inter, roboto, montserrat |

---

## 5. Technical Architecture

### 5.1 App Router Structure

```
app/
├── (auth)/                 # Auth routes (signin, signup, etc.)
├── dashboard/
│   ├── (main)/
│   │   ├── page.tsx        # Dashboard home
│   │   ├── analytics/      # Analytics dashboard
│   │   ├── product-management/
│   │   └── promotions/
│   └── menu/
│       ├── menu-appearance/  # Editor visual + branding
│       ├── menu-content/     # CRUD categories/products
│       ├── menu-import/      # AI import flow
│       └── qr/               # QR download
├── menu/[slug]/             # Public menu view (Server Component)
├── api/                     # Rarely used (prefer Server Actions)
└── actions/                 # Server Actions

components/
├── ui/                      # shadcn/ui (do not modify)
├── shared/Header            # Nav bar
├── dashboard/               # Dashboard-specific components
├── menu/                    # Menu editor + preview components
├── menu-import/             # AI import wizard components
└── icons/                   # Custom SVG icons

store/
├── useMenuStore.ts          # Menu editor state
└── useImportStore.ts        # Import wizard state

lib/
├── supabase/server.ts       # Server Supabase client
├── supabase/client.ts       # Client Supabase client
├── openai.ts                # OpenAI client factory
└── utils/                   # Utilities (slug, cn, etc.)
```

### 5.2 State Management

- **Zustand** (`useMenuStore`, `useImportStore`)
- **React Context** (Theme via `next-themes`)
- **URL State** (searchParams para filtros, paginación)
- **Server State** (Supabase queries directas en Server Components)

### 5.3 Server Actions

| Action | Purpose |
|--------|---------|
| `product.action.ts` | Product CRUD |
| `categories.action.ts` | Category CRUD |
| `menu.action.ts` | Menu create + update |
| `auth.action.ts` | Auth helpers |
| `generateQrCode.action.ts` | QR generation + storage |
| `ai-process-menu.action.ts` | GPT-4o-mini Vision OCR |
| `ai-import-menu.action.ts` | Import extracted data to DB |
| `uploadImageToStorage.action.ts` | Image uploads |

### 5.4 Key Dependencies

- **@dnd-kit** — Drag & drop para reorder de categorías/productos
- **ai + openai** — AI menu import
- **qrcode** — QR generation
- **recharts** — Analytics charts
- **sonner** — Toast notifications
- **zod** — Validación de formularios y schemas

---

## 6. Constraints & Dependencies

### 6.1 Supabase

- **RLS**: Row Level Security activo en todas las tablas
- **Storage**: Bucket `images` para logos, productos, QRs
- **Auth**: Supabase Auth (email/password)
- **Edge**: Sin Edge Functions activas aún

### 6.2 External APIs

- **OpenAI** (GPT-4o-mini): AI menu import
- **Mercado Pago** (fields ready): Billing integration futuro

### 6.3 Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_BASE_URL          # Para QR generation
AI_GATEWAY_URL               # Opcional: AI gateway en vez de OpenAI directo
OPENAI_API_KEY
```

---

## 7. Missing / Incomplete Features

| Feature | Status | Priority |
|---------|--------|----------|
| Public menu view (`MenuPreview` component) | Placeholder — no render | P0 |
| Analytics data pipeline | 100% mock data | P1 |
| Promotions CRUD logic | UI + mock data | P1 |
| Event tracking runtime | Schema only | P1 |
| Menu customization UI (editor visual) | Partially built (`MenuWorkflow`) | P0 |
| Subscription/upgrade flow | Schema ready, UI missing | P2 |
| Multi-menu support | Not in roadmap | P3 |
| Sharing to social | Button exists, logic missing | P2 |
| Product availability toggle (guest view) | Field exists, UI missing | P2 |

---

## 8. Roadmap Phases

### Phase 1 — MVP (Current)
- ✅ Menú digital público funcional
- ✅ Editor de contenido (categorías + productos)
- ✅ Branding (colores, tipografía)
- ✅ QR code
- 🔲 AI menu import (funcional pero sin UX completa)
- 🔲 Menu preview (placeholder)

### Phase 2 — Analytics
- 🔲 Event tracking en runtime
- 🔲 Real analytics dashboard
- 🔲 AI insights con data real
- 🔲 QR scan attribution

### Phase 3 — Engagement
- 🔲 Promotions system (CRUD completo)
- 🔲 Guest sharing
- 🔲 Product availability live toggle
- 🔲 Push notifications (futuro)

### Phase 4 — Monetization
- 🔲 Subscription tiers (basic / pro)
- 🔲 Mercado Pago integration
- 🔲 Usage limits
- 🔲 Billing portal

---

## 9. Open Questions

1. **Multi-tenancy**: ¿Se soporta un owner con múltiples locales/menús? (actualmente 1:1)
2. **Sharing**: ¿El guest puede compartir el menú sin necesidad de QR?
3. **Pedidos**: ¿Está en roadmap que el cliente haga pedidos desde el menú?
4. **QR placement**: ¿Se provee material físico (porta QR, stickers)?
5. **Translations**: ¿Soporte multi-idioma para el menú?
6. **Offline**: ¿El menú funciona sin conexión?
7. **Analytics attribution**: ¿Se puede saber qué QR escaneó cada guest?

---

## 10. Design System

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-green` | `#CDF545` | CTA buttons, highlights |
| `dark-green` | `#114821` | Primary actions, QR code |
| `gray-muted` | `#58606E` | Secondary text |
| `bg-light` | `#FBFBFA` | Card backgrounds |

### Fonts

- **Display**: System font stack (tailwind default)
- **Monospace**: Para código/técnico

### shadcn/ui

- Componentes base en `components/ui/`
- Customizados con tokens de brand
- **NO** modificar archivos en `components/ui/` directamente