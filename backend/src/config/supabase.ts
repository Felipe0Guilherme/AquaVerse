// src/config/supabase.ts
// ============================================================
// Supabase admin client — uses the SERVICE ROLE key.
// This client bypasses Row Level Security and should ONLY
// be used server-side, never exposed to the browser.
// ============================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';

let supabaseAdmin: SupabaseClient;

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          // Disable auto-refresh — this is a server-side client.
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );
  }
  return supabaseAdmin;
}
