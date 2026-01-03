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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      uol_attendance: {
        Row: {
          attendance_id: string
          minutes_late: number | null
          recorded_at: string | null
          session_id: string | null
          source: string | null
          status: string | null
          student_id: string | null
        }
        Insert: {
          attendance_id?: string
          minutes_late?: number | null
          recorded_at?: string | null
          session_id?: string | null
          source?: string | null
          status?: string | null
          student_id?: string | null
        }
        Update: {
          attendance_id?: string
          minutes_late?: number | null
          recorded_at?: string | null
          session_id?: string | null
          source?: string | null
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uol_attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "uol_class_sessions"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "uol_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "uol_students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      uol_class_sessions: {
        Row: {
          course_id: string | null
          delivery_mode: string | null
          duration_mins: number | null
          instructor: string | null
          session_date: string
          session_id: string
          start_time: string
        }
        Insert: {
          course_id?: string | null
          delivery_mode?: string | null
          duration_mins?: number | null
          instructor?: string | null
          session_date: string
          session_id?: string
          start_time: string
        }
        Update: {
          course_id?: string | null
          delivery_mode?: string | null
          duration_mins?: number | null
          instructor?: string | null
          session_date?: string
          session_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "uol_class_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "uol_courses"
            referencedColumns: ["course_id"]
          },
        ]
      }
      uol_courses: {
        Row: {
          course_code: string
          course_id: string
          course_title: string
          program_id: string | null
        }
        Insert: {
          course_code: string
          course_id?: string
          course_title: string
          program_id?: string | null
        }
        Update: {
          course_code?: string
          course_id?: string
          course_title?: string
          program_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uol_courses_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "uol_programs"
            referencedColumns: ["program_id"]
          },
        ]
      }
      uol_programs: {
        Row: {
          program_id: string
          program_name: string
          school_id: string | null
        }
        Insert: {
          program_id?: string
          program_name: string
          school_id?: string | null
        }
        Update: {
          program_id?: string
          program_name?: string
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uol_programs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "uol_schools"
            referencedColumns: ["school_id"]
          },
        ]
      }
      uol_schools: {
        Row: {
          faculty_group: string | null
          school_id: string
          school_name: string
        }
        Insert: {
          faculty_group?: string | null
          school_id?: string
          school_name: string
        }
        Update: {
          faculty_group?: string | null
          school_id?: string
          school_name?: string
        }
        Relationships: []
      }
      uol_students: {
        Row: {
          entry_year: number | null
          gender: string | null
          level: number | null
          nationality: string | null
          program_id: string | null
          school_id: string | null
          student_id: string
        }
        Insert: {
          entry_year?: number | null
          gender?: string | null
          level?: number | null
          nationality?: string | null
          program_id?: string | null
          school_id?: string | null
          student_id?: string
        }
        Update: {
          entry_year?: number | null
          gender?: string | null
          level?: number | null
          nationality?: string | null
          program_id?: string | null
          school_id?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uol_students_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "uol_programs"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "uol_students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "uol_schools"
            referencedColumns: ["school_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
