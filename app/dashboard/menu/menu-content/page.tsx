import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CategoriesWorkflow from "@/components/categories/CategoriesWorkflow"

export default async function MenuContentPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: menu } = await supabase
    .from("menus")
    .select("id")          // solo necesitas el id, no todo el row
    .eq("user_id", user.id)
    .maybeSingle()

  if (!menu) return null

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("menu_id", menu.id)
    .order("position", { ascending: true })  // siempre ordenar en el servidor

  return (
    <div>
      <CategoriesWorkflow
        menuId={menu.id}
        categories={categories ?? []}  // nunca pasar null a un Client Component
      />
    </div>
  )
}