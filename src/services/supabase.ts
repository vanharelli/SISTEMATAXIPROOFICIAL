
import { createClient } from '@supabase/supabase-js';

// Environment variables should be set in .env or Vercel project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail-safe initialization to prevent app crash if keys are missing
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => ({
        insert: async () => ({ error: { message: 'Supabase not configured (Missing Envs)' } }),
        select: async () => ({ error: { message: 'Supabase not configured (Missing Envs)' } })
      })
    } as any;
