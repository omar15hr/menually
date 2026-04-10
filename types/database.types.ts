export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          menu_id: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          menu_id: string
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          menu_id?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_events: {
        Row: {
          business_id: string
          category_id: string | null
          created_at: string
          duration_seconds: number | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          product_id: string | null
          session_id: string
        }
        Insert: {
          business_id: string
          category_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          product_id?: string | null
          session_id?: string
        }
        Update: {
          business_id?: string
          category_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          product_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          bg_color: string
          bg_image_url: string | null
          created_at: string
          description_color: string
          id: string
          image_product_shape: string
          is_active: boolean
          layout_card: string
          logo_url: string | null
          price_color: string
          primary_color: string
          show_descriptions: boolean
          show_filters: boolean
          show_price: boolean
          slug: string
          text_color: string
          typography: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bg_color?: string
          bg_image_url?: string | null
          created_at?: string
          description_color?: string
          id?: string
          image_product_shape?: string
          is_active?: boolean
          layout_card?: string
          logo_url?: string | null
          price_color?: string
          primary_color?: string
          show_descriptions?: boolean
          show_filters?: boolean
          show_price?: boolean
          slug: string
          text_color?: string
          typography?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bg_color?: string
          bg_image_url?: string | null
          created_at?: string
          description_color?: string
          id?: string
          image_product_shape?: string
          is_active?: boolean
          layout_card?: string
          logo_url?: string | null
          price_color?: string
          primary_color?: string
          show_descriptions?: boolean
          show_filters?: boolean
          show_price?: boolean
          slug?: string
          text_color?: string
          typography?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          labels: Database["public"]["Enums"]["product_label"][] | null
          name: string
          position: number
          price: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          labels?: Database["public"]["Enums"]["product_label"][] | null
          name: string
          position?: number
          price?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          labels?: Database["public"]["Enums"]["product_label"][] | null
          name?: string
          position?: number
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          business_name: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          business_name?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      qr_scans: {
        Row: {
          business_id: string
          created_at: string
          device_type: Database["public"]["Enums"]["device_type"]
          id: string
          referrer: string | null
          scanned_at: string
          user_agent: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          device_type?: Database["public"]["Enums"]["device_type"]
          id?: string
          referrer?: string | null
          scanned_at?: string
          user_agent?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          device_type?: Database["public"]["Enums"]["device_type"]
          id?: string
          referrer?: string | null
          scanned_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          mp_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          mp_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          mp_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reorder_categories_batch: { Args: { updates: Json }; Returns: undefined }
    }
    Enums: {
      billing_cycle: "monthly" | "annual"
      device_type: "mobile" | "desktop" | "tablet"
      event_type:
        | "page_view"
        | "category_view"
        | "product_view"
        | "share"
        | "exit"
      font_family: "inter" | "roboto" | "montserrat"
      plan_type: "basic" | "pro"
      product_label:
        | "vegan"
        | "gluten_free"
        | "vegetarian"
        | "spicy"
        | "keto"
        | "aplv"
      subscription_status: "trial" | "active" | "past_due" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      billing_cycle: ["monthly", "annual"],
      device_type: ["mobile", "desktop", "tablet"],
      event_type: [
        "page_view",
        "category_view",
        "product_view",
        "share",
        "exit",
      ],
      font_family: ["inter", "roboto", "montserrat"],
      plan_type: ["basic", "pro"],
      product_label: [
        "vegan",
        "gluten_free",
        "vegetarian",
        "spicy",
        "keto",
        "aplv",
      ],
      subscription_status: ["trial", "active", "past_due", "cancelled"],
    },
  },
} as const
