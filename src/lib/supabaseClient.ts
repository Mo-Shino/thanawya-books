import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const isSupabaseConfigured = 
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && 
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

export const supabase = createClient(supabaseUrl, supabaseKey);
