import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

let isConfigured = false;
let clientInstance = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    // Validate URL format to prevent createClient crashes:
    new URL(supabaseUrl);
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
    isConfigured = true;
  } catch (e) {
    console.error('Invalid Supabase configuration or malformed URL:', e);
  }
}

export const isSupabaseConfigured = isConfigured;
export const supabase = clientInstance;
