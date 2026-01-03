import { createClient } from '@supabase/supabase-js';
import { School, Program, Course, ClassSession, Student, AttendanceRecord } from '@/types/attendance';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Create an untyped client for direct access to existing tables
export const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Database types for the existing tables
export interface DatabaseSchema {
  uol_schools: School;
  uol_programs: Program;
  uol_courses: Course;
  uol_class_sessions: ClassSession;
  uol_students: Student;
  uol_attendance: AttendanceRecord;
}
