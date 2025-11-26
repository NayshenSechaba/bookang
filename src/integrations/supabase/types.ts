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
          {
            foreignKeyName: "amendment_requests_user_id_client_fkey"
            columns: ["user_id_client"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "amendment_requests_user_id_client_fkey"
            columns: ["user_id_client"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
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
          {
            foreignKeyName: "blocked_times_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_booking_status"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "blocked_times_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_business_rankings"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "blocked_times_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_commission_data"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "blocked_times_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_performer_ratings"
            referencedColumns: ["hairdresser_id"]
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
          customer_phone: string | null
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
          customer_phone?: string | null
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
          customer_phone?: string | null
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
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "bookings_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "hairdressers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_booking_status"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "bookings_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_business_rankings"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "bookings_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_commission_data"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "bookings_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_performer_ratings"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "bookings_saloon_foreign"
            columns: ["saloon"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_saloon_foreign"
            columns: ["saloon"]
            isOneToOne: false
            referencedRelation: "vw_booking_status"
            referencedColumns: ["salon_id"]
          },
          {
            foreignKeyName: "bookings_saloon_foreign"
            columns: ["saloon"]
            isOneToOne: false
            referencedRelation: "vw_commission_data"
            referencedColumns: ["salon_id"]
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
      business_payment_settings: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          paystack_subaccount_code: string | null
          profile_id: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          paystack_subaccount_code?: string | null
          profile_id: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          paystack_subaccount_code?: string | null
          profile_id?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_payment_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_payment_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "business_payment_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "business_payment_settings_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_payment_settings_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "business_payment_settings_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      business_verification_checklist: {
        Row: {
          created_at: string
          documents_uploaded: boolean
          documents_verified_at: string | null
          documents_verified_by: string | null
          final_approval: boolean
          final_approved_at: string | null
          final_approved_by: string | null
          id: string
          paystack_business_name: string | null
          paystack_business_verified: boolean
          paystack_business_verified_at: string | null
          paystack_business_verified_by: string | null
          paystack_code_added: boolean
          paystack_code_verified_at: string | null
          paystack_code_verified_by: string | null
          profile_id: string
          updated_at: string
          verification_notes: string | null
        }
        Insert: {
          created_at?: string
          documents_uploaded?: boolean
          documents_verified_at?: string | null
          documents_verified_by?: string | null
          final_approval?: boolean
          final_approved_at?: string | null
          final_approved_by?: string | null
          id?: string
          paystack_business_name?: string | null
          paystack_business_verified?: boolean
          paystack_business_verified_at?: string | null
          paystack_business_verified_by?: string | null
          paystack_code_added?: boolean
          paystack_code_verified_at?: string | null
          paystack_code_verified_by?: string | null
          profile_id: string
          updated_at?: string
          verification_notes?: string | null
        }
        Update: {
          created_at?: string
          documents_uploaded?: boolean
          documents_verified_at?: string | null
          documents_verified_by?: string | null
          final_approval?: boolean
          final_approved_at?: string | null
          final_approved_by?: string | null
          id?: string
          paystack_business_name?: string | null
          paystack_business_verified?: boolean
          paystack_business_verified_at?: string | null
          paystack_business_verified_by?: string | null
          paystack_code_added?: boolean
          paystack_code_verified_at?: string | null
          paystack_code_verified_by?: string | null
          profile_id?: string
          updated_at?: string
          verification_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_verification_checkli_paystack_business_verified_b_fkey"
            columns: ["paystack_business_verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_verification_checkli_paystack_business_verified_b_fkey"
            columns: ["paystack_business_verified_by"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "business_verification_checkli_paystack_business_verified_b_fkey"
            columns: ["paystack_business_verified_by"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "business_verification_checklist_documents_verified_by_fkey"
            columns: ["documents_verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_verification_checklist_documents_verified_by_fkey"
            columns: ["documents_verified_by"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "business_verification_checklist_documents_verified_by_fkey"
            columns: ["documents_verified_by"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "business_verification_checklist_final_approved_by_fkey"
            columns: ["final_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_verification_checklist_final_approved_by_fkey"
            columns: ["final_approved_by"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "business_verification_checklist_final_approved_by_fkey"
            columns: ["final_approved_by"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "business_verification_checklist_paystack_code_verified_by_fkey"
            columns: ["paystack_code_verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_verification_checklist_paystack_code_verified_by_fkey"
            columns: ["paystack_code_verified_by"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "business_verification_checklist_paystack_code_verified_by_fkey"
            columns: ["paystack_code_verified_by"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "business_verification_checklist_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_verification_checklist_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "business_verification_checklist_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
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
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "client_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
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
          {
            foreignKeyName: "consent_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "consent_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
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
            foreignKeyName: "hairdressers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "hairdressers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "hairdressers_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hairdressers_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "vw_booking_status"
            referencedColumns: ["salon_id"]
          },
          {
            foreignKeyName: "hairdressers_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "vw_commission_data"
            referencedColumns: ["salon_id"]
          },
        ]
      }
      inbox_messages: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          message_type: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          message_type: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          message_type?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inbox_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbox_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "inbox_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
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
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vw_booking_status"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vw_commission_data"
            referencedColumns: ["booking_id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body_template: string
          created_at: string | null
          id: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          subject: string
          template_name: string
          updated_at: string | null
        }
        Insert: {
          body_template: string
          created_at?: string | null
          id?: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          subject: string
          template_name: string
          updated_at?: string | null
        }
        Update: {
          body_template?: string
          created_at?: string | null
          id?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          subject?: string
          template_name?: string
          updated_at?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      notifications: {
        Row: {
          booking_id: string | null
          booking_reference: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message_body: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient_id: string
          sender_id: string | null
          subject: string
          user_type: string
        }
        Insert: {
          booking_id?: string | null
          booking_reference?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_body: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient_id: string
          sender_id?: string | null
          subject: string
          user_type: string
        }
        Update: {
          booking_id?: string | null
          booking_reference?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_body?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          recipient_id?: string
          sender_id?: string | null
          subject?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vw_booking_status"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vw_commission_data"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
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
          {
            foreignKeyName: "otp_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "otp_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          currency: string
          customer_email: string
          customer_id: string | null
          id: string
          metadata: Json | null
          paid_at: string | null
          reference: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_id?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          reference: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_id?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          reference?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vw_booking_status"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vw_commission_data"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          airtable_created_time: string | null
          airtable_record_id: string | null
          avatar_url: string | null
          banner_url: string | null
          bookings: string | null
          business_address: string | null
          business_city: string | null
          business_description: string | null
          business_email: string | null
          business_hours: Json | null
          business_name: string | null
          business_phone: string | null
          business_postal_code: string | null
          business_province: string | null
          business_type: string | null
          city: string | null
          contact_number: string | null
          country: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          facebook_url: string | null
          full_name: string | null
          id: string
          id_number: string | null
          instagram_url: string | null
          latitude: number | null
          longitude: number | null
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
          tiktok_url: string | null
          twitter_url: string | null
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
          banner_url?: string | null
          bookings?: string | null
          business_address?: string | null
          business_city?: string | null
          business_description?: string | null
          business_email?: string | null
          business_hours?: Json | null
          business_name?: string | null
          business_phone?: string | null
          business_postal_code?: string | null
          business_province?: string | null
          business_type?: string | null
          city?: string | null
          contact_number?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          id_number?: string | null
          instagram_url?: string | null
          latitude?: number | null
          longitude?: number | null
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
          tiktok_url?: string | null
          twitter_url?: string | null
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
          banner_url?: string | null
          bookings?: string | null
          business_address?: string | null
          business_city?: string | null
          business_description?: string | null
          business_email?: string | null
          business_hours?: Json | null
          business_name?: string | null
          business_phone?: string | null
          business_postal_code?: string | null
          business_province?: string | null
          business_type?: string | null
          city?: string | null
          contact_number?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          id_number?: string | null
          instagram_url?: string | null
          latitude?: number | null
          longitude?: number | null
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
          tiktok_url?: string | null
          twitter_url?: string | null
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
          {
            foreignKeyName: "profiles_bookings_foreign"
            columns: ["bookings"]
            isOneToOne: false
            referencedRelation: "vw_booking_status"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "profiles_bookings_foreign"
            columns: ["bookings"]
            isOneToOne: false
            referencedRelation: "vw_commission_data"
            referencedColumns: ["booking_id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string | null
          customer_id: string
          flagged: boolean | null
          hairdresser_id: string
          id: string
          rating: number
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string | null
          customer_id: string
          flagged?: boolean | null
          hairdresser_id: string
          id?: string
          rating: number
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string | null
          customer_id?: string
          flagged?: boolean | null
          hairdresser_id?: string
          id?: string
          rating?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vw_booking_status"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vw_commission_data"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "reviews_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "hairdressers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_booking_status"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "reviews_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_business_rankings"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "reviews_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_commission_data"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "reviews_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_performer_ratings"
            referencedColumns: ["hairdresser_id"]
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
            foreignKeyName: "salons_bookings_foreign"
            columns: ["bookings"]
            isOneToOne: false
            referencedRelation: "vw_booking_status"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "salons_bookings_foreign"
            columns: ["bookings"]
            isOneToOne: false
            referencedRelation: "vw_commission_data"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "salons_hairdressers_foreign"
            columns: ["hairdressers"]
            isOneToOne: false
            referencedRelation: "hairdressers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salons_hairdressers_foreign"
            columns: ["hairdressers"]
            isOneToOne: false
            referencedRelation: "vw_booking_status"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "salons_hairdressers_foreign"
            columns: ["hairdressers"]
            isOneToOne: false
            referencedRelation: "vw_business_rankings"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "salons_hairdressers_foreign"
            columns: ["hairdressers"]
            isOneToOne: false
            referencedRelation: "vw_commission_data"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "salons_hairdressers_foreign"
            columns: ["hairdressers"]
            isOneToOne: false
            referencedRelation: "vw_performer_ratings"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "salons_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salons_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "salons_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
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
          {
            foreignKeyName: "secure_booking_tokens_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vw_booking_status"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "secure_booking_tokens_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vw_commission_data"
            referencedColumns: ["booking_id"]
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
          {
            foreignKeyName: "services_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_booking_status"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "services_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_business_rankings"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "services_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_commission_data"
            referencedColumns: ["hairdresser_id"]
          },
          {
            foreignKeyName: "services_hairdresser_id_fkey"
            columns: ["hairdresser_id"]
            isOneToOne: false
            referencedRelation: "vw_performer_ratings"
            referencedColumns: ["hairdresser_id"]
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
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status"]
          uploaded_at: string | null
          verified: boolean | null
        }
        Insert: {
          document_type: string
          file_path: string
          id?: string
          profile_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          uploaded_at?: string | null
          verified?: boolean | null
        }
        Update: {
          document_type?: string
          file_path?: string
          id?: string
          profile_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
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
          {
            foreignKeyName: "verification_documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "verification_documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      verification_email_logs: {
        Row: {
          created_at: string | null
          email_body: string
          email_subject: string
          error_message: string | null
          id: string
          profile_id: string
          sent_at: string | null
          sent_by: string | null
          sent_to: string
          status: string
          success: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_body: string
          email_subject: string
          error_message?: string | null
          id?: string
          profile_id: string
          sent_at?: string | null
          sent_by?: string | null
          sent_to: string
          status: string
          success?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_body?: string
          email_subject?: string
          error_message?: string | null
          id?: string
          profile_id?: string
          sent_at?: string | null
          sent_by?: string | null
          sent_to?: string
          status?: string
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_email_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_email_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "verification_email_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "verification_email_logs_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_email_logs_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "vw_customer_rankings"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "verification_email_logs_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "vw_onboarding_status"
            referencedColumns: ["profile_id"]
          },
        ]
      }
    }
    Views: {
      vw_booking_status: {
        Row: {
          appointment_date: string | null
          booking_id: string | null
          client_name: string | null
          created_at: string | null
          hairdresser_id: string | null
          salon_id: string | null
          salon_name: string | null
          service_name: string | null
          status: string | null
          total_price: number | null
        }
        Relationships: []
      }
      vw_business_rankings: {
        Row: {
          average_rating: number | null
          business_name: string | null
          five_star_count: number | null
          flagged_reviews: number | null
          hairdresser_id: string | null
          last_review_date: string | null
          one_star_count: number | null
          review_response_rate: number | null
          total_completed_bookings: number | null
          total_reviews: number | null
        }
        Relationships: []
      }
      vw_commission_data: {
        Row: {
          appointment_date: string | null
          booking_id: string | null
          commission_amount: number | null
          commission_rate_percent: number | null
          hairdresser_email: string | null
          hairdresser_id: string | null
          hairdresser_name: string | null
          month: number | null
          month_year: string | null
          salon_id: string | null
          salon_name: string | null
          service_cost: number | null
          status: string | null
          year: number | null
        }
        Relationships: []
      }
      vw_customer_rankings: {
        Row: {
          average_rating_given: number | null
          cancelled_bookings: number | null
          completed_bookings: number | null
          completion_rate: number | null
          customer_id: string | null
          customer_name: string | null
          email: string | null
          flagged_reviews_given: number | null
          last_review_date: string | null
          low_ratings_given: number | null
          no_show_count: number | null
          total_bookings: number | null
          total_reviews_given: number | null
        }
        Relationships: []
      }
      vw_onboarding_status: {
        Row: {
          created_at: string | null
          email: string | null
          email_verified: boolean | null
          full_name: string | null
          is_verified: boolean | null
          onboarding_completed: boolean | null
          onboarding_stage: string | null
          payment_verified: boolean | null
          phone_verified: boolean | null
          profile_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string | null
          verification_status: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          is_verified?: never
          onboarding_completed?: boolean | null
          onboarding_stage?: never
          payment_verified?: boolean | null
          phone_verified?: boolean | null
          profile_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
          verification_status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          is_verified?: never
          onboarding_completed?: boolean | null
          onboarding_stage?: never
          payment_verified?: boolean | null
          phone_verified?: boolean | null
          profile_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      vw_performer_ratings: {
        Row: {
          completion_rate: number | null
          hairdresser_id: string | null
          hairdresser_name: string | null
          salon_name: string | null
          total_bookings: number | null
          total_cancellations: number | null
          total_completed_bookings: number | null
          total_no_shows: number | null
        }
        Relationships: []
      }
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
      notification_type:
        | "booking_confirmation"
        | "cancellation_alert"
        | "review_request"
        | "new_review"
        | "booking_modification"
        | "system_alert"
      user_role: "customer" | "hairdresser" | "salon_owner"
      verification_status: "pending" | "verified" | "rejected" | "outstanding"
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
      notification_type: [
        "booking_confirmation",
        "cancellation_alert",
        "review_request",
        "new_review",
        "booking_modification",
        "system_alert",
      ],
      user_role: ["customer", "hairdresser", "salon_owner"],
      verification_status: ["pending", "verified", "rejected", "outstanding"],
    },
  },
} as const
