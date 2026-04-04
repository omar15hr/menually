// lib/validations/menu.schema.ts
import { z } from "zod";

export const menuSchema = z.object({
  slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(60, "Máximo 60 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido"),
  text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido"),
  bg_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido"),
  price_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido"),
  bg_image_url: z.string().url("URL inválida").or(z.literal("")),
  logo_url: z.string().url("URL inválida").or(z.literal("")).optional(),
  typography: z.enum(["inter", "playfair", "roboto", "poppins", "lato"]),
  layout_card: z.enum(["grid", "list", "masonry"]),
  image_product_shape: z.enum(["square", "rounded", "circle"]),
  show_price: z.enum(["true", "false"]),
  show_descriptions: z.enum(["true", "false"]),
  show_filters: z.enum(["true", "false"]),
});

export type MenuSchema = z.infer<typeof menuSchema>;
