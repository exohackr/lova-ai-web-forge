export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_persistent: boolean | null
          message: string
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_persistent?: boolean | null
          message: string
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_persistent?: boolean | null
          message?: string
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          id: string
          key_name: string
          key_value: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          key_name: string
          key_value: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          key_name?: string
          key_value?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      blacklisted_ips: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          ip_address: unknown
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          ip_address: unknown
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          ip_address?: unknown
          reason?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ban_expires_at: string | null
          created_at: string | null
          custom_color: string | null
          daily_uses_remaining: number | null
          display_style: string | null
          has_subscription: boolean | null
          id: string
          is_admin: boolean | null
          is_banned: boolean | null
          is_moderator: boolean | null
          last_reset_date: string | null
          last_username_change: string | null
          profile_picture: string | null
          registration_ip: unknown | null
          subscription_expires_at: string | null
          subscription_type: string | null
          tags: string[] | null
          total_uses: number | null
          username: string
        }
        Insert: {
          ban_expires_at?: string | null
          created_at?: string | null
          custom_color?: string | null
          daily_uses_remaining?: number | null
          display_style?: string | null
          has_subscription?: boolean | null
          id: string
          is_admin?: boolean | null
          is_banned?: boolean | null
          is_moderator?: boolean | null
          last_reset_date?: string | null
          last_username_change?: string | null
          profile_picture?: string | null
          registration_ip?: unknown | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          tags?: string[] | null
          total_uses?: number | null
          username: string
        }
        Update: {
          ban_expires_at?: string | null
          created_at?: string | null
          custom_color?: string | null
          daily_uses_remaining?: number | null
          display_style?: string | null
          has_subscription?: boolean | null
          id?: string
          is_admin?: boolean | null
          is_banned?: boolean | null
          is_moderator?: boolean | null
          last_reset_date?: string | null
          last_username_change?: string | null
          profile_picture?: string | null
          registration_ip?: unknown | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          tags?: string[] | null
          total_uses?: number | null
          username?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          id: string
          setting_name: string
          setting_value: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_name: string
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_name?: string
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      usage_logs: {
        Row: {
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reset_daily_uses: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
