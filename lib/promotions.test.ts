import { describe, it, expect } from "vitest";
import {
  computePromotionsMetrics,
  type ComputedPromotions,
} from "./promotions";
import type { Promotion, PromotionStatus } from "@/types/promotions.types";

function makePromotion(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: "p1",
    menu_id: "m1",
    title: "Promo",
    description: null,
    keyword: "keyword",
    image_url: null,
    product_ids: [],
    start_date: null,
    end_date: null,
    days_of_week: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as Promotion;
}

describe("computePromotionsMetrics", () => {
  const now = new Date("2024-06-15T12:00:00Z");

  it("returns empty results for empty promotions", () => {
    const result = computePromotionsMetrics([], "all", "", now);
    expect(result.filtered).toEqual([]);
    expect(result.carouselPromotions).toEqual([]);
    expect(result.stats.every((s) => s.value === 0)).toBe(true);
    expect(result.filterButtons[0].label).toBe("Todas (0)");
  });

  it("computes correct statuses and stats for mixed promotions", () => {
    const promotions: Promotion[] = [
      makePromotion({
        id: "active1",
        title: "Active Promo",
        is_active: true,
        start_date: null,
        end_date: null,
      }),
      makePromotion({
        id: "scheduled1",
        title: "Scheduled Promo",
        is_active: true,
        start_date: "2024-07-01T00:00:00Z",
        end_date: null,
      }),
      makePromotion({
        id: "expired1",
        title: "Expired Promo",
        is_active: true,
        start_date: null,
        end_date: "2024-05-01T00:00:00Z",
      }),
      makePromotion({
        id: "paused1",
        title: "Paused Promo",
        is_active: false,
        start_date: null,
        end_date: null,
      }),
    ];

    const result = computePromotionsMetrics(promotions, "all", "", now);

    expect(result.statusMap.get("active1")).toBe("active");
    expect(result.statusMap.get("scheduled1")).toBe("scheduled");
    expect(result.statusMap.get("expired1")).toBe("expired");
    expect(result.statusMap.get("paused1")).toBe("paused");

    expect(result.stats[0].value).toBe(1); // Activas
    expect(result.stats[1].value).toBe(1); // Programadas
    expect(result.stats[2].value).toBe(0); // Este mes (created_at is now by default)

    expect(result.carouselPromotions.map((p) => p.id)).toEqual([
      "active1",
      "scheduled1",
    ]);

    expect(result.filterButtons).toEqual([
      { label: "Todas (4)", value: "all" },
      { label: "Programadas (1)", value: "scheduled" },
      { label: "Vencidas (1)", value: "expired" },
      { label: "Pausadas (1)", value: "paused" },
    ]);
  });

  it("filters by status", () => {
    const promotions: Promotion[] = [
      makePromotion({ id: "active1", is_active: true }),
      makePromotion({ id: "paused1", is_active: false }),
    ];

    const scheduledOnly = computePromotionsMetrics(promotions, "scheduled", "", now);
    expect(scheduledOnly.filtered.map((p) => p.id)).toEqual([]);

    const pausedOnly = computePromotionsMetrics(promotions, "paused", "", now);
    expect(pausedOnly.filtered.map((p) => p.id)).toEqual(["paused1"]);
  });

  it("filters by search term in title", () => {
    const promotions: Promotion[] = [
      makePromotion({ id: "p1", title: "Summer Sale" }),
      makePromotion({ id: "p2", title: "Winter Deal" }),
    ];

    const result = computePromotionsMetrics(promotions, "all", "summer", now);
    expect(result.filtered.map((p) => p.id)).toEqual(["p1"]);
  });

  it("filters by search term in keyword", () => {
    const promotions: Promotion[] = [
      makePromotion({ id: "p1", title: "Promo", keyword: "desayuno" }),
      makePromotion({ id: "p2", title: "Promo", keyword: "cena" }),
    ];

    const result = computePromotionsMetrics(promotions, "all", "desayuno", now);
    expect(result.filtered.map((p) => p.id)).toEqual(["p1"]);
  });

  it("counts promotions created this month correctly", () => {
    const thisMonth = new Date("2024-06-10T00:00:00Z").toISOString();
    const lastMonth = new Date("2024-05-10T00:00:00Z").toISOString();

    const promotions: Promotion[] = [
      makePromotion({ id: "p1", created_at: thisMonth }),
      makePromotion({ id: "p2", created_at: thisMonth }),
      makePromotion({ id: "p3", created_at: lastMonth }),
    ];

    const result = computePromotionsMetrics(promotions, "all", "", now);
    expect(result.stats[2].value).toBe(2); // Este mes
  });

  it("combines status filter and search", () => {
    const promotions: Promotion[] = [
      makePromotion({ id: "p1", title: "Summer Sale", is_active: true }),
      makePromotion({ id: "p2", title: "Summer Deal", is_active: false }),
      makePromotion({ id: "p3", title: "Winter Sale", is_active: true }),
    ];

    const result = computePromotionsMetrics(promotions, "all", "summer", now);
    expect(result.filtered.map((p) => p.id)).toEqual(["p1", "p2"]);
  });

  it("preserves promotion objects in filtered and carousel", () => {
    const promotion = makePromotion({ id: "p1", title: "Test" });
    const result = computePromotionsMetrics([promotion], "all", "", now);
    expect(result.filtered[0]).toBe(promotion);
    expect(result.carouselPromotions[0]).toBe(promotion);
  });
});
