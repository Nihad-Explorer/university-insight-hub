import { createClient } from '@supabase/supabase-js';
import { School, Program, Course, ClassSession, Student, AttendanceRecord } from '@/types/attendance';

// External Supabase connection (user's own database)
// Note: These are publishable/anon keys - designed for client-side use with RLS protection
export const PROJECT_URL = 'https://wcsozwskjfrpuhqhbzml.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'sb_publishable_GFYhs8MaoPC4-ngQie_QEQ__Calvkb-';

// Create client for the external Supabase database
// IMPORTANT: The URL must be the *Project URL* (no /rest/v1, no trailing slash).
export const supabaseClient = createClient(PROJECT_URL, EXTERNAL_SUPABASE_ANON_KEY);


// Database types for the existing tables
export interface DatabaseSchema {
  uol_schools: School;
  uol_programs: Program;
  uol_courses: Course;
  uol_class_sessions: ClassSession;
  uol_students: Student;
  uol_attendance: AttendanceRecord;
}
