import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateEntityTranslations } from "./translate.action";

const mockUpsert = vi.fn().mockReturnValue({ error: null });
const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });

const mockOpenAICreate = vi.fn().mockResolvedValue({
  choices: [
    {
      message: {
        content: JSON.stringify({
          name: { en: "Meat empanada", pt: "Empanada de carne" },
          description: { en: "Delicious meat pastry", pt: "Massa de carne deliciosa" },
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

describe("generateEntityTranslations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpenAICreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              name: { en: "Meat empanada", pt: "Empanada de carne" },
              description: { en: "Delicious meat pastry", pt: "Massa de carne deliciosa" },
            }),
          },
        },
      ],
    });
  });

  it("upserts translations on success", async () => {
    await generateEntityTranslations("product", "p1", "m1", {
      name: "Empanada de carne",
      description: "Muy rica",
    });

    expect(mockFrom).toHaveBeenCalledWith("translations");
    expect(mockUpsert).toHaveBeenCalled();
    const upsertArg = mockUpsert.mock.calls[0][0];
    expect(upsertArg).toHaveLength(4); // 2 fields × 2 languages
    expect(upsertArg).toEqual(
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
    );
  });

  it("does not throw when OpenAI fails", async () => {
    mockOpenAICreate.mockRejectedValueOnce(new Error("OpenAI down"));

    await expect(
      generateEntityTranslations("product", "p1", "m1", {
        name: "Empanada",
      }),
    ).resolves.toBeUndefined();

    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("does not throw when upsert fails", async () => {
    mockUpsert.mockReturnValueOnce({ error: { message: "DB error" } });

    await expect(
      generateEntityTranslations("category", "c1", "m1", {
        name: "Entradas",
      }),
    ).resolves.toBeUndefined();

    expect(mockUpsert).toHaveBeenCalled();
  });
});
