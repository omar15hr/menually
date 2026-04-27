import type { Database } from "@/types/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type ContactDataState =
  | { status: "idle"; message?: string; errors?: Record<string, string[]> }
  | { status: "success"; message: string; errors?: Record<string, string[]> }
  | { status: "error"; message: string; errors?: Record<string, string[]> };

export type PasswordChangeState =
  | { status: "idle"; message?: string; errors?: Record<string, string[]> }
  | { status: "success"; message: string; errors?: Record<string, string[]> }
  | { status: "error"; message: string; errors?: Record<string, string[]> };