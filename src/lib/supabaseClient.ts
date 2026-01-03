import { createClient } from '@supabase/supabase-js';
import { School, Program, Course, ClassSession, Student, AttendanceRecord } from '@/types/attendance';

// External Supabase connection (user's own database)
const EXTERNAL_SUPABASE_URL = 'https://wcsozwskjfrpuhqhbzml.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'sb_publishable_GFYhs8MaoPC4-ngQie_QEQ__Calvkb-';

// Create client for the external Supabase database
export const supabaseClient = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);

// Database types for the existing tables
export interface DatabaseSchema {
  uol_schools: School;
  uol_programs: Program;
  uol_courses: Course;
  uol_class_sessions: ClassSession;
  uol_students: Student;
  uol_attendance: AttendanceRecord;
}
