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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      booking_requests: {
        Row: {
          created_at: string
          hostel_id: string
          id: string
          message: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hostel_id: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hostel_id?: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          location: string
          image_url: string | null
          meta: Json
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          location: string
          image_url?: string | null
          meta?: Json
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          location?: string
          image_url?: string | null
          meta?: Json
          created_at?: string
        }
        Relationships: []
      }
      hostels: {
        Row: {
          amenities: string[] | null
          available_rooms: number | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          name: string
          price_per_month: number
          rating: number | null
          short_description: string | null
          state: string | null
          total_reviews: number | null
          total_rooms: number | null
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          available_rooms?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          name: string
          price_per_month: number
          rating?: number | null
          short_description?: string | null
          state?: string | null
          total_reviews?: number | null
          total_rooms?: number | null
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          available_rooms?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          name?: string
          price_per_month?: number
          rating?: number | null
          short_description?: string | null
          state?: string | null
          total_reviews?: number | null
          total_rooms?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      places_to_visit: {
        Row: {
          address: string
          category: string | null
          city: string
          contact_number: string | null
          created_at: string
          description: string | null
          entry_fee: string | null
          id: string
          images: string[] | null
          name: string
          opening_hours: string | null
          rating: number | null
          short_description: string | null
          state: string
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          address: string
          category?: string | null
          city: string
          contact_number?: string | null
          created_at?: string
          description?: string | null
          entry_fee?: string | null
          id?: string
          images?: string[] | null
          name: string
          opening_hours?: string | null
          rating?: number | null
          short_description?: string | null
          state: string
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          category?: string | null
          city?: string
          contact_number?: string | null
          created_at?: string
          description?: string | null
          entry_fee?: string | null
          id?: string
          images?: string[] | null
          name?: string
          opening_hours?: string | null
          rating?: number | null
          short_description?: string | null
          state?: string
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          mobile_number: string | null
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          mobile_number?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          mobile_number?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string
          city: string
          contact_number: string | null
          created_at: string
          cuisine_type: string | null
          description: string | null
          id: string
          images: string[] | null
          name: string
          opening_hours: string | null
          price_range: string | null
          rating: number | null
          short_description: string | null
          state: string
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          contact_number?: string | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          name: string
          opening_hours?: string | null
          price_range?: string | null
          rating?: number | null
          short_description?: string | null
          state: string
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          contact_number?: string | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          name?: string
          opening_hours?: string | null
          price_range?: string | null
          rating?: number | null
          short_description?: string | null
          state?: string
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          hostel_id: string
          id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          hostel_id: string
          id?: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          hostel_id?: string
          id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_with_phone: {
        Args: { full_name: string; phone_number: string }
        Returns: {
          error_message: string
          success: boolean
          user_id: string
        }[]
      }
      insert_hostels_direct: {
        Args: Record<string, never>
        Returns: {
          id: string
          name: string
          address: string
          city: string
          state: string
        }[]
      }
      verify_user_phone: {
        Args: { phone_number: string }
        Returns: {
          user_data: Json
        }[]
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
    Enums: {},
  },
} as const
