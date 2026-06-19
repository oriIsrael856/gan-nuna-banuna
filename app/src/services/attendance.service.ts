import { mockChildren } from "../data/mockChildren";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { AttendanceStatus } from "../types/child";
import type { AttendanceStatusDb } from "../types/database";
import { getCurrentDaycareId } from "./auth.service";
import { todayIso } from "./mappers";

export async function getInitialAttendanceByChildId(): Promise<Record<string, AttendanceStatus>> {
  if (!isSupabaseConfigured || !supabase) {
    return Object.fromEntries(
      mockChildren.map((child) => [child.id, child.attendanceStatus]),
    ) as Record<string, AttendanceStatus>;
  }

  const sb = supabase;
  const [childResult, attendanceResult] = await Promise.all([
    sb.from("children").select("id"),
    sb.from("attendance_records").select("child_id, status").eq("attendance_date", todayIso()),
  ]);

  const statusByChild = new Map(
    (attendanceResult.data ?? []).map((row) => [row.child_id, row.status as AttendanceStatus]),
  );

  const result: Record<string, AttendanceStatus> = {};
  for (const child of childResult.data ?? []) {
    result[child.id] = statusByChild.get(child.id) ?? "not_arrived";
  }
  return result;
}

export async function saveAttendance(
  attendanceByChildId: Record<string, AttendanceStatus>,
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return false;
  }

  const date = todayIso();
  const rows = Object.entries(attendanceByChildId).map(([childId, status]) => ({
    daycare_id: daycareId,
    child_id: childId,
    attendance_date: date,
    status: status as AttendanceStatusDb,
  }));

  if (rows.length === 0) {
    return true;
  }

  const { error } = await supabase
    .from("attendance_records")
    .upsert(rows, { onConflict: "child_id,attendance_date" });

  return !error;
}
