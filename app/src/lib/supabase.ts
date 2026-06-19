import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

import type { Database } from "../types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const isWeb = Platform.OS === "web";

/** AsyncStorage needs `window` and crashes during Expo web SSR — use localStorage on web instead. */
const authStorage = isWeb
  ? {
      getItem: (key: string) => {
        if (typeof window === "undefined") return null;
        return window.localStorage.getItem(key);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key: string) => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(key);
        }
      },
    }
  : AsyncStorage;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: isWeb,
      },
    })
  : null;

export function getSupabaseConfig() {
  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    isConfigured: isSupabaseConfigured,
  };
}

export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in app/.env.",
    );
  }

  return supabase;
}
