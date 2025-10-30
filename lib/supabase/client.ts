import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export type SupabaseBrowserClient = SupabaseClient;

// Singleton instance
let supabaseInstance: SupabaseBrowserClient | null = null;

export function createSupabaseBrowserClient(): SupabaseBrowserClient {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase browser client requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  // Use createBrowserClient from @supabase/ssr for proper cookie handling
  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);

  return supabaseInstance;
}
