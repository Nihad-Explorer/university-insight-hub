// Re-export the Lovable Cloud Supabase client for use throughout the app
import { supabase } from '@/integrations/supabase/client';
import { School, Program, Course, ClassSession, Student, AttendanceRecord } from '@/types/attendance';

// Export the Lovable Cloud client as supabaseClient for compatibility
export const supabaseClient = supabase;

// Export URL for reference
export const PROJECT_URL = import.meta.env.VITE_SUPABASE_URL;

// Database types for the existing tables
export interface DatabaseSchema {
  uol_schools: School;
  uol_programs: Program;
  uol_courses: Course;
  uol_class_sessions: ClassSession;
  uol_students: Student;
  uol_attendance: AttendanceRecord;
}
