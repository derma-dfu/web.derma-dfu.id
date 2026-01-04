import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use NEXT_PUBLIC_ prefix for client-side environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Fallback for types if environment variables are missing during type check
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn('Supabase environment variables are missing.');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: (typeof window !== 'undefined') ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});