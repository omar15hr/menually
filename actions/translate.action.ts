"use server";

import { createClient } from "@/lib/supabase/server";
import { createOpenAIClient } from "@/lib/openai";
import type {
  EntityType,
  TargetLanguage,
  TranslationJob,
  TranslationJobStatus,
} from "@/types/translations.types";

const TARGET_LANGUAGES: TargetLanguage[] = ["en", "pt"];

function sanitizeFields(fields: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fields)
      .map(([field, value]) => [field, value.trim()] as const)
      .filter(([, value]) => value.length > 0),
  );
}

function parseFields(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const fields: Record<string, string> = {};
  for (const [key, fieldValue] of Object.entries(value)) {
    if (typeof fieldValue === "string" && fieldValue.trim().length > 0) {
      fields[key] = fieldValue.trim();
    }
  }
  return fields;
}

async function translateFields(
  entityType: EntityType,
  fields: Record<string, string>,
  targetLanguages: TargetLanguage[],
): Promise<Record<string, Partial<Record<TargetLanguage, string>>>> {
  const openai = createOpenAIClient();
  const languageList = targetLanguages.join(" and ");

  const prompt = `Translate the following restaurant menu ${entityType} fields from Spanish to ${languageList}. Return ONLY a JSON object where each field has keys for the requested target languages.

Target languages: ${targetLanguages.join(", ")}

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
    throw new Error("OpenAI returned empty content for translation");
  }

  return JSON.parse(raw) as Record<
    string,
    Partial<Record<TargetLanguage, string>>
  >;
}

export async function enqueueEntityTranslationJob(
  entityType: EntityType,
  entityId: string,
  menuId: string,
  fields: Record<string, string>,
): Promise<string | null> {
  const sanitizedFields = sanitizeFields(fields);

  if (Object.keys(sanitizedFields).length === 0) {
    console.warn("Translation job skipped: no translatable fields");
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("translation_jobs")
    .upsert(
      {
        menu_id: menuId,
        entity_type: entityType,
        entity_id: entityId,
        fields: sanitizedFields,
        target_languages: TARGET_LANGUAGES,
        status: "pending",
        retries: 0,
        error_message: null,
        processed_at: null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "entity_id, entity_type",
      },
    )
    .select("id")
    .single();

  if (error) {
    console.error("Failed to enqueue translation job:", error.message);
    return null;
  }

  return data.id;
}

export async function processTranslationJob(jobId: string): Promise<void> {
  const supabase = await createClient();

  const { data: jobRow, error: jobError } = await supabase
    .from("translation_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (jobError || !jobRow) {
    console.error(
      "Failed to fetch translation job:",
      jobError?.message ?? "Job not found",
    );
    return;
  }

  const job = {
    ...jobRow,
    entity_type: jobRow.entity_type as EntityType,
    fields: parseFields(jobRow.fields),
    status: jobRow.status as TranslationJobStatus,
    target_languages: (jobRow.target_languages ?? []).filter(
      (language): language is TargetLanguage =>
        language === "en" || language === "pt",
    ),
  } satisfies TranslationJob;

  if (Object.keys(job.fields).length === 0 || job.target_languages.length === 0) {
    await supabase
      .from("translation_jobs")
      .update({
        status: "failed",
        retries: job.retries + 1,
        error_message: "Job has no fields or target languages",
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);
    return;
  }

  await supabase
    .from("translation_jobs")
    .update({
      status: "processing",
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", job.id);

  try {
    const parsed = await translateFields(
      job.entity_type,
      job.fields,
      job.target_languages,
    );

    const upserts: Array<{
      menu_id: string;
      entity_type: EntityType;
      entity_id: string;
      field: string;
      language: TargetLanguage;
      content: string;
    }> = [];

    for (const [field, translations] of Object.entries(parsed)) {
      for (const language of job.target_languages) {
        const content = translations[language]?.trim();
        if (content) {
          upserts.push({
            menu_id: job.menu_id,
            entity_type: job.entity_type,
            entity_id: job.entity_id,
            field,
            language,
            content,
          });
        }
      }
    }

    if (upserts.length === 0) {
      throw new Error("No translations generated from OpenAI response");
    }

    const { error: upsertError } = await supabase
      .from("translations")
      .upsert(upserts, {
        onConflict: "entity_id, entity_type, field, language",
      });

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    await supabase
      .from("translation_jobs")
      .update({
        status: "done",
        error_message: null,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown translation failure";

    console.error("Translation job failed:", message);

    await supabase
      .from("translation_jobs")
      .update({
        status: "failed",
        retries: job.retries + 1,
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);
  }
}

export async function generateEntityTranslations(
  entityType: EntityType,
  entityId: string,
  menuId: string,
  fields: Record<string, string>,
): Promise<void> {
  const jobId = await enqueueEntityTranslationJob(
    entityType,
    entityId,
    menuId,
    fields,
  );

  if (!jobId) {
    return;
  }

  // Best effort immediate processing. The durable job row keeps failures visible
  // and can later be retried by a cron/worker without changing callers.
  void processTranslationJob(jobId);
}
