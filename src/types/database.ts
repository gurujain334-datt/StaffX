/**
 * Database Types for Supabase (Phase 2 - Backend Foundation)
 * Strongly typed interface matching PostgreSQL schema in /supabase/schema.sql
 */

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
          email: string;
          phone: string | null;
          full_name: string;
          role: 'ORGANIZER' | 'PROFESSIONAL' | 'ADMIN';
          avatar_url: string | null;
          location: string | null;
          status: 'ACTIVE' | 'SUSPENDED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          full_name: string;
          role?: 'ORGANIZER' | 'PROFESSIONAL' | 'ADMIN';
          avatar_url?: string | null;
          location?: string | null;
          status?: 'ACTIVE' | 'SUSPENDED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          full_name?: string;
          role?: 'ORGANIZER' | 'PROFESSIONAL' | 'ADMIN';
          avatar_url?: string | null;
          location?: string | null;
          status?: 'ACTIVE' | 'SUSPENDED';
          created_at?: string;
          updated_at?: string;
        };
      };
      organizer_profiles: {
        Row: {
          id: string;
          user_id: string;
          organization_name: string;
          organization_type: string;
          description: string | null;
          location: string | null;
          website: string | null;
          completed_events_count: number;
          rating: number;
          verification_status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_name: string;
          organization_type?: string;
          description?: string | null;
          location?: string | null;
          website?: string | null;
          completed_events_count?: number;
          rating?: number;
          verification_status?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_name?: string;
          organization_type?: string;
          description?: string | null;
          location?: string | null;
          website?: string | null;
          completed_events_count?: number;
          rating?: number;
          verification_status?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
          created_at?: string;
          updated_at?: string;
        };
      };
      professional_profiles: {
        Row: {
          id: string;
          user_id: string;
          skills: string[];
          primary_category: string;
          experience_years: number;
          location: string | null;
          availability: 'Available' | 'Busy' | 'Weekends Only';
          hourly_rate: number;
          rating: number;
          completed_jobs_count: number;
          verification_status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
          bio: string | null;
          profile_image: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skills?: string[];
          primary_category?: string;
          experience_years?: number;
          location?: string | null;
          availability?: 'Available' | 'Busy' | 'Weekends Only';
          hourly_rate?: number;
          rating?: number;
          completed_jobs_count?: number;
          verification_status?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
          bio?: string | null;
          profile_image?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skills?: string[];
          primary_category?: string;
          experience_years?: number;
          location?: string | null;
          availability?: 'Available' | 'Busy' | 'Weekends Only';
          hourly_rate?: number;
          rating?: number;
          completed_jobs_count?: number;
          verification_status?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
          bio?: string | null;
          profile_image?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          organizer_id: string;
          name: string;
          event_type: string;
          venue: string;
          location: string;
          start_date: string;
          end_date: string;
          start_time: string;
          end_time: string;
          description: string | null;
          status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
          image_url: string | null;
          qr_code_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          name: string;
          event_type: string;
          venue: string;
          location: string;
          start_date: string;
          end_date: string;
          start_time: string;
          end_time: string;
          description?: string | null;
          status?: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
          image_url?: string | null;
          qr_code_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          name?: string;
          event_type?: string;
          venue?: string;
          location?: string;
          start_date?: string;
          end_date?: string;
          start_time?: string;
          end_time?: string;
          description?: string | null;
          status?: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
          image_url?: string | null;
          qr_code_token?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      staffing_requirements: {
        Row: {
          id: string;
          event_id: string;
          role: string;
          required_quantity: number;
          filled_quantity: number;
          pay_amount: number;
          required_skills: string[];
          experience_required: string | null;
          shift_start: string;
          shift_end: string;
          description: string | null;
          status: 'DRAFT' | 'PUBLISHED' | 'FILLED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          role: string;
          required_quantity?: number;
          filled_quantity?: number;
          pay_amount: number;
          required_skills?: string[];
          experience_required?: string | null;
          shift_start: string;
          shift_end: string;
          description?: string | null;
          status?: 'DRAFT' | 'PUBLISHED' | 'FILLED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          role?: string;
          required_quantity?: number;
          filled_quantity?: number;
          pay_amount?: number;
          required_skills?: string[];
          experience_required?: string | null;
          shift_start?: string;
          shift_end?: string;
          description?: string | null;
          status?: 'DRAFT' | 'PUBLISHED' | 'FILLED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          requirement_id: string;
          event_id: string;
          professional_id: string;
          status: 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELLED';
          message: string | null;
          applied_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requirement_id: string;
          event_id: string;
          professional_id: string;
          status?: 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELLED';
          message?: string | null;
          applied_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requirement_id?: string;
          event_id?: string;
          professional_id?: string;
          status?: 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELLED';
          message?: string | null;
          applied_at?: string;
          updated_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          requirement_id: string;
          event_id: string;
          organizer_id: string;
          professional_id: string;
          role: string;
          agreed_rate: number;
          status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
          assigned_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          requirement_id: string;
          event_id: string;
          organizer_id: string;
          professional_id: string;
          role: string;
          agreed_rate: number;
          status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
          assigned_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          requirement_id?: string;
          event_id?: string;
          organizer_id?: string;
          professional_id?: string;
          role?: string;
          agreed_rate?: number;
          status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
          assigned_at?: string;
          completed_at?: string | null;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          assignment_id: string;
          event_id: string;
          professional_id: string;
          check_in_at: string | null;
          check_out_at: string | null;
          status: 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT';
          duration_formatted: string | null;
          verification_method: 'QR_SCAN' | 'MANUAL_OVERRIDE' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          event_id: string;
          professional_id: string;
          check_in_at?: string | null;
          check_out_at?: string | null;
          status?: 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT';
          duration_formatted?: string | null;
          verification_method?: 'QR_SCAN' | 'MANUAL_OVERRIDE' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          event_id?: string;
          professional_id?: string;
          check_in_at?: string | null;
          check_out_at?: string | null;
          status?: 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT';
          duration_formatted?: string | null;
          verification_method?: 'QR_SCAN' | 'MANUAL_OVERRIDE' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_records: {
        Row: {
          id: string;
          assignment_id: string | null;
          event_id: string;
          organizer_id: string;
          professional_id: string;
          role: string;
          amount: number;
          status: 'PENDING' | 'APPROVED' | 'PAID' | 'FAILED' | 'CANCELLED';
          payment_method: string | null;
          transaction_reference: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assignment_id?: string | null;
          event_id: string;
          organizer_id: string;
          professional_id: string;
          role: string;
          amount: number;
          status?: 'PENDING' | 'APPROVED' | 'PAID' | 'FAILED' | 'CANCELLED';
          payment_method?: string | null;
          transaction_reference?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string | null;
          event_id?: string;
          organizer_id?: string;
          professional_id?: string;
          role?: string;
          amount?: number;
          status?: 'PENDING' | 'APPROVED' | 'PAID' | 'FAILED' | 'CANCELLED';
          payment_method?: string | null;
          transaction_reference?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          assignment_id: string | null;
          reviewer_id: string;
          reviewer_role: 'ORGANIZER' | 'PROFESSIONAL' | 'ADMIN';
          reviewed_user_id: string;
          rating: number;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          assignment_id?: string | null;
          reviewer_id: string;
          reviewer_role: 'ORGANIZER' | 'PROFESSIONAL' | 'ADMIN';
          reviewed_user_id: string;
          rating: number;
          comment: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string | null;
          reviewer_id?: string;
          reviewer_role?: 'ORGANIZER' | 'PROFESSIONAL' | 'ADMIN';
          reviewed_user_id?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          type: 'APPLICATION' | 'HIRING' | 'ATTENDANCE' | 'PAYMENT' | 'VERIFICATION' | 'SYSTEM';
          title: string;
          message: string;
          read_status: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          type: 'APPLICATION' | 'HIRING' | 'ATTENDANCE' | 'PAYMENT' | 'VERIFICATION' | 'SYSTEM';
          title: string;
          message: string;
          read_status?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          type?: 'APPLICATION' | 'HIRING' | 'ATTENDANCE' | 'PAYMENT' | 'VERIFICATION' | 'SYSTEM';
          title?: string;
          message?: string;
          read_status?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
