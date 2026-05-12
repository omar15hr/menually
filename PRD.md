# PRD — Menually: Plataforma de Menús Digitales para Restaurantes

**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Estado:** Fase 1 ✅ | Fase 2 ✅ | Fase 3 🟡 | Fase 4 🟡 | Fase 5 🟡  
**Audiencia:** IA generativa / Equipo de desarrollo

---

## 1. Visión General

### 1.1 Propósito del documento

Este documento define los requisitos de producto (PRD) para **Menually**, una plataforma SaaS de menús digitales para restaurantes. Está redactado para ser consumido por una IA de desarrollo (como Claude) o un equipo técnico que implementará la solución.

### 1.2 Descripción del producto

Menually es una plataforma web que permite a restaurantes y negocios de alimentos crear, personalizar y publicar menús digitales accesibles mediante códigos QR. Los propietarios pueden:

- **Crear menús** con categorías y productos (CRUD completo).
- **Importar menús existentes** usando IA (GPT-4o-mini Vision) que extrae datos de fotos de menús físicos.
- **Personalizar la apariencia** del menú (colores, tipografía, layout, logo).
- **Gestionar promociones** con fechas, días de la semana y productos asociados.
- **Generar códigos QR** descargables para imprimir en mesas o locales.
- **Monitorear analíticas** de escaneos y navegación del menú.
- **Gestionar suscripciones** mediante Mercado Pago (plan básico y pro).

El cliente final (comensal) accede al menú público escaneando un QR, sin necesidad de registrarse ni descargar apps.

### 1.3 Objetivos del negocio

- Digitalizar menús de restaurantes de forma rápida y accesible.
- Reducir la fricción de creación de menús mediante importación con IA.
- Generar ingresos recurrentes mediante suscripciones mensuales/anuales.
- Proveer analíticas útiles para que los restaurantes optimicen sus menús.
- Ofrecer personalización de marca para cada negocio.

### 1.4 Contrato operativo para IA y agentes (fuente de verdad)

- **Orden de precedencia:**
  1. Reglas de negocio (Sección 7)
  2. Criterios de aceptación (Sección 11)
  3. Convenciones técnicas (Secciones 13 y 14)
  4. Checklist de fases (Sección 10)
- **Definición de Done global (DoD):**
  - Reglas de negocio impactadas implementadas y verificadas
  - Criterios de aceptación vinculados cubiertos
  - Sin violaciones de convenciones de código/arquitectura
  - Evidencia mínima adjunta (diff + validación funcional)
- **Regla anti-improvisación:** ninguna tarea se marca como completada sin cumplir sus criterios de salida y evidencia obligatoria.

---

## 2. Usuarios del Sistema

### 2.1 Roles

| Rol     | Descripción                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------------- |
| `owner` | Propietario del restaurante. Crea y gestiona su menú digital, promociones, analíticas y suscripción. |
| `guest` | Comensal final. Accede al menú público mediante QR sin autenticación. Solo visualiza.                |

### 2.2 Atributos del usuario (profiles)

| Campo           | Tipo        | Restricciones                      |
| --------------- | ----------- | ---------------------------------- |
| `full_name`     | string      | Requerido                          |
| `email`         | string      | Único, validado por Supabase Auth  |
| `business_name` | string      | Requerido — nombre del restaurante |
| `phone_number`  | string      | Opcional                           |
| `created_at`    | timestamptz | Auto-generado                      |
| `updated_at`    | timestamptz | Auto-generado                      |

### 2.3 Atributos del negocio (business)

| Campo           | Tipo    | Restricciones                                  |
| --------------- | ------- | ---------------------------------------------- |
| `address`       | string  | Dirección del local                            |
| `comuna`        | string  | Comuna/región                                  |
| `region`        | string  | Región                                         |
| `business_type` | string  | Tipo de negocio (restaurante, cafetería, etc.) |
| `description`   | string  | Descripción del negocio                        |
| `schedule`      | jsonb   | Horarios de atención                           |
| `show_address`  | boolean | Mostrar dirección en menú público              |

---

## 3. Planes y Suscripciones

### 3.1 Plan Básico — $24.990 CLP/mes

| Feature         | Detalle                                       |
| --------------- | --------------------------------------------- |
| Menús digitales | 1 menú personalizado                          |
| Importación IA  | Conversión de PDF/foto a menú con GPT-4o-mini |
| Analíticas      | Métricas básicas (escaneos, vistas)           |
| Stock           | Manejo de disponibilidad en tiempo real       |
| Administración  | 100% autoadministrable y editable             |
| Soporte         | Email                                         |

### 3.2 Plan Pro — $29.990 CLP/mes

| Feature                 | Detalle                              |
| ----------------------- | ------------------------------------ |
| Todo lo del Plan Básico | ✅                                   |
| Analíticas avanzadas    | + IA Insights                        |
| IA optimización         | Sugerencias de menú basadas en datos |
| Promociones             | Creación ilimitada de promociones    |
| Soporte                 | Prioritario por email                |

### 3.3 Ciclos de facturación

- **Mensual:** cobro recurrente cada 30 días.
- **Anual:** cobro anual con ~15% de descuento vs. mensual.

### 3.4 Período de prueba

- 14 días de trial gratuito al registrarse.
- Al expirar el trial, el usuario debe suscribirse para mantener acceso al dashboard.
- El menú público permanece visible incluso con trial expirado (solo se bloquea el dashboard).

---

## 4. Modelo de Datos (Esquema Conceptual)

### 4.1 Entidades principales

```
profiles
  id                uuid PK (relacionado con auth.users)
  full_name         text NOT NULL
  email             text UNIQUE NOT NULL
  business_name     text NOT NULL
  phone_number      text
  created_at        timestamptz DEFAULT now()
  updated_at        timestamptz DEFAULT now()

business
  id                uuid PK
  profile_id        uuid FK → profiles.id (1:1)
  address           text
  comuna            text
  region            text
  business_type     text
  description       text
  schedule          jsonb
  show_address      bool DEFAULT true
  created_at        timestamptz DEFAULT now()
  updated_at        timestamptz DEFAULT now()

menus
  id                uuid PK
  user_id           uuid FK → profiles.id
  slug              text UNIQUE NOT NULL       -- URL del menú público
  primary_color     text DEFAULT '#CDF545'
  text_color        text DEFAULT '#111111'
  bg_color          text DEFAULT '#FBFBFA'
  bg_image_url      text
  price_color       text
  description_color text
  typography        text DEFAULT 'inter'       -- 'inter' | 'roboto' | 'montserrat'
  layout_card       text DEFAULT 'default'
  image_product_shape text DEFAULT 'square'
  logo_url          text
  show_price        bool DEFAULT true
  show_descriptions bool DEFAULT true
  show_filters      bool DEFAULT true
  is_active         bool DEFAULT true
  created_at        timestamptz DEFAULT now()
  updated_at        timestamptz DEFAULT now()

categories
  id                uuid PK
  menu_id           uuid FK → menus.id
  name              text NOT NULL
  position          int DEFAULT 0
  created_at        timestamptz DEFAULT now()
  updated_at        timestamptz DEFAULT now()

products
  id                uuid PK
  category_id       uuid FK → categories.id
  name              text NOT NULL
  description       text
  price             numeric DEFAULT 0
  image_url         text
  labels            product_label[]            -- 'vegan' | 'gluten_free' | 'vegetarian' | 'spicy' | 'keto' | 'aplv'
  is_available      bool DEFAULT true
  position          int DEFAULT 0
  created_at        timestamptz DEFAULT now()
  updated_at        timestamptz DEFAULT now()

promotions
  id                uuid PK
  user_id           uuid FK → profiles.id
  menu_id           uuid FK → menus.id
  business_id       uuid FK → business.id
  title             text NOT NULL
  description       text
  image_url         text
  keyword           text
  product_ids       text[]
  days_of_week      int[]                      -- 0=domingo, 1=lunes, ...
  start_date        date
  end_date          date
  is_active         bool DEFAULT true
  status            text DEFAULT 'draft'
  position          int DEFAULT 0
  created_at        timestamptz DEFAULT now()
  updated_at        timestamptz DEFAULT now()

subscriptions
  id                uuid PK
  user_id           uuid FK → profiles.id (1:1)
  plan_type         plan_type DEFAULT 'basic'  -- 'basic' | 'pro'
  status            subscription_status DEFAULT 'trial'
  billing_cycle     billing_cycle DEFAULT 'monthly'
  amount            numeric DEFAULT 0
  mp_preapproval_id text
  mp_subscription_id text
  current_period_start timestamptz DEFAULT now()
  current_period_end   timestamptz NOT NULL
  next_billing_date    timestamptz
  last_payment_date    timestamptz
  trial_ends_at        timestamptz
  created_at        timestamptz DEFAULT now()
  updated_at        timestamptz DEFAULT now()

menu_events
  id                uuid PK
  business_id       uuid FK → business.id
  session_id        text DEFAULT gen_random_uuid()
  event_type        event_type NOT NULL        -- 'page_view' | 'category_view' | 'product_view' | 'share' | 'exit'
  category_id       uuid FK → categories.id
  product_id        uuid FK → products.id
  duration_seconds  int
  created_at        timestamptz DEFAULT now()

qr_scans
  id                uuid PK
  business_id       uuid FK → business.id
  device_type       device_type DEFAULT 'mobile' -- 'mobile' | 'desktop' | 'tablet'
  referrer          text
  user_agent        text
  scanned_at        timestamptz DEFAULT now()
  created_at        timestamptz DEFAULT now()

translations
  id                uuid PK
  menu_id           uuid FK → menus.id
  entity_type       text NOT NULL              -- 'product' | 'category'
  entity_id         uuid NOT NULL
  language          text NOT NULL              -- 'en' | 'es' | etc.
  name              text
  description       text
  created_at        timestamptz DEFAULT now()
  updated_at        timestamptz DEFAULT now()

translation_jobs
  id                uuid PK
  menu_id           uuid FK → menus.id
  status            text DEFAULT 'pending'
  source_language   text
  target_languages  text[]
  created_at        timestamptz DEFAULT now()
  completed_at      timestamptz
```

### 4.2 Enums

| Enum                  | Valores                                                                                |
| --------------------- | -------------------------------------------------------------------------------------- |
| `event_type`          | `page_view`, `category_view`, `product_view`, `share`, `exit`                          |
| `device_type`         | `mobile`, `desktop`, `tablet`                                                          |
| `product_label`       | `vegan`, `gluten_free`, `vegetarian`, `spicy`, `keto`, `aplv`                          |
| `subscription_status` | `trial`, `active`, `past_due`, `cancelled`, `pending_refund`, `chargeback`, `refunded` |
| `billing_cycle`       | `monthly`, `annual`                                                                    |
| `plan_type`           | `basic`, `pro`                                                                         |
| `font_family`         | `inter`, `roboto`, `montserrat`                                                        |

### 4.3 Reglas de integridad

- Cada `profile` tiene exactamente 1 `menu` (relación 1:1 en práctica, aunque el schema permite más).
- `products.category_id` debe apuntar a una categoría válida del mismo menú.
- `promotions.menu_id` debe apuntar al menú del usuario.
- `subscriptions.user_id` es 1:1 con `profiles.id`.
- RLS (Row Level Security) activo en todas las tablas — cada usuario solo accede a sus propios datos.

---

## 5. Flujos Funcionales

### 5.1 Registro y autenticación

- Registro con email + contraseña (Supabase Auth).
- Login con email + contraseña.
- OAuth (Google) como alternativa.
- Reset de contraseña vía email.
- Al registrarse: se crea `profile` automáticamente con `business_name` default.
- Se inicia trial de 14 días (`subscriptions.status = 'trial'`).

### 5.2 Onboarding → Suscripción

1. Usuario se registra → trial de 14 días activado.
2. Durante el trial, puede usar todas las funciones.
3. Al expirar el trial, debe suscribirse vía Mercado Pago.
4. Selecciona plan (Básico/Pro) y ciclo (mensual/anual).
5. Redirige a Mercado Pago para preapproval.
6. Webhook confirma → `subscriptions.status = 'active'`.
7. Acceso completo al dashboard.

### 5.3 Creación de menú

1. Usuario crea un menú con slug único.
2. Configura apariencia (colores, tipografía, layout).
3. Agrega categorías y productos manualmente O importa con IA.
4. El menú público se publica en `/menu/[slug]`.

### 5.4 Importación con IA

1. Usuario sube foto/PDF de un menú físico.
2. GPT-4o-mini Vision procesa la imagen (OCR).
3. Extrae categorías, productos, precios y descripciones.
4. Muestra preview para revisión antes de importar.
5. Usuario confirma → datos se escriben en DB.

### 5.5 Gestión de categorías y productos

- CRUD completo de categorías (crear, editar, eliminar, reordenar drag & drop).
- CRUD completo de productos (nombre, descripción, precio, imagen, labels, disponibilidad).
- Reordenamiento de productos dentro de cada categoría.
- Toggle de disponibilidad (`is_available`) para stock en tiempo real.

### 5.6 Apariencia del menú

- Colores: primario, texto, fondo, precio, descripción.
- Tipografía: Inter, Roboto, Montserrat.
- Layout de tarjetas: default, compact, expanded.
- Forma de imagen: square, rounded, circle.
- Logo del restaurante.
- Toggle de visibilidad: precio, descripciones, filtros.

### 5.7 Promociones

- Crear promociones con título, descripción, imagen.
- Asociar productos específicos.
- Programar por días de la semana y rango de fechas.
- Activar/desactivar.
- Carousel de promociones en el menú público.

### 5.8 Código QR

- Generar QR que apunta a `/menu/[slug]`.
- Descargar como PNG (512px).
- Almacenar en Supabase Storage.

### 5.9 Menú público (guest)

- Acceso sin autenticación en `/menu/[slug]`.
- Muestra categorías con productos.
- Filtros por labels (vegano, sin gluten, etc.).
- Carousel de promociones activas.
- Selector de idioma (si hay traducciones).
- Información del negocio (nombre, dirección, horarios).

### 5.10 Analíticas

- **QR Scans:** dispositivo, referrer, timestamp.
- **Menu Events:** page_view, category_view, product_view, share, exit.
- Dashboard con gráficos de tendencias, productos más vistos, horarios pico.

---

## 6. Requisitos de Interfaz

### 6.1 Vista owner — Pantallas principales

| Sección                        | Descripción                                           |
| ------------------------------ | ----------------------------------------------------- |
| Landing                        | Página pública de presentación del producto           |
| Auth                           | Login, registro, reset de contraseña                  |
| Onboarding                     | Selección de plan + redirección a Mercado Pago        |
| Dashboard (main)               | Resumen: métricas, productos, accesos rápidos         |
| Dashboard / Analytics          | Gráficos de escaneos, vistas, eventos                 |
| Dashboard / Promotions         | Gestión de promociones (UI completa, backend parcial) |
| Dashboard / Product Management | Listado centralizado de todos los productos           |
| Menu / Content                 | CRUD de categorías y productos                        |
| Menu / Appearance              | Editor de branding (colores, tipografía, layout)      |
| Menu / Import                  | Importación con IA (foto → menú)                      |
| Menu / QR                      | Descarga de código QR                                 |
| Settings / Business            | Información del negocio, dirección, horarios          |
| Settings / Contact             | Datos de contacto                                     |
| Settings / Preferences         | Preferencias del usuario                              |
| Settings / Subscription        | Estado de suscripción, upgrade/cancel                 |

### 6.2 Vista guest — Menú público

| Sección           | Descripción                                 |
| ----------------- | ------------------------------------------- |
| Header            | Logo del restaurante, nombre                |
| Promotions        | Carousel de promociones activas             |
| Category Tabs     | Navegación entre categorías                 |
| Product Cards     | Nombre, descripción, precio, imagen, labels |
| Filters           | Filtros por dietary labels                  |
| Language Selector | Cambio de idioma                            |
| Business Info     | Dirección, horarios (si configurado)        |

### 6.3 Paleta de marca Menually

| Color          | Hex       | Uso                  |
| -------------- | --------- | -------------------- |
| Verde primario | `#CDF545` | Brand, CTAs, acentos |
| Verde oscuro   | `#114821` | Texto, headers       |
| Gris muted     | `#58606E` | Texto secundario     |
| Fondo claro    | `#FBFBFA` | Background principal |

---

## 7. Reglas de Negocio

| ID    | Regla                                                                                                                         | Validación técnica mínima esperada                                      |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| RN-01 | **Trial de 14 días:** al registrarse, el usuario tiene 14 días de acceso completo.                                            | `trial_ends_at = now() + 14 days`. Validar en middleware del dashboard. |
| RN-02 | **Suscripción requerida post-trial:** sin suscripción activa, el dashboard se bloquea pero el menú público permanece visible. | `isSubscriptionActive()` en proxy middleware.                           |
| RN-03 | **1 menú por usuario:** cada usuario tiene un único menú asociado.                                                            | FK `menus.user_id` con validación en Server Actions.                    |
| RN-04 | **Slug único:** el slug del menú debe ser único globalmente.                                                                  | Unique constraint en DB + validación al crear.                          |
| RN-05 | **RLS en todas las tablas:** cada usuario solo accede a sus propios datos.                                                    | Políticas RLS en Supabase con `auth.uid()`.                             |
| RN-06 | **Producto disponible:** productos con `is_available = false` se muestran atenuados en el menú público pero no se ocultan.    | Filtro visual en `PublicMenu.tsx`.                                      |
| RN-07 | **Promociones activas:** solo se muestran promociones con `is_active = true` y dentro del rango de fechas/días.               | Validación en query + lógica de días de semana.                         |
| RN-08 | **Webhook idempotente:** los webhooks de Mercado Pago deben procesarse una sola vez.                                          | Verificación por `mp_preapproval_id` + logging.                         |
| RN-09 | **QR scan tracking:** cada escaneo de QR registra dispositivo, referrer y timestamp.                                          | Server Action `trackScan` en carga del menú público.                    |
| RN-10 | **Propiedad exclusiva:** solo el owner del menú puede editarlo.                                                               | RLS + verificación de `user_id` en Server Actions.                      |

### 7.1 Matriz de trazabilidad mínima (regla → aceptación)

- RN-01, RN-02 → AC-01 (acceso post-registro)
- RN-03, RN-04 → AC-02 (creación de menú)
- RN-05, RN-10 → AC-03 (seguridad y aislamiento)
- RN-06 → AC-04 (disponibilidad de productos)
- RN-07 → AC-05 (promociones)
- RN-08 → AC-06 (webhooks)
- RN-09 → AC-07 (analíticas)

---

## 8. Requisitos No Funcionales

| Categoría      | Requisito                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------- |
| Seguridad      | RLS en todas las tablas. Contraseñas manejadas por Supabase Auth. Secrets en variables de entorno. |
| Rendimiento    | Menú público carga en < 1s. Dashboard en < 2s.                                                     |
| Responsive     | Mobile-first. Menú público optimizado para móviles (principal uso vía QR).                         |
| Escalabilidad  | Slugs únicos permiten millones de menús. IA import escala con OpenAI API.                          |
| Disponibilidad | Menú público debe estar disponible 99.9% (incluso si suscripción expira).                          |
| Auditoría      | Webhooks de MP logueados con métricas para debugging.                                              |

---

## 9. Stack Tecnológico

| Capa            | Tecnología                                   |
| --------------- | -------------------------------------------- |
| Frontend        | Next.js 16 (App Router, RSC, Server Actions) |
| Lenguaje        | TypeScript 5 (strict mode)                   |
| Estilos         | Tailwind CSS v4 + shadcn/ui                  |
| Iconos          | Lucide React                                 |
| Base de datos   | Supabase (PostgreSQL) con RLS                |
| Autenticación   | Supabase Auth SSR (`@supabase/ssr`)          |
| Validación      | Zod                                          |
| Estado cliente  | Zustand                                      |
| Drag & Drop     | @dnd-kit                                     |
| Gráficos        | Recharts                                     |
| IA              | OpenAI GPT-4o-mini Vision                    |
| Pagos           | Mercado Pago (preapproval API)               |
| QR              | qrcode (generación PNG)                      |
| Notificaciones  | Sonner (toast)                               |
| Package manager | pnpm                                         |
| Linting         | ESLint 9 + `eslint-config-next`              |

---

## 10. Fases de Desarrollo (Checklist)

### 10.1 Protocolo de ejecución del checklist

- Estado permitido por tarea: `Todo | Doing | Blocked | Review | Done`
- Las fases son secuenciales: no iniciar fase N+1 con tareas `Todo/Doing/Blocked` en fase N.

### Fase 1 - Auth y Landing ✅ COMPLETADA

- [x] F1-1 Landing page con HeroSection, Navbar, features
- [x] F1-2 Auth: sign in, sign up, reset password, callback
- [x] F1-3 Profile creation on signup
- [x] F1-4 Middleware con protección de rutas

### Fase 2 - Onboarding y Suscripción ✅ COMPLETADA

- [x] F2-1 Onboarding wizard con selección de plan
- [x] F2-2 Integración Mercado Pago (preapproval)
- [x] F2-3 Webhook de Mercado Pago
- [x] F2-4 Trial de 14 días
- [x] F2-5 Subscription enforcement en middleware

### Fase 3 - Menú CRUD ✅ COMPLETADA

- [x] F3-1 CRUD de categorías (crear, editar, eliminar, reordenar)
- [x] F3-2 CRUD de productos (crear, editar, eliminar, reordenar)
- [x] F3-3 Drag & drop con @dnd-kit
- [x] F3-4 Zustand store para estado del editor
- [x] F3-5 Menú público básico (`/menu/[slug]`)
- [x] F3-6 Generación de QR

### Fase 4 - Apariencia e Importación IA 🟡 PARCIAL

- [x] F4-1 Editor de colores y tipografía
- [x] F4-2 Layout y forma de imágenes
- [x] F4-3 Toggle de visibilidad (precio, descripciones, filtros)
- [x] F4-4 Upload de logo
- [x] F4-5 Importación con IA: upload de imagen
- [x] F4-6 Importación con IA: procesamiento GPT-4o-mini
- [x] F4-7 Importación con IA: preview y confirmación
- [ ] F4-8 Wire completo de apariencia al render público (parcial)
- [ ] F4-9 Edge cases de importación (deduplicación, errores)

### Fase 5 - Promociones 🟡 PARCIAL

- [x] F5-1 UI de promociones (formulario multi-step, tabla, carousel)
- [x] F5-2 Modelo de datos completo
- [ ] F5-3 Backend logic + Server Actions (create, update, delete)
- [ ] F5-4 Integración con menú público (carousel de promos activas)
- [ ] F5-5 Validación de fechas y días de semana

### Fase 6 - Analíticas 🔴 MOCK ONLY

- [x] F6-1 Tablas `menu_events` y `qr_scans` creadas
- [x] F6-2 UI del dashboard de analíticas (Recharts)
- [ ] F6-3 Event tracking runtime (inserts en `menu_events`)
- [ ] F6-4 QR scan tracking en carga del menú público
- [ ] F6-5 Datos reales en gráficos (actualmente mock)
- [ ] F6-6 IA Insights (pro feature)

### Fase 7 - Configuración y Settings 🟡 PARCIAL

- [x] F7-1 Settings layout con sidebar
- [x] F7-2 Business settings (dirección, horarios, tipo)
- [x] F7-3 Contact data settings
- [x] F7-4 Preferences settings
- [x] F7-5 Subscription settings (estado actual)
- [ ] F7-6 Upgrade/cancel UI completa
- [ ] F7-7 Delete menu/account

### Fase 8 - i18n y Traducciones 🔴 SCHEMA ONLY

- [x] F8-1 Tablas `translations` y `translation_jobs`
- [x] F8-2 Language selector en menú público
- [x] F8-3 Zustand store de idioma
- [ ] F8-4 Server Actions para crear traducciones
- [ ] F8-5 Job queue para traducciones automáticas
- [ ] F8-6 Integración con IA para traducción

### 10.2 Gate de cierre por fase

Una fase solo pasa a `Done` si:

1. Todas sus tareas están en `Done`
2. Se cumple el DoD global (Sección 1.4)
3. Existe evidencia de validación funcional por tarea
4. No hay bloqueantes abiertos registrados en la fase

---

## 11. Criterios de Aceptación (AC)

### AC-01: Registro y trial

- Dado un nuevo usuario que se registra,
- Cuando completa el signup,
- Entonces se crea su profile, se activa el trial de 14 días, y puede acceder al dashboard.

### AC-02: Creación de menú

- Dado un usuario autenticado sin menú,
- Cuando crea su primer menú,
- Entonces se genera un slug único y el menú público es accesible en `/menu/[slug]`.

### AC-03: Aislamiento de datos (RLS)

- Dado dos usuarios distintos,
- Cuando uno intenta acceder a los datos del otro,
- Entonces el sistema bloquea el acceso mediante RLS.

### AC-04: Disponibilidad de productos

- Dado un producto con `is_available = false`,
- Cuando un guest lo ve en el menú público,
- Entonces se muestra atenuado pero visible, indicando que no está disponible.

### AC-05: Promociones activas

- Dada una promoción con `is_active = true` y fecha/día vigente,
- Cuando un guest accede al menú público,
- Entonces la promoción aparece en el carousel.

### AC-06: Webhook idempotente

- Dado un webhook de Mercado Pago recibido,
- Cuando se procesa,
- Entonces solo se ejecuta una vez incluso si se recibe duplicado.

### AC-07: QR scan tracking

- Dado un guest que escanea un QR,
- Cuando carga el menú público,
- Entonces se registra un scan con dispositivo, referrer y timestamp.

### AC-08: Suscripción post-trial

- Dado un usuario con trial expirado,
- Cuando intenta acceder al dashboard,
- Entonces se le redirige al onboarding para suscribirse.

---

## 12. Glosario

| Término     | Definición                                                                         |
| ----------- | ---------------------------------------------------------------------------------- |
| Slug        | Identificador URL único del menú público (ej. `menually.app/menu/mi-restaurante`). |
| Trial       | Período de prueba gratuito de 14 días.                                             |
| Preapproval | Autorización recurrente de pago en Mercado Pago.                                   |
| Labels      | Etiquetas dietéticas de productos (vegano, sin gluten, etc.).                      |
| Menu Events | Eventos de analítica: vistas de página, categorías, productos, shares, exits.      |
| QR Scan     | Registro de cada vez que se escanea el código QR del menú.                         |
| IA Import   | Importación de menú físico a digital usando GPT-4o-mini Vision.                    |
| RLS         | Row Level Security — políticas de seguridad a nivel de fila en PostgreSQL.         |

---

## 13. Convenciones de Desarrollo

### 13.1 Convenciones de Código

**Idioma del código — Inglés.** Todo identificador de código fuente en inglés.

**Idioma del texto visible — Español.** Todo texto que ve el usuario final en español.

| Capa                     | Idioma  | Convención                    | Ejemplo                                 |
| ------------------------ | ------- | ----------------------------- | --------------------------------------- |
| Componentes React        | Inglés  | **PascalCase**                | `MenuPreview.tsx`, `ProductCard.tsx`    |
| Funciones y variables    | Inglés  | **camelCase**                 | `createProduct()`, `isAvailable`        |
| Tipos e interfaces       | Inglés  | **PascalCase**                | `Product`, `Menu`, `Category`           |
| Archivos de acciones     | Inglés  | **kebab-case** + `.action.ts` | `product.action.ts`                     |
| Rutas de API             | Inglés  | **kebab-case**                | `/api/webhooks/mercadopago`             |
| Tablas y columnas en BD  | Inglés  | **snake_case**                | `products`, `is_available`              |
| Texto visible al usuario | Español | Frases completas              | `"Producto creado exitosamente"`        |
| Mensajes de commit       | Inglés  | Conventional commits          | `feat: add product availability toggle` |

### 13.2 Stack y Herramientas

| Capa            | Tecnología                                   |
| --------------- | -------------------------------------------- |
| Frontend        | Next.js 16 (App Router, RSC, Server Actions) |
| Lenguaje        | TypeScript 5 (strict mode)                   |
| Estilos         | Tailwind CSS v4 + shadcn/ui                  |
| Iconos          | Lucide React                                 |
| Base de datos   | Supabase (PostgreSQL) con RLS                |
| Autenticación   | Supabase Auth SSR                            |
| Validación      | Zod                                          |
| Estado cliente  | Zustand                                      |
| Drag & Drop     | @dnd-kit                                     |
| Gráficos        | Recharts                                     |
| IA              | OpenAI GPT-4o-mini                           |
| Pagos           | Mercado Pago                                 |
| Package manager | pnpm                                         |

### 13.3 Convenciones para Agentes de IA

| Skill                              | Cuándo cargarla                                    |
| ---------------------------------- | -------------------------------------------------- |
| `next-best-practices`              | Páginas, layouts, route handlers, server actions   |
| `react-best-practices`             | Componentes React, estado, Suspense                |
| `typescript-advanced-types`        | Tipos complejos, genéricos, queries tipadas        |
| `shadcn`                           | Formularios, componentes UI                        |
| `supabase-postgres-best-practices` | Queries, migraciones, RLS, índices                 |
| `frontend-design`                  | Páginas completas, dashboards, alta calidad visual |
| `vercel-composition-patterns`      | APIs de componentes, compound components           |

---

## 14. Arquitectura de Server Actions

### 14.1 Estructura de archivos

```
actions/
  auth.action.ts              # signIn, signUp, signOut, resetPassword, updatePassword
  product.action.ts           # createProduct, updateProduct, deleteProduct, reorderProducts
  categories.action.ts        # createCategory, updateCategory, deleteCategory, reorderCategories
  menu.action.ts              # createMenu, updateMenu, deleteMenu, activateMenu
  ai-process-menu.action.ts   # processMenuImage (GPT-4o-mini Vision)
  ai-import-menu.action.ts    # importMenuData (write JSON to DB)
  generateQrCode.action.ts    # generateQrCode (PNG 512px)
  uploadImageToStorage.action.ts  # uploadImageToStorage
  business.action.ts          # createBusinessInfo, updateAddressSchedule
  profile.action.ts           # updateProfile
  promotion.action.ts         # createPromotion, updatePromotion, deletePromotion
  subscription.action.ts      # createSubscription (MP preapproval)
  scan.action.ts              # trackScan
  track.event.action.ts       # trackEvent
```

### 14.2 Patrón base de una Server Action

1. **Directiva `"use server"`** — obligatoria al inicio.
2. **Validación con Zod** — `schema.safeParse(rawData)`.
3. **Auth verification** — `requireAuth()` de `lib/security/server-action-guards.ts`.
4. **Cliente Supabase server-side** — `await createClient()`.
5. **Retorno tipado** — `{ success, message, errors?, ...entity }`.
6. **Revalidación** — `revalidatePath()` para refrescar caché.

### 14.3 Ejemplo: Crear producto

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/security/server-action-guards";
import { revalidatePath } from "next/cache";

export async function createProduct(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const auth = await requireAuth(supabase);
  if (!auth.success) return auth;

  const { data: menu } = await supabase
    .from("menus")
    .select("id")
    .eq("user_id", auth.user.id)
    .single();

  if (!menu) return { success: false, message: "No tienes un menú creado" };

  const { data: inserted } = await supabase
    .from("products")
    .insert({
      category_id: formData.get("categoryId"),
      name: formData.get("name"),
      price: Number(formData.get("price")),
    })
    .select()
    .single();

  if (!inserted) return { success: false, message: "Error al crear producto" };

  revalidatePath("/dashboard/menu/menu-content");
  return { success: true, message: "Producto creado", product: inserted };
}
```

---

## 15. Feature Status Dashboard

| Feature                     | Status         | Qué falta                                       |
| --------------------------- | -------------- | ----------------------------------------------- |
| Auth (email/password)       | ✅ Complete    | —                                               |
| Auth (OAuth Google)         | ✅ Complete    | —                                               |
| Onboarding → MP Payment     | ✅ Complete    | Edge cases de recuperación de errores           |
| Menu Content CRUD           | ✅ Complete    | —                                               |
| QR Code Generation          | ✅ Complete    | —                                               |
| Menu Appearance             | 🟡 Partial     | Wire completo al render público                 |
| AI Menu Import              | 🟡 Partial     | Deduplicación, edge cases de errores            |
| Public Menu View            | 🟡 Partial     | Promo carousel, analytics events, traducciones  |
| Promotions                  | 🟡 Partial     | Backend logic + DB wiring + integración público |
| Analytics Dashboard         | 🔴 Mock Only   | Event tracking runtime, datos reales            |
| Event Tracking Runtime      | 🔴 Schema Only | Inserts en `menu_events` y `qr_scans`           |
| Subscription/Upgrade UI     | 🟡 Partial     | Upgrade/cancel UI en settings                   |
| Product Availability Toggle | 🔴 Missing     | `is_available` existe en schema, no en UI       |
| i18n / Traducciones         | 🔴 Schema Only | Tablas existen, sin lógica de traducción        |
| Business Settings           | ✅ Complete    | —                                               |
| Contact Data Settings       | ✅ Complete    | —                                               |
| Preferences Settings        | ✅ Complete    | —                                               |

---

## 16. Features Propuestas (Backlog)

### 16.1 Alta Prioridad

| Feature                         | Descripción                                                   | Impacto              |
| ------------------------------- | ------------------------------------------------------------- | -------------------- |
| **Product Availability Toggle** | Toggle en UI para `is_available` en productos                 | Stock en tiempo real |
| **Event Tracking Runtime**      | Insertar `menu_events` y `qr_scans` en tiempo real            | Analíticas reales    |
| **Promotions Backend**          | Server Actions + integración con menú público                 | Feature de ventas    |
| **Appearance Wire Completo**    | Que los settings de apariencia se reflejen en el menú público | Personalización real |

### 16.2 Media Prioridad

| Feature                  | Descripción                                          | Impacto               |
| ------------------------ | ---------------------------------------------------- | --------------------- |
| **Upgrade/Cancel UI**    | UI completa para cambiar plan o cancelar suscripción | Retención de usuarios |
| **Delete Menu/Account**  | Opción para eliminar menú o cuenta                   | Compliance            |
| **Import Deduplication** | Detectar y evitar duplicados al importar con IA      | UX mejorada           |
| **Promotion Scheduling** | Auto-activar/desactivar promos por fecha/día         | Automatización        |

### 16.3 Baja Prioridad / Futuro

| Feature                   | Descripción                                              | Impacto                   |
| ------------------------- | -------------------------------------------------------- | ------------------------- |
| **i18n Auto-Translation** | Traducción automática con IA de productos/categorías     | Mercados internacionales  |
| **AI Menu Insights**      | Sugerencias de optimización basadas en datos             | Pro feature diferenciador |
| **Multi-Menu Support**    | Permitir múltiples menús por usuario (ej. almuerzo/cena) | Upsell                    |
| **WhatsApp Integration**  | Compartir menú por WhatsApp                              | Viralidad                 |
| **Custom Domain**         | Menú en dominio propio del restaurante                   | Enterprise                |
| **Print Templates**       | Templates para imprimir QR en mesas/tarjetas             | UX offline                |
| **Analytics Export**      | Exportar analíticas a CSV/PDF                            | Reporting                 |
| **Role-Based Access**     | Invitar staff con permisos limitados                     | Equipos                   |
| **Menu Versions**         | Historial de cambios del menú                            | Audit trail               |
| **Bulk Operations**       | Import/export masivo de productos                        | Eficiencia                |
