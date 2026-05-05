"use server";

import { createClient } from "@/lib/supabase/server";
import { createOpenAIClient } from "@/lib/openai";
import type { EntityType } from "@/types/translations.types";

export async function generateEntityTranslations(
  entityType: EntityType,
  entityId: string,
  menuId: string,
  fields: Record<string, string>,
): Promise<void> {
  try {
    const openai = createOpenAIClient();

    const prompt = `Translate the following restaurant menu ${entityType} fields from Spanish to English and Portuguese. Return ONLY a JSON object where each field has "en" and "pt" keys.

Fields to translate:
${Object.entries(fields)
  .map(([key, value]) => `${key}: "${value}"`)
  .join("\n")}

Example response format:
{
  "field_name": {
    "en": "English translation",
    "pt": "Portuguese translation"
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional restaurant menu translator. Translate accurately while keeping food terminology natural. Return only valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      console.warn("OpenAI returned empty content for translation");
      return;
    }

    const parsed = JSON.parse(raw) as Record<
      string,
      { en?: string; pt?: string }
    >;

    const upserts: Array<{
      menu_id: string;
      entity_type: EntityType;
      entity_id: string;
      field: string;
      language: "en" | "pt";
      content: string;
    }> = [];

    for (const [field, translations] of Object.entries(parsed)) {
      if (translations.en) {
        upserts.push({
          menu_id: menuId,
          entity_type: entityType,
          entity_id: entityId,
          field,
          language: "en",
          content: translations.en,
        });
      }
      if (translations.pt) {
        upserts.push({
          menu_id: menuId,
          entity_type: entityType,
          entity_id: entityId,
          field,
          language: "pt",
          content: translations.pt,
        });
      }
    }

    if (upserts.length === 0) {
      console.warn("No translations generated from OpenAI response");
      return;
    }

    const supabase = await createClient();
    const { error } = await supabase.from("translations").upsert(upserts, {
      onConflict: "entity_id, entity_type, field, language",
    });

    if (error) {
      console.error("Failed to upsert translations:", error.message);
    }
  } catch (err) {
    console.error("Translation generation failed:", err);
    // Silent degradation — do not throw
  }
}
