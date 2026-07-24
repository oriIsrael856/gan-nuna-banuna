export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRoleDb = "parent" | "teacher" | "admin" | "platform_admin";
export type AttendanceStatusDb = "arrived" | "not_arrived" | "late" | "left_early";
export type ContractStatusDb =
  | "draft"
  | "sent"
  | "viewed"
  | "signed"
  | "declined"
  | "expired"
  | "error";

export interface Database {
  public: {
    Tables: {
      daycares: {
        Row: { id: string; name: string; client_id: string; created_at: string };
        Insert: { id?: string; name: string; client_id: string; created_at?: string };
        Update: { id?: string; name?: string; client_id?: string; created_at?: string };
        Relationships: [];
      };
      daycare_settings: {
        Row: {
          daycare_id: string;
          owner_name: string | null;
          tagline: string | null;
          subtitle: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          background_color: string | null;
          card_background_color: string | null;
          text_primary_color: string | null;
          text_secondary_color: string | null;
          support_phone: string | null;
          support_email: string | null;
          logo_url: string | null;
          setup_completed: boolean;
          setup_completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          daycare_id: string;
          owner_name?: string | null;
          tagline?: string | null;
          subtitle?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          background_color?: string | null;
          card_background_color?: string | null;
          text_primary_color?: string | null;
          text_secondary_color?: string | null;
          support_phone?: string | null;
          support_email?: string | null;
          logo_url?: string | null;
          setup_completed?: boolean;
          setup_completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          owner_name?: string | null;
          tagline?: string | null;
          subtitle?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          background_color?: string | null;
          card_background_color?: string | null;
          text_primary_color?: string | null;
          text_secondary_color?: string | null;
          support_phone?: string | null;
          support_email?: string | null;
          logo_url?: string | null;
          setup_completed?: boolean;
          setup_completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      daycare_hero_images: {
        Row: {
          daycare_id: string;
          hero_key: string;
          storage_path: string;
          updated_at: string;
        };
        Insert: {
          daycare_id: string;
          hero_key: string;
          storage_path: string;
          updated_at?: string;
        };
        Update: {
          storage_path?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          daycare_id: string | null;
          role: UserRoleDb;
          full_name: string;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          daycare_id?: string | null;
          role: UserRoleDb;
          full_name: string;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          daycare_id?: string | null;
          role?: UserRoleDb;
          full_name?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
      children: {
        Row: {
          id: string;
          daycare_id: string;
          full_name: string;
          birth_date: string | null;
          gender: "male" | "female" | null;
          notes: string | null;
          allergies: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          full_name: string;
          birth_date?: string | null;
          gender?: "male" | "female" | null;
          notes?: string | null;
          allergies?: string | null;
          created_at?: string;
        };
        Update: {
          full_name?: string;
          birth_date?: string | null;
          gender?: "male" | "female" | null;
          notes?: string | null;
          allergies?: string | null;
        };
        Relationships: [];
      };
      guardians: {
        Row: {
          id: string;
          daycare_id: string;
          profile_id: string | null;
          full_name: string;
          phone: string | null;
          email: string | null;
          relationship_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          profile_id?: string | null;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          relationship_type: string;
          created_at?: string;
        };
        Update: {
          profile_id?: string | null;
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          relationship_type?: string;
        };
        Relationships: [];
      };
      child_guardians: {
        Row: { child_id: string; guardian_id: string; is_primary_contact: boolean };
        Insert: { child_id: string; guardian_id: string; is_primary_contact?: boolean };
        Update: { is_primary_contact?: boolean };
        Relationships: [];
      };
      attendance_records: {
        Row: {
          id: string;
          daycare_id: string;
          child_id: string;
          attendance_date: string;
          status: AttendanceStatusDb;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          child_id: string;
          attendance_date: string;
          status: AttendanceStatusDb;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: { status?: AttendanceStatusDb; note?: string | null };
        Relationships: [];
      };
      daily_reports: {
        Row: {
          id: string;
          daycare_id: string;
          report_date: string;
          title: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          report_date: string;
          title?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: { title?: string };
        Relationships: [];
      };
      daily_activities: {
        Row: {
          id: string;
          report_id: string;
          title: string;
          description: string | null;
          activity_time: string | null;
          category: string | null;
          catalog_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          title: string;
          description?: string | null;
          activity_time?: string | null;
          category?: string | null;
          catalog_id?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          activity_time?: string | null;
          category?: string | null;
          catalog_id?: string | null;
        };
        Relationships: [];
      };
      activity_catalog: {
        Row: {
          id: string;
          title: string;
          category: string | null;
          image_path: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category?: string | null;
          image_path?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          category?: string | null;
          image_path?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      daily_meals: {
        Row: {
          id: string;
          report_id: string;
          meal_type: string;
          title: string;
          description: string | null;
          meal_time: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          meal_type: string;
          title: string;
          description?: string | null;
          meal_time?: string | null;
          created_at?: string;
        };
        Update: {
          meal_type?: string;
          title?: string;
          description?: string | null;
          meal_time?: string | null;
        };
        Relationships: [];
      };
      daily_notes: {
        Row: {
          id: string;
          report_id: string;
          child_id: string | null;
          note_type: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          child_id?: string | null;
          note_type?: string;
          text: string;
          created_at?: string;
        };
        Update: { note_type?: string; text?: string; child_id?: string | null };
        Relationships: [];
      };
      contracts: {
        Row: {
          id: string;
          daycare_id: string;
          child_id: string;
          guardian_id: string | null;
          file_path: string | null;
          file_name: string;
          status: ContractStatusDb;
          activity_year: string | null;
          period_start: string | null;
          period_end: string | null;
          sent_at: string | null;
          expiry_date: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          child_id: string;
          guardian_id?: string | null;
          file_path?: string | null;
          file_name: string;
          status?: ContractStatusDb;
          activity_year?: string | null;
          period_start?: string | null;
          period_end?: string | null;
          sent_at?: string | null;
          expiry_date?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          file_path?: string | null;
          file_name?: string;
          status?: ContractStatusDb;
          activity_year?: string | null;
          sent_at?: string | null;
          expiry_date?: string | null;
        };
        Relationships: [];
      };
      message_threads: {
        Row: {
          id: string;
          daycare_id: string;
          title: string;
          subtitle: string | null;
          avatar_initial: string | null;
          kind: string;
          parent_profile_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          title: string;
          subtitle?: string | null;
          avatar_initial?: string | null;
          kind?: string;
          parent_profile_id?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          subtitle?: string | null;
          avatar_initial?: string | null;
          kind?: string;
          parent_profile_id?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string | null;
          body: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          sender_id?: string | null;
          body: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: { is_read?: boolean };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          daycare_id: string;
          recipient_id: string | null;
          type: string;
          title: string;
          body: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          recipient_id?: string | null;
          type?: string;
          title: string;
          body?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: { is_read?: boolean };
        Relationships: [];
      };
      calendar_events: {
        Row: {
          id: string;
          daycare_id: string;
          title: string;
          event_date: string;
          event_time: string | null;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          title: string;
          event_date: string;
          event_time?: string | null;
          type?: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          event_date?: string;
          event_time?: string | null;
          type?: string;
        };
        Relationships: [];
      };
      gallery_photos: {
        Row: {
          id: string;
          daycare_id: string;
          image_path: string;
          label: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          image_path: string;
          label?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          image_path?: string;
          label?: string | null;
        };
        Relationships: [];
      };
      absence_reports: {
        Row: {
          id: string;
          daycare_id: string;
          child_id: string;
          report_date: string;
          report_type: string;
          note: string | null;
          reported_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          child_id: string;
          report_date?: string;
          report_type: string;
          note?: string | null;
          reported_by?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          daycare_id: string;
          sender_id: string | null;
          subject: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          sender_id?: string | null;
          subject?: string | null;
          body: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      push_tokens: {
        Row: {
          id: string;
          profile_id: string;
          token: string;
          platform: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          token: string;
          platform?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      cameras: {
        Row: {
          id: string;
          daycare_id: string;
          name: string;
          location: string | null;
          stream_provider: string;
          stream_external_id: string | null;
          is_enabled: boolean;
          schedule_json: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          name: string;
          location?: string | null;
          stream_provider?: string;
          stream_external_id?: string | null;
          is_enabled?: boolean;
          schedule_json?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          location?: string | null;
          stream_provider?: string;
          stream_external_id?: string | null;
          is_enabled?: boolean;
          schedule_json?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      camera_consents: {
        Row: {
          profile_id: string;
          daycare_id: string;
          consented_at: string;
        };
        Insert: {
          profile_id: string;
          daycare_id: string;
          consented_at?: string;
        };
        Update: { consented_at?: string };
        Relationships: [];
      };
      camera_access_logs: {
        Row: {
          id: string;
          camera_id: string;
          profile_id: string;
          accessed_at: string;
        };
        Insert: {
          id?: string;
          camera_id: string;
          profile_id: string;
          accessed_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      gallery_albums: {
        Row: {
          id: string;
          daycare_id: string;
          title: string;
          theme: string;
          description: string | null;
          cover_photo_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          title: string;
          theme: string;
          description?: string | null;
          cover_photo_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          theme?: string;
          description?: string | null;
          cover_photo_id?: string | null;
        };
        Relationships: [];
      };
      gallery_album_photos: {
        Row: {
          album_id: string;
          photo_id: string;
          sort_order: number;
        };
        Insert: {
          album_id: string;
          photo_id: string;
          sort_order?: number;
        };
        Update: { sort_order?: number };
        Relationships: [];
      };
      event_suggestions: {
        Row: {
          id: string;
          daycare_id: string;
          title: string;
          body: string;
          suggestion_type: string;
          event_date: string | null;
          requires_rsvp: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          title: string;
          body: string;
          suggestion_type?: string;
          event_date?: string | null;
          requires_rsvp?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          body?: string;
          suggestion_type?: string;
          event_date?: string | null;
          requires_rsvp?: boolean;
        };
        Relationships: [];
      };
      event_suggestion_responses: {
        Row: {
          suggestion_id: string;
          profile_id: string;
          attending: boolean;
          responded_at: string;
        };
        Insert: {
          suggestion_id: string;
          profile_id: string;
          attending: boolean;
          responded_at?: string;
        };
        Update: { attending?: boolean; responded_at?: string };
        Relationships: [];
      };
    };
    Views: { [key in never]: never };
    Functions: {
      current_daycare_id: { Args: Record<string, never>; Returns: string };
      current_user_role: { Args: Record<string, never>; Returns: UserRoleDb };
    };
    Enums: {
      user_role: UserRoleDb;
      attendance_status: AttendanceStatusDb;
      contract_status: ContractStatusDb;
    };
    CompositeTypes: { [key in never]: never };
  };
}
