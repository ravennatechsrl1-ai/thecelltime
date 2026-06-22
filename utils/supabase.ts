import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Variabili d'ambiente Supabase mancanti: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY sono obbligatorie."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
}

export function getSupabaseClientSafe(): SupabaseClient | null {
  try {
    return getSupabaseClient();
  } catch {
    return null;
  }
}

/** Prefer service role for server-side writes (webhooks, checkout fulfillment). */
export function getSupabaseAdminClientSafe(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (url && serviceKey) {
    if (!supabaseAdminInstance) {
      supabaseAdminInstance = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    return supabaseAdminInstance;
  }

  return getSupabaseClientSafe();
}

export const supabase = typeof window !== "undefined" || process.env.NEXT_PUBLIC_SUPABASE_URL
  ? (() => {
      try {
        return createSupabaseClient();
      } catch {
        return null;
      }
    })()
  : null;
