// Re-export the Lovable Cloud Supabase client for auth functionality
import { supabase } from '@/integrations/supabase/client';

// Export the Lovable Cloud client as supabaseClient for auth compatibility
export const supabaseClient = supabase;

// Export URL for reference
export const PROJECT_URL = import.meta.env.VITE_SUPABASE_URL;

// Note: The actual data queries now use externalSupabaseClient.ts 
// which connects to the external 2-table schema
