// External Supabase client for the new 2-table schema
import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = 'https://nyxbdyuvoheavtingsur.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'sb_publishable_g9KxglNHdFS2Z_zLVJKJQQ_zuSq4AnX';

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);

// Table names
export const TABLES = {
  STUDENTS_DIM: 'students_dim',
  ATTENDANCE_FACT: 'attendance_fact',
} as const;
