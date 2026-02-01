import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Check if we have the required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Flag to check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export function createClient() {
  // During build time or when env vars are missing, throw a clear error
  // The AuthProvider should check isSupabaseConfigured before calling this
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
