import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database.types";

export type Category = Tables<"categories">;

export type CreateCategoryInput = Pick<
  TablesInsert<"categories">,
  "menu_id" | "name"
> & {
  position?: number;
};

export type UpdateCategoryInput = Pick<
  TablesUpdate<"categories">,
  "name" | "position"
>;

export type ReorderCategoriesInput = {
  categories: Array<{ id: string; position: number }>;
};
