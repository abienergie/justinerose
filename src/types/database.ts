export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'manager' | 'student'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'manager' | 'student'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'manager' | 'student'
          created_at?: string
          updated_at?: string
        }
      }
      course_packages: {
        Row: {
          id: string
          student_id: string
          package_type: 'single' | 'card_5' | 'card_10' | 'custom'
          total_sessions: number
          remaining_sessions: number
          purchase_date: string
          stripe_payment_intent_id: string | null
          custom_price: number | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          package_type: 'single' | 'card_5' | 'card_10' | 'custom'
          total_sessions: number
          remaining_sessions: number
          purchase_date?: string
          stripe_payment_intent_id?: string | null
          custom_price?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          package_type?: 'single' | 'card_5' | 'card_10' | 'custom'
          total_sessions?: number
          remaining_sessions?: number
          purchase_date?: string
          stripe_payment_intent_id?: string | null
          custom_price?: number | null
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          student_id: string
          package_id: string
          session_date: string
          duration_hours: number
          session_type: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          package_id: string
          session_date: string
          duration_hours: number
          session_type?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          package_id?: string
          session_date?: string
          duration_hours?: number
          session_type?: string | null
          created_by?: string
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          student_id: string
          document_type: 'invoice' | 'tax_declaration'
          file_name: string
          file_path: string
          file_size: number
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          id?: string
          student_id: string
          document_type: 'invoice' | 'tax_declaration'
          file_name: string
          file_path: string
          file_size: number
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          id?: string
          student_id?: string
          document_type?: 'invoice' | 'tax_declaration'
          file_name?: string
          file_path?: string
          file_size?: number
          uploaded_at?: string
          uploaded_by?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type CoursePackage = Database['public']['Tables']['course_packages']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
