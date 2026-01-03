import { createClient } from '@supabase/supabase-js';
import { School, Program, Course, ClassSession, Student, AttendanceRecord } from '@/types/attendance';

// External Supabase connection (user's own database)
const EXTERNAL_SUPABASE_URL = 'https://wcsowzskjfrpuhqhbzml.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'sb_publishable_GFYhs8MaoPC4-ngQie_QEQ__Calvkb-';

// Some setups use a non-JWT public key. In that case, sending it as an Authorization bearer
// token can cause auth/CORS failures. If the key is not a JWT, we remove the Authorization
// header and rely on the `apikey` header instead.
const isJwtKey = EXTERNAL_SUPABASE_ANON_KEY.split('.').length === 3;

const supabaseFetch: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);

  if (!isJwtKey) {
    const auth = headers.get('Authorization');
    if (auth === `Bearer ${EXTERNAL_SUPABASE_ANON_KEY}`) {
      headers.delete('Authorization');
    }
  }

  return fetch(input, {
    ...init,
    headers,
  });
};

// Create client for the external Supabase database
export const supabaseClient = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY, {
  global: {
    fetch: supabaseFetch,
    headers: {
      apikey: EXTERNAL_SUPABASE_ANON_KEY,
    },
  },
});

// Database types for the existing tables
export interface DatabaseSchema {
  uol_schools: School;
  uol_programs: Program;
  uol_courses: Course;
  uol_class_sessions: ClassSession;
  uol_students: Student;
  uol_attendance: AttendanceRecord;
}

