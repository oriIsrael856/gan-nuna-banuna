export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRoleDb = "parent" | "teacher" | "admin";
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
          created_at: string;
        };
        Insert: {
          id?: string;
          daycare_id: string;
          full_name: string;
          birth_date?: string | null;
          gender?: "male" | "female" | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          full_name?: string;
          birth_date?: string | null;
          gender?: "male" | "female" | null;
          notes?: string | null;
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
