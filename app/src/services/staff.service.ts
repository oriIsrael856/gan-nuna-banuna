import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { getCurrentDaycareId } from "./auth.service";

export interface StaffMember {
  id: string;
  fullName: string;
  phone: string | null;
  role: "teacher" | "admin";
}

export interface InviteTeacherInput {
  email: string;
  fullName: string;
  phone?: string;
  daycareId: string;
}

export interface InviteTeacherResult {
  ok: boolean;
  status?: "invited" | "already_exists";
  error?: string;
}

export async function getStaffMembers(): Promise<StaffMember[]> {
  const daycareId = getCurrentDaycareId();
  if (!isSupabaseConfigured || !supabase || !daycareId) {
    return [];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role")
    .eq("daycare_id", daycareId)
    .in("role", ["teacher", "admin"])
    .order("full_name");

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    role: row.role as "teacher" | "admin",
  }));
}

export async function inviteTeacher(input: InviteTeacherInput): Promise<InviteTeacherResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: true, status: "invited" };
  }

  const { data, error } = await supabase.functions.invoke("invite-teacher", {
    body: input,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const payload = data as { status?: "invited" | "already_exists"; error?: string };
  if (payload.error) {
    return { ok: false, error: payload.error };
  }

  return { ok: true, status: payload.status ?? "invited" };
}

export async function removeStaffMember(profileId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return false;
  }

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId)
    .eq("daycare_id", daycareId)
    .eq("role", "teacher");

  return !error;
}
