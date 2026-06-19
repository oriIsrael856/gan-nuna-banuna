import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  getCurrentDaycareId,
  getCurrentUser,
  getCurrentUserRole,
} from "./auth.service";
import { todayIso } from "./mappers";
import { createNotification } from "./notifications.service";

export interface AbsenceReportInput {
  childId: string;
  reportType: string;
  note?: string;
}

export interface AbsenceReport {
  id: string;
  childId: string;
  childName: string;
  reportDate: string;
  reportType: string;
  note: string | null;
  reporterName: string;
  createdAt: string;
}

export async function getAbsenceReports(days = 7): Promise<AbsenceReport[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return [];
  }

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceIso = since.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("absence_reports")
    .select("id, child_id, report_date, report_type, note, reported_by, created_at")
    .eq("daycare_id", daycareId)
    .gte("report_date", sinceIso)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const childIds = [...new Set(data.map((row) => row.child_id))];
  const reporterIds = [...new Set(data.map((row) => row.reported_by).filter(Boolean))] as string[];

  const childNames = new Map<string, string>();
  const reporterNames = new Map<string, string>();

  if (childIds.length > 0) {
    const { data: children } = await supabase
      .from("children")
      .select("id, full_name")
      .in("id", childIds);

    for (const child of children ?? []) {
      childNames.set(child.id, child.full_name);
    }
  }

  if (reporterIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", reporterIds);

    for (const profile of profiles ?? []) {
      reporterNames.set(profile.id, profile.full_name);
    }
  }

  return data.map((row) => ({
    id: row.id,
    childId: row.child_id,
    childName: childNames.get(row.child_id) ?? "ילד",
    reportDate: row.report_date,
    reportType: row.report_type,
    note: row.note,
    reporterName: row.reported_by ? (reporterNames.get(row.reported_by) ?? "הורה") : "הורה",
    createdAt: row.created_at,
  }));
}

const ABSENCE_TO_ATTENDANCE: Record<string, string> = {
  "הילד לא מגיע היום": "not_arrived",
  "נגיע מאוחר": "late",
  "הילד יצא מוקדם": "left_early",
};

export async function submitAbsenceReport(input: AbsenceReportInput): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const daycareId = getCurrentDaycareId();
  const user = getCurrentUser();
  if (!daycareId) {
    return false;
  }

  const { error } = await supabase.from("absence_reports").insert({
    daycare_id: daycareId,
    child_id: input.childId,
    report_date: todayIso(),
    report_type: input.reportType,
    note: input.note?.trim() || null,
    reported_by: user.id,
  });

  if (error) {
    return false;
  }

  const attendanceStatus = ABSENCE_TO_ATTENDANCE[input.reportType];
  if (attendanceStatus) {
    await supabase.from("attendance_records").upsert(
      {
        daycare_id: daycareId,
        child_id: input.childId,
        attendance_date: todayIso(),
        status: attendanceStatus as "not_arrived" | "late" | "left_early",
        created_by: user.id,
      },
      { onConflict: "child_id,attendance_date" },
    );
  }

  if (getCurrentUserRole() === "parent") {
    const { data: staff } = await supabase
      .from("profiles")
      .select("id")
      .eq("daycare_id", daycareId)
      .in("role", ["teacher", "admin"]);

    const recipientIds = (staff ?? []).map((row) => row.id);
    if (recipientIds.length > 0) {
      await createNotification({
        recipientIds,
        type: "absence",
        title: "דיווח היעדרות מהורה",
        body: `${input.reportType}${input.note ? `: ${input.note}` : ""}`,
      });
    }
  }

  return true;
}
