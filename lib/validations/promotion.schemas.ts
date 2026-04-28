import { z } from "zod";

export const createPromotionSchema = z
  .object({
    title: z
      .string()
      .min(1, "El título es requerido")
      .max(100, "Máximo 100 caracteres"),
    description: z
      .string()
      .max(500, "Máximo 500 caracteres")
      .nullable()
      .optional(),
    keyword: z
      .string()
      .min(1, "La palabra clave es requerida")
      .max(30, "Máximo 30 caracteres"),
    product_ids: z
      .array(z.string().uuid("ID de producto inválido"))
      .min(1, "Selecciona al menos un producto"),
    image_url: z.string().url("URL de imagen inválida").nullable().optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    days_of_week: z.array(z.number().int().min(0).max(6)).default([]),
    is_active: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      if (data.start_date === "" || data.end_date === "") return true;
      return new Date(data.start_date) <= new Date(data.end_date);
    },
    {
      message: "La fecha de inicio debe ser anterior a la fecha de fin",
      path: ["end_date"],
    },
  );

export const updatePromotionSchema = z
  .object({
    id: z.string().uuid("ID de promoción inválido"),
    title: z
      .string()
      .min(1, "El título es requerido")
      .max(100, "Máximo 100 caracteres"),
    description: z
      .string()
      .max(500, "Máximo 500 caracteres")
      .nullable()
      .optional(),
    keyword: z
      .string()
      .min(1, "La palabra clave es requerida")
      .max(30, "Máximo 30 caracteres"),
    product_ids: z
      .array(z.string().uuid("ID de producto inválido"))
      .min(1, "Selecciona al menos un producto"),
    image_url: z.string().url("URL de imagen inválida").nullable().optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    days_of_week: z.array(z.number().int().min(0).max(6)).default([]),
    is_active: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return new Date(data.start_date) <= new Date(data.end_date);
    },
    {
      message: "La fecha de inicio debe ser anterior a la fecha de fin",
      path: ["end_date"],
    },
  );

export type CreatePromotionSchema = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionSchema = z.infer<typeof updatePromotionSchema>;
