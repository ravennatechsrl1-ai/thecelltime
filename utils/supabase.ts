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

export const supabase = typeof window !== "undefined" || process.env.NEXT_PUBLIC_SUPABASE_URL
  ? (() => {
      try {
        return createSupabaseClient();
      } catch {
        return null;
      }
    })()
  : null;
