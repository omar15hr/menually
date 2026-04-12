"use server";

import { createOpenAIClient } from "@/lib/openai";
import type { ImportedMenu } from "@/lib/types/ai-import.types";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const SYSTEM_PROMPT = `Eres un asistente especializado en analizar menús de restaurantes. Tu tarea es extraer la estructura de un menú desde una imagen o PDF y devolverla en formato JSON.

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "categories": [
    {
      "name": "Nombre de la categoría (ej: Entradas, Principales, Bebidas)",
      "products": [
        {
          "name": "Nombre del producto",
          "description": "Descripción breve del producto (opcional)",
          "price": 1500,
          "notes": "Notas especiales como 'sin tacc', 'vegetariano' (opcional)"
        }
      ]
    }
  ],
  "confidence": 0.95
}

REGLAS IMPORTANTES:
1. Solo incluye productos que puedas LEER claramente en la imagen
2. Si no puedes determinar el precio, usa null
3. El campo "confidence" indica qué tan seguro estás (0.0 a 1.0)
4. Las categorías deben ser nombres genéricos (Entradas, Principales, Postres, Bebidas, etc.)
5. Los precios deben ser números (sin símbolos de moneda)
6. No inventes datos - si no lo ves, no lo incluyas
7. Devuelve SOLO el JSON, sin texto adicional, sin markdown, sin explicaciones`;

/**
 * Process a menu image/PDF using GPT-4o-mini Vision
 * Converts file to base64 and sends to OpenAI API
 */
export async function processMenuAI(
  formData: FormData
): Promise<{ data: ImportedMenu | null; error: string | null }> {
  const file = formData.get("file") as File | null;

  if (!file) {
    return { data: null, error: "No se proporcionó ningún archivo" };
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      data: null,
      error: `Tipo de archivo no soportado: ${file.type}. Usa PDF, PNG, JPG o WEBP.`,
    };
  }

  // Validate file size
  if (file.size > MAX_SIZE_BYTES) {
    return {
      data: null,
      error: `El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo: 10MB.`,
    };
  }

  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);

    // Create OpenAI client
    const openai = createOpenAIClient();

    // Call GPT-4o-mini Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analiza este menú y extrae las categorías, productos y precios en formato JSON.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${base64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return {
        data: null,
        error: "La respuesta de OpenAI estaba vacía",
      };
    }

    // Parse JSON response
    let parsed: ImportedMenu;
    try {
      parsed = JSON.parse(content);
    } catch {
      return {
        data: null,
        error: "Error al parsear la respuesta de IA. Intenta con otra imagen.",
      };
    }

    // Validate structure
    if (!parsed.categories || !Array.isArray(parsed.categories)) {
      return {
        data: null,
        error: "La IA no pudo identificar categorías en el menú. Intenta con otra imagen.",
      };
    }

    // Sanitize and validate each category and product
    const sanitizedCategories = parsed.categories
      .filter((cat) => cat.name && cat.name.trim().length > 0)
      .map((cat) => ({
        name: cat.name.trim(),
        products: (cat.products || [])
          .filter((prod) => prod.name && prod.name.trim().length > 0)
          .map((prod) => ({
            name: prod.name.trim(),
            description: prod.description?.trim() || undefined,
            price:
              prod.price !== null && !isNaN(Number(prod.price))
                ? Number(prod.price)
                : null,
            notes: prod.notes?.trim() || undefined,
          })),
      }))
      .filter((cat) => cat.products.length > 0);

    if (sanitizedCategories.length === 0) {
      return {
        data: null,
        error: "No se encontraron productos válidos en el menú. Intenta con otra imagen.",
      };
    }

    return {
      data: {
        categories: sanitizedCategories,
        confidence: parsed.confidence ?? 0.7,
      },
      error: null,
    };
  } catch (err) {
    console.error("processMenuAI error:", err);

    if (err instanceof Error) {
      if (err.message.includes("timeout")) {
        return {
          data: null,
          error: "La solicitud tardó demasiado. Intenta con una imagen más pequeña.",
        };
      }
      if (err.message.includes("rate_limit")) {
        return {
          data: null,
          error: "Demasiadas solicitudes. Espera un momento e intenta de nuevo.",
        };
      }
      if (err.message.includes("Incorrect API key")) {
        return {
          data: null,
          error: "Error de configuración de API. Contacta al administrador.",
        };
      }
    }

    return {
      data: null,
      error: "Error al procesar el menú. Intenta de nuevo.",
    };
  }
}

/**
 * Convert File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}
