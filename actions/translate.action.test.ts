import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  enqueueEntityTranslationJob,
  generateEntityTranslations,
  processTranslationJob,
} from "./translate.action";

const mockSingle = vi.fn();
const mockUpdateEq = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockUpdate = vi.fn();
const mockUpsert = vi.fn();
const mockBuilder = {
  select: mockSelect,
  eq: mockEq,
  single: mockSingle,
  update: mockUpdate,
  upsert: mockUpsert,
};

mockSelect.mockReturnValue(mockBuilder);
mockEq.mockReturnValue(mockBuilder);
mockUpdate.mockReturnValue({ eq: mockUpdateEq });
mockUpsert.mockReturnValue(mockBuilder);

const mockFrom = vi.fn(() => ({
  upsert: mockUpsert,
  select: mockSelect,
  update: mockUpdate,
  eq: mockEq,
  single: mockSingle,
}));

const mockOpenAICreate = vi.fn().mockResolvedValue({
  choices: [
    {
      message: {
        content: JSON.stringify({
          name: { en: "Meat empanada", pt: "Empanada de carne" },
          description: {
            en: "Delicious meat pastry",
            pt: "Massa de carne deliciosa",
          },
        }),
      },
    },
  ],
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

vi.mock("@/lib/openai", () => ({
  createOpenAIClient: vi.fn(() => ({
    chat: {
      completions: {
        create: mockOpenAICreate,
      },
    },
  })),
}));

describe("translation actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue(mockBuilder);
    mockEq.mockReturnValue(mockBuilder);
    mockUpdate.mockReturnValue({ eq: mockUpdateEq });
    mockUpsert.mockReturnValue(mockBuilder);
    mockSingle.mockResolvedValue({
      data: { id: "job-1" },
      error: null,
    });
    mockOpenAICreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              name: { en: "Meat empanada", pt: "Empanada de carne" },
              description: {
                en: "Delicious meat pastry",
                pt: "Massa de carne deliciosa",
              },
            }),
          },
        },
      ],
    });
  });

  it("enqueues translation jobs with sanitized fields", async () => {
    const jobId = await enqueueEntityTranslationJob("product", "p1", "m1", {
      name: " Empanada de carne ",
      description: "",
    });

    expect(jobId).toBe("job-1");
    expect(mockFrom).toHaveBeenCalledWith("translation_jobs");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_type: "product",
        entity_id: "p1",
        menu_id: "m1",
        fields: { name: "Empanada de carne" },
        target_languages: ["en", "pt"],
        status: "pending",
        retries: 0,
      }),
      { onConflict: "entity_id, entity_type" },
    );
  });

  it("does not enqueue when there are no translatable fields", async () => {
    const jobId = await enqueueEntityTranslationJob("category", "c1", "m1", {
      name: " ",
    });

    expect(jobId).toBeNull();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("processes a job and upserts translations", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: "job-1",
        menu_id: "m1",
        entity_type: "product",
        entity_id: "p1",
        fields: {
          name: "Empanada de carne",
          description: "Muy rica",
        },
        target_languages: ["en", "pt"],
        status: "pending",
        retries: 0,
        error_message: null,
        created_at: null,
        updated_at: null,
        processed_at: null,
      },
      error: null,
    });
    await processTranslationJob("job-1");

    expect(mockOpenAICreate).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith("translations");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          entity_type: "product",
          entity_id: "p1",
          menu_id: "m1",
          field: "name",
          language: "en",
          content: "Meat empanada",
        }),
      ]),
      { onConflict: "entity_id, entity_type, field, language" },
    );
  });

  it("marks the job as failed when OpenAI fails", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: "job-1",
        menu_id: "m1",
        entity_type: "category",
        entity_id: "c1",
        fields: { name: "Entradas" },
        target_languages: ["en", "pt"],
        status: "pending",
        retries: 0,
        error_message: null,
        created_at: null,
        updated_at: null,
        processed_at: null,
      },
      error: null,
    });
    mockOpenAICreate.mockRejectedValueOnce(new Error("OpenAI down"));

    await expect(processTranslationJob("job-1")).resolves.toBeUndefined();

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        retries: 1,
        error_message: "OpenAI down",
      }),
    );
  });

  it("generateEntityTranslations resolves after queuing the job", async () => {
    await expect(
      generateEntityTranslations("product", "p1", "m1", {
        name: "Empanada",
      }),
    ).resolves.toBeUndefined();

    expect(mockFrom).toHaveBeenCalledWith("translation_jobs");
  });
});
