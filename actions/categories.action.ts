"use server"

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server"
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  ReorderCategoriesInput,
} from "@/types/categories.types"

export async function getCategories(
  menuId: string
): Promise<{ data: Category[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("menu_id", menuId)
    .order("position", { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function createCategory(
  input: CreateCategoryInput
): Promise<{ data: Category | null; error: string | null }> {
  const supabase = await createClient()

  const { count } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("menu_id", input.menu_id)

  const position = input.position ?? (count ?? 0)

  const { data, error } = await supabase
    .from("categories")
    .insert({ ...input, position })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath("/dashboard/menu/menu-content")
  return { data, error: null }
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<{ data: Category | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("categories")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function deleteCategory(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)

  if (error) return { error: error.message }
  return { error: null }
}

export async function reorderCategories(
  input: ReorderCategoriesInput
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  // Usa la RPC que ya tienes definida en tu schema: reorder_categories_batch
  const { error } = await supabase.rpc("reorder_categories_batch", {
    updates: input.categories,
  })

  if (error) return { error: error.message }
  return { error: null }
}