import { createClient } from '@supabase/supabase-js';
import { School, Program, Course, ClassSession, Student, AttendanceRecord } from '@/types/attendance';

// External Supabase connection (Oxford project database)
// Using environment variables for flexibility
const EXTERNAL_SUPABASE_URL = import.meta.env.VITE_EXTERNAL_SUPABASE_URL;
const EXTERNAL_SUPABASE_ANON_KEY = import.meta.env.VITE_EXTERNAL_SUPABASE_ANON_KEY;

if (!EXTERNAL_SUPABASE_URL || !EXTERNAL_SUPABASE_ANON_KEY) {
  console.error('Missing external Supabase credentials. Please set VITE_EXTERNAL_SUPABASE_URL and VITE_EXTERNAL_SUPABASE_ANON_KEY');
}

// Create client for the external Oxford Supabase database
export const supabaseClient = createClient(
  EXTERNAL_SUPABASE_URL || '',
  EXTERNAL_SUPABASE_ANON_KEY || ''
);

// Export URL for reference
export const PROJECT_URL = EXTERNAL_SUPABASE_URL;

// Database types for the existing tables
export interface DatabaseSchema {
  uol_schools: School;
  uol_programs: Program;
  uol_courses: Course;
  uol_class_sessions: ClassSession;
  uol_students: Student;
  uol_attendance: AttendanceRecord;
}
