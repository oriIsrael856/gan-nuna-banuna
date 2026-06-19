/**
 * Runtime flags for pilot vs production builds.
 * Demo login is only available in development when explicitly enabled or when
 * Supabase env vars are missing.
 */
export const isDemoLoginEnabled =
  !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    ? __DEV__ && process.env.EXPO_PUBLIC_ENABLE_DEMO_LOGIN !== "false"
    : __DEV__ && process.env.EXPO_PUBLIC_ENABLE_DEMO_LOGIN === "true";

export const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? "https://gan-nuna-banuna.example/privacy";

export const TERMS_URL =
  process.env.EXPO_PUBLIC_TERMS_URL ?? "https://gan-nuna-banuna.example/terms";
