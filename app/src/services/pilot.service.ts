import { isSupabaseConfigured } from "../lib/supabase";
import type { UserRole } from "../types/user";
import { getCurrentUserRole } from "./auth.service";

export type DataSourceMode = "supabase" | "mock";

export function getDataSourceMode(): DataSourceMode {
  return isSupabaseConfigured ? "supabase" : "mock";
}

export function canAccessTeacherArea(role: UserRole = getCurrentUserRole()) {
  return role === "teacher" || role === "admin";
}

export function canAccessParentArea(role: UserRole = getCurrentUserRole()) {
  return role === "parent" || role === "admin";
}

export function getPilotReadinessLabel() {
  return isSupabaseConfigured
    ? "מחובר לנתוני פיילוט"
    : "מצב דמו - ממתין לחיבור Supabase";
}
