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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          cancel_token: string
          cancel_token_used_at: string | null
          cancelled_at: string | null
          email: string
          purge_after: string
          purged_at: string | null
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          cancel_token: string
          cancel_token_used_at?: string | null
          cancelled_at?: string | null
          email: string
          purge_after: string
          purged_at?: string | null
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          cancel_token?: string
          cancel_token_used_at?: string | null
          cancelled_at?: string | null
          email?: string
          purge_after?: string
          purged_at?: string | null
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_access_log: {
        Row: {
          created_at: string
          endpoint: string | null
          id: string
          ip: string | null
          reason: string | null
          role_result: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint?: string | null
          id?: string
          ip?: string | null
          reason?: string | null
          role_result?: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string | null
          id?: string
          ip?: string | null
          reason?: string | null
          role_result?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      aid_requests: {
        Row: {
          age: number | null
          caregiver_name: string | null
          city: string | null
          country: string | null
          created_at: string
          device_condition: string | null
          disability_category: string | null
          email: string | null
          full_name: string
          gender: string | null
          has_existing_device: string | null
          id: string
          is_caregiver: string | null
          phone: string | null
          requested_aid: string | null
          status: string
          story: string | null
          tracking_code: string
          updated_at: string
          urgency_level: string | null
        }
        Insert: {
          age?: number | null
          caregiver_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_condition?: string | null
          disability_category?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          has_existing_device?: string | null
          id?: string
          is_caregiver?: string | null
          phone?: string | null
          requested_aid?: string | null
          status?: string
          story?: string | null
          tracking_code: string
          updated_at?: string
          urgency_level?: string | null
        }
        Update: {
          age?: number | null
          caregiver_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_condition?: string | null
          disability_category?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          has_existing_device?: string | null
          id?: string
          is_caregiver?: string | null
          phone?: string | null
          requested_aid?: string | null
          status?: string
          story?: string | null
          tracking_code?: string
          updated_at?: string
          urgency_level?: string | null
        }
        Relationships: []
      }
      budgets: {
        Row: {
          category_id: string | null
          created_at: string
          fiscal_year: number
          id: string
          planned_cents: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          fiscal_year: number
          id?: string
          planned_cents?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          fiscal_year?: number
          id?: string
          planned_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_interactions: {
        Row: {
          body: string | null
          completed: boolean
          contact_id: string
          created_at: string
          created_by: string | null
          follow_up_at: string | null
          id: string
          occurred_at: string
          subject: string | null
          type: Database["public"]["Enums"]["interaction_type"]
          updated_at: string
        }
        Insert: {
          body?: string | null
          completed?: boolean
          contact_id: string
          created_at?: string
          created_by?: string | null
          follow_up_at?: string | null
          id?: string
          occurred_at?: string
          subject?: string | null
          type?: Database["public"]["Enums"]["interaction_type"]
          updated_at?: string
        }
        Update: {
          body?: string | null
          completed?: boolean
          contact_id?: string
          created_at?: string
          created_by?: string | null
          follow_up_at?: string | null
          id?: string
          occurred_at?: string
          subject?: string | null
          type?: Database["public"]["Enums"]["interaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          country: string | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          lifecycle_stage: Database["public"]["Enums"]["lifecycle_stage"]
          notes: string | null
          organization: string | null
          phone: string | null
          source: string | null
          tags: string[]
          type: Database["public"]["Enums"]["contact_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          lifecycle_stage?: Database["public"]["Enums"]["lifecycle_stage"]
          notes?: string | null
          organization?: string | null
          phone?: string | null
          source?: string | null
          tags?: string[]
          type?: Database["public"]["Enums"]["contact_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          lifecycle_stage?: Database["public"]["Enums"]["lifecycle_stage"]
          notes?: string | null
          organization?: string | null
          phone?: string | null
          source?: string | null
          tags?: string[]
          type?: Database["public"]["Enums"]["contact_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      coordinator_registrations: {
        Row: {
          aid_types: string[] | null
          country: string
          created_at: string
          email: string
          estimated_beneficiaries: number | null
          full_name: string
          id: string
          languages: string | null
          notes: string | null
          organisation: string | null
          phone: string | null
          region: string | null
          role_title: string | null
          status: string
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          aid_types?: string[] | null
          country: string
          created_at?: string
          email: string
          estimated_beneficiaries?: number | null
          full_name: string
          id?: string
          languages?: string | null
          notes?: string | null
          organisation?: string | null
          phone?: string | null
          region?: string | null
          role_title?: string | null
          status?: string
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          aid_types?: string[] | null
          country?: string
          created_at?: string
          email?: string
          estimated_beneficiaries?: number | null
          full_name?: string
          id?: string
          languages?: string | null
          notes?: string | null
          organisation?: string | null
          phone?: string | null
          region?: string | null
          role_title?: string | null
          status?: string
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      donation_intents: {
        Row: {
          amount_cents: number
          channel: string
          created_at: string
          currency: string
          donor_country: string | null
          donor_email: string | null
          donor_name: string | null
          donor_phone: string | null
          frequency: string
          id: string
          is_anonymous: boolean
          message: string | null
          reference: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          channel: string
          created_at?: string
          currency?: string
          donor_country?: string | null
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          frequency?: string
          id?: string
          is_anonymous?: boolean
          message?: string | null
          reference: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          channel?: string
          created_at?: string
          currency?: string
          donor_country?: string | null
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          frequency?: string
          id?: string
          is_anonymous?: boolean
          message?: string | null
          reference?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount_cents: number
          contact_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          designation: string | null
          donor_email: string | null
          donor_name: string | null
          id: string
          is_anonymous: boolean
          message: string | null
          method: Database["public"]["Enums"]["donation_method"]
          notes: string | null
          receipt_number: number | null
          received_at: string
          status: Database["public"]["Enums"]["donation_status"]
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          designation?: string | null
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean
          message?: string | null
          method?: Database["public"]["Enums"]["donation_method"]
          notes?: string | null
          receipt_number?: number | null
          received_at?: string
          status?: Database["public"]["Enums"]["donation_status"]
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          designation?: string | null
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean
          message?: string | null
          method?: Database["public"]["Enums"]["donation_method"]
          notes?: string | null
          receipt_number?: number | null
          received_at?: string
          status?: Database["public"]["Enums"]["donation_status"]
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_preferences: {
        Row: {
          account: boolean
          coordinators: boolean
          created_at: string
          email: string
          events: boolean
          fundraisers: boolean
          id: string
          receipts: boolean
          unsubscribed_all: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account?: boolean
          coordinators?: boolean
          created_at?: string
          email: string
          events?: boolean
          fundraisers?: boolean
          id?: string
          receipts?: boolean
          unsubscribed_all?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account?: boolean
          coordinators?: boolean
          created_at?: string
          email?: string
          events?: boolean
          fundraisers?: boolean
          id?: string
          receipts?: boolean
          unsubscribed_all?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string
          email: string
          event_external_id: string | null
          event_title: string
          full_name: string
          id: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          event_external_id?: string | null
          event_title: string
          full_name: string
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_external_id?: string | null
          event_title?: string
          full_name?: string
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          location: string | null
          rsvp_url: string | null
          slug: string
          starts_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          rsvp_url?: string | null
          slug: string
          starts_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          rsvp_url?: string | null
          slug?: string
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          annual_budget_cents: number
          created_at: string
          id: string
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          annual_budget_cents?: number
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          annual_budget_cents?: number
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount_cents: number
          category_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string
          id: string
          incurred_at: string
          paid_at: string | null
          program_pillar: string | null
          receipt_url: string | null
          status: Database["public"]["Enums"]["expense_status"]
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount_cents: number
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description: string
          id?: string
          incurred_at?: string
          paid_at?: string | null
          program_pillar?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount_cents?: number
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string
          id?: string
          incurred_at?: string
          paid_at?: string | null
          program_pillar?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      fundraiser_registrations: {
        Row: {
          city: string | null
          created_at: string
          email: string
          event_date: string | null
          event_id: string | null
          event_type: string | null
          expected_participants: number | null
          full_name: string
          fundraising_goal_cents: number | null
          id: string
          message: string | null
          phone: string | null
          postcode: string | null
          prior_experience: string | null
          state: string
          status: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          event_date?: string | null
          event_id?: string | null
          event_type?: string | null
          expected_participants?: number | null
          full_name: string
          fundraising_goal_cents?: number | null
          id?: string
          message?: string | null
          phone?: string | null
          postcode?: string | null
          prior_experience?: string | null
          state: string
          status?: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          event_date?: string | null
          event_id?: string | null
          event_type?: string | null
          expected_participants?: number | null
          full_name?: string
          fundraising_goal_cents?: number | null
          id?: string
          message?: string | null
          phone?: string | null
          postcode?: string | null
          prior_experience?: string | null
          state?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fundraiser_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt: string
          created_at: string
          height: number | null
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          tags: string[]
          uploaded_by: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt?: string
          created_at?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          tags?: string[]
          uploaded_by?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt?: string
          created_at?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          tags?: string[]
          uploaded_by?: string | null
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author_id: string | null
          body_md: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body_md?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body_md?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_settings: {
        Row: {
          content: Json
          page_key: string
          published: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          page_key: string
          published?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          page_key?: string
          published?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      partner_inquiries: {
        Row: {
          contact_person: string
          created_at: string
          email: string
          id: string
          message: string | null
          org_name: string
          org_type: string | null
          partnership_type: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          contact_person: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          org_name: string
          org_type?: string | null
          partnership_type?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          org_name?: string
          org_type?: string | null
          partnership_type?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      password_history: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      processed_stripe_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          bucket: string
          count: number
          created_at: string
          id: string
          key: string
          window_start: string
        }
        Insert: {
          bucket: string
          count?: number
          created_at?: string
          id?: string
          key: string
          window_start: string
        }
        Update: {
          bucket?: string
          count?: number
          created_at?: string
          id?: string
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          created_at: string
          donation_id: string
          id: string
          issued_at: string
          issued_by: string | null
          receipt_number: number
          storage_path: string
        }
        Insert: {
          created_at?: string
          donation_id: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          receipt_number: number
          storage_path: string
        }
        Update: {
          created_at?: string
          donation_id?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          receipt_number?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          photo_url: string | null
          role_title: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          photo_url?: string | null
          role_title: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          photo_url?: string | null
          role_title?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          created_at: string
          details: Json
          email: string | null
          event_type: string
          id: string
          ip: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json
          email?: string | null
          event_type: string
          id?: string
          ip?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json
          email?: string | null
          event_type?: string
          id?: string
          ip?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_applications: {
        Row: {
          availability: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          skills: string[]
          status: string
          updated_at: string
        }
        Insert: {
          availability?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          skills?: string[]
          status?: string
          updated_at?: string
        }
        Update: {
          availability?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          skills?: string[]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      staff_members_public: {
        Row: {
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          is_active: boolean | null
          photo_url: string | null
          role_title: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          photo_url?: string | null
          role_title?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          photo_url?: string | null
          role_title?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_password_reuse: {
        Args: { _new_password: string; _user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          _bucket: string
          _key: string
          _max: number
          _window_seconds: number
        }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      record_password_hash: {
        Args: { _new_password: string; _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "member" | "staff"
      contact_type: "donor" | "lead" | "partner" | "volunteer" | "beneficiary"
      donation_method:
        | "stripe"
        | "cash"
        | "bank_transfer"
        | "cheque"
        | "mobile_money"
        | "other"
      donation_status: "pending" | "completed" | "refunded" | "failed"
      expense_status: "planned" | "approved" | "paid" | "cancelled"
      interaction_type: "email" | "call" | "meeting" | "note" | "task"
      lifecycle_stage: "lead" | "qualified" | "engaged" | "donor" | "lapsed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "editor", "member", "staff"],
      contact_type: ["donor", "lead", "partner", "volunteer", "beneficiary"],
      donation_method: [
        "stripe",
        "cash",
        "bank_transfer",
        "cheque",
        "mobile_money",
        "other",
      ],
      donation_status: ["pending", "completed", "refunded", "failed"],
      expense_status: ["planned", "approved", "paid", "cancelled"],
      interaction_type: ["email", "call", "meeting", "note", "task"],
      lifecycle_stage: ["lead", "qualified", "engaged", "donor", "lapsed"],
    },
  },
} as const
