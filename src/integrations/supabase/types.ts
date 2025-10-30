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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      amendment_requests: {
        Row: {
          client_profile_id: string
          created_at: string | null
          field_name: string
          id: string
          new_value: string
          old_value: string | null
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          user_id_client: string
          user_id_employee: string
        }
        Insert: {
          client_profile_id: string
          created_at?: string | null
          field_name: string
          id?: string
          new_value: string
          old_value?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id_client: string
          user_id_employee: string
        }
        Update: {
          client_profile_id?: string
          created_at?: string | null
          field_name?: string
          id?: string
          new_value?: string
          old_value?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id_client?: string
          user_id_employee?: string
        }
        Relationships: [
          {
            foreignKeyName: "amendment_requests_client_profile_id_fkey"
            columns: ["client_profile_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amendment_requests_user_id_client_fkey"
            columns: ["user_id_client"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_times: {
        Row: {
          blocked_date: string
          created_at: string
          end_time: string
          hairdresser_id: string
          id: string
          reason: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          blocked_date: string
          created_at?: string
          end_time: string
          hairdresser_id: string
          id?: string
          reason?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          blocked_date?: string
          created_at?: string
          end_time?: string
          hairdresser_id?: string
          id?: string
          reason?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_times_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "hairdressers"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          airtable_created_time: string | null
          appointment_date: string
          appointment_time: string
          assignee: string | null
          cancellation_reason: string | null
          created_at: string | null
          customer_id: string
          duration_minutes: number
          hairdresser_id: string | null
          id: string
          reference_number: string
          saloon: string | null
          service_id: string | null
          special_requests: string | null
          status: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          airtable_created_time?: string | null
          appointment_date: string
          appointment_time: string
          assignee?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          customer_id: string
          duration_minutes: number
          hairdresser_id?: string | null
          id?: string
          reference_number?: string
          saloon?: string | null
          service_id?: string | null
          special_requests?: string | null
          status?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          airtable_created_time?: string | null
          appointment_date?: string
          appointment_time?: string
          assignee?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          customer_id?: string
          duration_minutes?: number
          hairdresser_id?: string | null
          id?: string
          reference_number?: string
          saloon?: string | null
          service_id?: string | null
          special_requests?: string | null
          status?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "hairdressers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_saloon_foreign"
            columns: ["saloon"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          last_booking_date: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          profile_id: string
          province: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          last_booking_date?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          profile_id: string
          province?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          last_booking_date?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          profile_id?: string
          province?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          consent_type: string
          created_at: string | null
          granted_at: string | null
          id: string
          ip_address: unknown
          profile_id: string
          user_agent: string | null
          withdrawn_at: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string | null
          granted_at?: string | null
          id?: string
          ip_address?: unknown
          profile_id: string
          user_agent?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string | null
          granted_at?: string | null
          id?: string
          ip_address?: unknown
          profile_id?: string
          user_agent?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["employee_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["employee_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["employee_role"]
          user_id?: string
        }
        Relationships: []
      }
      hairdressers: {
        Row: {
          bio: string | null
          created_at: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          portfolio_images: string[] | null
          profile_id: string
          salon_id: string | null
          specializations: string[] | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          portfolio_images?: string[] | null
          profile_id: string
          salon_id?: string | null
          specializations?: string[] | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          portfolio_images?: string[] | null
          profile_id?: string
          salon_id?: string | null
          specializations?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hairdressers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hairdressers_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          paid_at: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          paid_at?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          paid_at?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_confirmations: boolean | null
          email_reminders: boolean | null
          id: string
          profile_id: string
          reminder_hours: number | null
          sms_confirmations: boolean | null
          sms_reminders: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_confirmations?: boolean | null
          email_reminders?: boolean | null
          id?: string
          profile_id: string
          reminder_hours?: number | null
          sms_confirmations?: boolean | null
          sms_reminders?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_confirmations?: boolean | null
          email_reminders?: boolean | null
          id?: string
          profile_id?: string
          reminder_hours?: number | null
          sms_confirmations?: boolean | null
          sms_reminders?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_verifications: {
        Row: {
          attempts: number | null
          created_at: string | null
          expires_at: string
          id: string
          otp_code: string
          phone_number: string
          profile_id: string
          verified: boolean | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          expires_at?: string
          id?: string
          otp_code: string
          phone_number: string
          profile_id: string
          verified?: boolean | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          expires_at?: string
          id?: string
          otp_code?: string
          phone_number?: string
          profile_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "otp_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          airtable_created_time: string | null
          airtable_record_id: string | null
          avatar_url: string | null
          bookings: string | null
          business_description: string | null
          business_name: string | null
          business_type: string | null
          city: string | null
          contact_number: string | null
          country: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          full_name: string | null
          id: string
          id_number: string | null
          marketing_consent: boolean | null
          name: string | null
          onboarding_completed: boolean
          payment_verified: boolean | null
          paystack_public_key: string | null
          paystack_status: string | null
          phone: string | null
          phone_verified: boolean | null
          preferred_language: string | null
          profile_information: string | null
          province: string | null
          ratings: number | null
          role: Database["public"]["Enums"]["user_role"]
          sms_marketing_consent: boolean | null
          surname: string | null
          updated_at: string | null
          user_id: string
          username: string | null
          verification_approved_at: string | null
          verification_status: string | null
          verification_submitted_at: string | null
        }
        Insert: {
          address?: string | null
          airtable_created_time?: string | null
          airtable_record_id?: string | null
          avatar_url?: string | null
          bookings?: string | null
          business_description?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          contact_number?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          id_number?: string | null
          marketing_consent?: boolean | null
          name?: string | null
          onboarding_completed?: boolean
          payment_verified?: boolean | null
          paystack_public_key?: string | null
          paystack_status?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          preferred_language?: string | null
          profile_information?: string | null
          province?: string | null
          ratings?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          sms_marketing_consent?: boolean | null
          surname?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          verification_approved_at?: string | null
          verification_status?: string | null
          verification_submitted_at?: string | null
        }
        Update: {
          address?: string | null
          airtable_created_time?: string | null
          airtable_record_id?: string | null
          avatar_url?: string | null
          bookings?: string | null
          business_description?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          contact_number?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          id_number?: string | null
          marketing_consent?: boolean | null
          name?: string | null
          onboarding_completed?: boolean
          payment_verified?: boolean | null
          paystack_public_key?: string | null
          paystack_status?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          preferred_language?: string | null
          profile_information?: string | null
          province?: string | null
          ratings?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          sms_marketing_consent?: boolean | null
          surname?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          verification_approved_at?: string | null
          verification_status?: string | null
          verification_submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_bookings_foreign"
            columns: ["bookings"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      salons: {
        Row: {
          address: string | null
          airtable_created_time: string | null
          airtable_record_id: string | null
          avatar_url: string | null
          bookings: string | null
          business_hours: Json | null
          created_at: string | null
          description: string | null
          email: string | null
          hairdressers: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          owner_id: string
          phone: string | null
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          airtable_created_time?: string | null
          airtable_record_id?: string | null
          avatar_url?: string | null
          bookings?: string | null
          business_hours?: Json | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          hairdressers?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          owner_id: string
          phone?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          airtable_created_time?: string | null
          airtable_record_id?: string | null
          avatar_url?: string | null
          bookings?: string | null
          business_hours?: Json | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          hairdressers?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          owner_id?: string
          phone?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salons_bookings_foreign"
            columns: ["bookings"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salons_hairdressers_foreign"
            columns: ["hairdressers"]
            isOneToOne: false
            referencedRelation: "hairdressers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salons_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_booking_tokens: {
        Row: {
          booking_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          token: string
          used_at: string | null
          user_agent: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          token: string
          used_at?: string | null
          user_agent?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          token?: string
          used_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secure_booking_tokens_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number
          hairdresser_id: string
          id: string
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          hairdresser_id: string
          id?: string
          is_active?: boolean | null
          name: string
          price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          hairdresser_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "hairdressers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          document_type: string
          file_path: string
          id: string
          profile_id: string
          uploaded_at: string | null
          verified: boolean | null
        }
        Insert: {
          document_type: string
          file_path: string
          id?: string
          profile_id: string
          uploaded_at?: string | null
          verified?: boolean | null
        }
        Update: {
          document_type?: string
          file_path?: string
          id?: string
          profile_id?: string
          uploaded_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_profile_id_fkey"
            columns: ["profile_id"]
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
      has_employee_role: {
        Args: {
          _role: Database["public"]["Enums"]["employee_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "customer"
        | "hairdresser"
        | "employee"
        | "salon_owner"
        | "admin"
      employee_role: "employee" | "super_user"
      user_role: "customer" | "hairdresser" | "salon_owner"
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
      app_role: ["customer", "hairdresser", "employee", "salon_owner", "admin"],
      employee_role: ["employee", "super_user"],
      user_role: ["customer", "hairdresser", "salon_owner"],
    },
  },
} as const
