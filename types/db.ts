// Full Database type definitions for the Healthcare Workforce Platform
// Replace with `supabase gen types typescript --linked > types/db.ts` for production

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string;
          role: "admin" | "manager" | "staff";
          department_id: string | null;
          unit_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email: string;
          role?: "admin" | "manager" | "staff";
          department_id?: string | null;
          unit_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      departments: {
        Row: { id: string; name: string; created_at: string };
        Insert: { id?: string; name: string };
        Update: Partial<{ name: string }>;
        Relationships: [];
      };
      units: {
        Row: { id: string; department_id: string; name: string; created_at: string };
        Insert: { id?: string; department_id: string; name: string };
        Update: Partial<{ department_id: string; name: string }>;
        Relationships: [
          { foreignKeyName: "units_department_id_fkey"; columns: ["department_id"]; referencedRelation: "departments"; referencedColumns: ["id"] }
        ];
      };
      staff_assignments: {
        Row: { id: string; staff_id: string; unit_id: string; role_in_unit: string | null; active: boolean; created_at: string };
        Insert: { id?: string; staff_id: string; unit_id: string; role_in_unit?: string | null; active?: boolean };
        Update: Partial<{ role_in_unit: string | null; active: boolean }>;
        Relationships: [];
      };
      staff: {
        Row: {
          id: string;
          title: string | null;
          phone: string | null;
          shift_preference: string | null;
          availability: Json | null;
          emergency_contact: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title?: string | null;
          phone?: string | null;
          shift_preference?: string | null;
          availability?: Json | null;
          emergency_contact?: Json | null;
        };
        Update: Partial<Database["public"]["Tables"]["staff"]["Insert"]>;
        Relationships: [];
      };
      skills: {
        Row: { id: string; name: string; category: string | null; description: string | null; created_at: string };
        Insert: { id?: string; name: string; category?: string | null; description?: string | null };
        Update: Partial<{ name: string; category: string | null; description: string | null }>;
        Relationships: [];
      };
      staff_skills: {
        Row: { staff_id: string; skill_id: string; level: string; certification_number: string | null; expires_at: string | null; created_at: string };
        Insert: { staff_id: string; skill_id: string; level?: string; certification_number?: string | null; expires_at?: string | null };
        Update: Partial<{ level: string; certification_number: string | null; expires_at: string | null }>;
        Relationships: [];
      };
      shifts: {
        Row: {
          id: string;
          unit_id: string;
          staff_id: string | null;
          start_at: string;
          end_at: string;
          status: "scheduled" | "completed" | "cancelled";
          created_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unit_id: string;
          staff_id?: string | null;
          start_at: string;
          end_at: string;
          status?: "scheduled" | "completed" | "cancelled";
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["shifts"]["Insert"]>;
        Relationships: [];
      };
      swap_requests: {
        Row: {
          id: string;
          shift_id: string;
          from_staff_id: string;
          to_staff_id: string;
          status: "pending" | "approved" | "declined" | "cancelled";
          reason: string | null;
          created_at: string;
          decided_by: string | null;
        };
        Insert: {
          id?: string;
          shift_id: string;
          from_staff_id: string;
          to_staff_id: string;
          reason?: string | null;
        };
        Update: Partial<{ status: string; decided_by: string | null }>;
        Relationships: [];
      };
      time_entries: {
        Row: {
          id: string;
          staff_id: string;
          shift_id: string | null;
          clock_in: string;
          clock_out: string | null;
          method: "manual" | "geo" | "qr";
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          shift_id?: string | null;
          clock_in: string;
          clock_out?: string | null;
          method?: "manual" | "geo" | "qr";
        };
        Update: Partial<{ clock_out: string | null; method: string }>;
        Relationships: [];
      };
      credentials: {
        Row: {
          id: string;
          staff_id: string;
          type: string;
          license_number: string | null;
          issued_by: string | null;
          issued_at: string | null;
          expires_at: string | null;
          document_url: string | null;
          status: "valid" | "expiring" | "expired" | "suspended";
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          type: string;
          license_number?: string | null;
          issued_by?: string | null;
          issued_at?: string | null;
          expires_at?: string | null;
          document_url?: string | null;
          status?: "valid" | "expiring" | "expired" | "suspended";
        };
        Update: Partial<Database["public"]["Tables"]["credentials"]["Insert"]>;
        Relationships: [];
      };
      time_off_requests: {
        Row: {
          id: string;
          staff_id: string;
          start_date: string;
          end_date: string;
          type: "vacation" | "sick" | "unpaid" | "other";
          status: "pending" | "approved" | "declined" | "cancelled";
          reason: string | null;
          decided_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          start_date: string;
          end_date: string;
          type?: string;
          reason?: string | null;
        };
        Update: Partial<{ status: string; decided_by: string | null; reason: string | null }>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          title: string;
          body: string | null;
          read_at: string | null;
          action_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          title: string;
          body?: string | null;
          action_url?: string | null;
        };
        Update: Partial<{ read_at: string | null }>;
        Relationships: [];
      };
      settings: {
        Row: {
          id: number;
          timezone: string;
          overtime_threshold_minutes: number;
          geo_fencing: Json | null;
          created_at: string;
        };
        Insert: { id?: number; timezone?: string; overtime_threshold_minutes?: number; geo_fencing?: Json | null };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
      roles: {
        Row: { id: number; slug: string; name: string };
        Insert: { id?: number; slug: string; name: string };
        Update: Partial<{ slug: string; name: string }>;
        Relationships: [];
      };
      user_roles: {
        Row: { user_id: string; role_id: number };
        Insert: { user_id: string; role_id: number };
        Update: Partial<{ role_id: number }>;
        Relationships: [
          { foreignKeyName: "user_roles_role_id_fkey"; columns: ["role_id"]; referencedRelation: "roles"; referencedColumns: ["id"] },
          { foreignKeyName: "user_roles_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] }
        ];
      };
    };
  };
}
