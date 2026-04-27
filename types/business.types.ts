import type { Database } from "@/types/database.types";

export type Business = Database["public"]["Tables"]["business"]["Row"];

export type BusinessSettingsState =
  | { status: "idle"; message?: string; errors?: Record<string, string[]> }
  | { status: "success"; message: string; errors?: Record<string, string[]> }
  | { status: "error"; message: string; errors?: Record<string, string[]> };

export type ScheduleDay = {
  open: string;
  close: string;
  closed: boolean;
};

export type Schedule = Record<string, ScheduleDay>;