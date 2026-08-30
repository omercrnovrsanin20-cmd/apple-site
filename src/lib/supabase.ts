import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key -- bypasses Row Level
// Security, so this must never be imported into client-side code. Used only
// from API routes to read/write the private "photos" storage bucket; access
// to those bytes is still gated by our own session check in
// /api/files/[...path], not by Supabase's own auth.
let client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured");
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export const PHOTOS_BUCKET = "photos";
