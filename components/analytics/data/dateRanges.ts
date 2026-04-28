import type { AnalyticsPeriod } from "../types";

export interface DateRange {
  start: Date;
  end: Date;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function endOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function getCurrentDateRange(
  period: AnalyticsPeriod,
  now = new Date(),
): DateRange {
  const end = new Date(now);

  if (period === "today") {
    return { start: startOfDay(end), end };
  }

  if (period === "week") {
    return { start: startOfDay(addDays(end, -6)), end };
  }

  return { start: startOfDay(addDays(end, -29)), end };
}

export function getPreviousDateRange(
  period: AnalyticsPeriod,
  current: DateRange,
): DateRange {
  if (period === "today") {
    const previousDay = addDays(current.start, -1);
    return {
      start: startOfDay(previousDay),
      end: endOfDay(previousDay),
    };
  }

  if (period === "week") {
    const end = new Date(current.start.getTime() - 1);
    const start = new Date(end.getTime() - (7 * DAY_IN_MS - 1));
    return {
      start: startOfDay(start),
      end,
    };
  }

  const end = new Date(current.start.getTime() - 1);
  const start = new Date(end.getTime() - (30 * DAY_IN_MS - 1));
  return {
    start: startOfDay(start),
    end,
  };
}
