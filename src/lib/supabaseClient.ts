import { createClient } from '@supabase/supabase-js';
import { School, Program, Course, ClassSession, Student, AttendanceRecord } from '@/types/attendance';

// External Supabase connection (user's own database)
// Credentials moved to environment variables for security
const PROJECT_URL = import.meta.env.VITE_EXTERNAL_SUPABASE_URL;
const EXTERNAL_SUPABASE_ANON_KEY = import.meta.env.VITE_EXTERNAL_SUPABASE_ANON_KEY;

if (!PROJECT_URL || !EXTERNAL_SUPABASE_ANON_KEY) {
  throw new Error('External Supabase credentials not configured. Check environment variables.');
}

// Export for connectivity checks (URL only, not the key)
export { PROJECT_URL };

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
