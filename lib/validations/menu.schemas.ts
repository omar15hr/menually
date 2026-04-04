import { z } from "zod";

export const updateMenuSchema = z.object({
  is_active: z.boolean(),
  show_price: z.boolean(),
  show_filters: z.boolean(),
  show_descriptions: z.boolean(),
  layout_card: z.enum(["grid", "list", "masonry"]),
  typography: z.enum(["inter", "roboto", "montserrat"]),
  logo_url: z.string().url("URL inválida").or(z.literal("")),
  image_product_shape: z.enum(["square", "rounded", "circle"]),
  bg_image_url: z.string().url("URL inválida").or(z.literal("")),
  bg_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido"),
  text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido"),
  price_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido"),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido"),
  description_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido"),
});

export type UpdateMenuSchema = z.infer<typeof updateMenuSchema>;
