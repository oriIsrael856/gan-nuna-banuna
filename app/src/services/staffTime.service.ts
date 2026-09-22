import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { getCurrentDaycareId, getCurrentUser } from "./auth.service";
import { getStaffMembers, type StaffMember } from "./staff.service";

export interface TimeEntry {
  id: string;
  profileId: string;
  clockIn: string;
  clockOut: string | null;
  /** Worked minutes; for an open shift, counted up to now. */
  minutes: number;
}

export interface StaffMonthSummary {
  member: StaffMember;
  totalMinutes: number;
  shifts: number;
  isClockedIn: boolean;
}

export interface MonthRef {
  year: number;
  month: number; // 0-based, like Date#getMonth()
}

export function currentMonth(): MonthRef {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function shiftMonth(ref: MonthRef, delta: number): MonthRef {
  const date = new Date(ref.year, ref.month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function formatMonthLabel(ref: MonthRef): string {
  return new Date(ref.year, ref.month, 1).toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric",
  });
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

function entryMinutes(clockIn: string, clockOut: string | null): number {
  const end = clockOut ? new Date(clockOut).getTime() : Date.now();
  const start = new Date(clockIn).getTime();
  return Math.max(0, Math.round((end - start) / 60000));
}

function monthRange(ref: MonthRef): { from: string; to: string } {
  return {
    from: new Date(ref.year, ref.month, 1).toISOString(),
    to: new Date(ref.year, ref.month + 1, 1).toISOString(),
  };
}

type EntryRow = {
  id: string;
  profile_id: string;
  clock_in: string;
  clock_out: string | null;
};

function mapEntry(row: EntryRow): TimeEntry {
  return {
    id: row.id,
    profileId: row.profile_id,
    clockIn: row.clock_in,
    clockOut: row.clock_out,
    minutes: entryMinutes(row.clock_in, row.clock_out),
  };
}

export async function getOpenEntry(): Promise<TimeEntry | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data } = await supabase
    .from("staff_time_entries")
    .select("id, profile_id, clock_in, clock_out")
    .eq("profile_id", getCurrentUser().id)
    .is("clock_out", null)
    .order("clock_in", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ? mapEntry(data) : null;
}

export async function clockIn(): Promise<boolean> {
  const daycareId = getCurrentDaycareId();
  if (!isSupabaseConfigured || !supabase || !daycareId) {
    return false;
  }

  const { error } = await supabase.from("staff_time_entries").insert({
    daycare_id: daycareId,
    profile_id: getCurrentUser().id,
  });

  return !error;
}

export async function clockOut(entryId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false;
  }

  const { error } = await supabase
    .from("staff_time_entries")
    .update({ clock_out: new Date().toISOString() })
    .eq("id", entryId);

  return !error;
}

export async function getMemberMonthEntries(
  profileId: string,
  ref: MonthRef,
): Promise<TimeEntry[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { from, to } = monthRange(ref);
  const { data } = await supabase
    .from("staff_time_entries")
    .select("id, profile_id, clock_in, clock_out")
    .eq("profile_id", profileId)
    .gte("clock_in", from)
    .lt("clock_in", to)
    .order("clock_in", { ascending: false });

  return (data ?? []).map(mapEntry);
}

export async function getMyMonthEntries(ref: MonthRef): Promise<TimeEntry[]> {
  return getMemberMonthEntries(getCurrentUser().id, ref);
}

export function sumMinutes(entries: TimeEntry[]): number {
  return entries.reduce((total, entry) => total + entry.minutes, 0);
}

/** Admin view: every staff member with their monthly totals. */
export async function getStaffMonthSummary(ref: MonthRef): Promise<StaffMonthSummary[]> {
  const daycareId = getCurrentDaycareId();
  if (!isSupabaseConfigured || !supabase || !daycareId) {
    return [];
  }

  const { from, to } = monthRange(ref);
  const [members, entriesResult] = await Promise.all([
    getStaffMembers(),
    supabase
      .from("staff_time_entries")
      .select("id, profile_id, clock_in, clock_out")
      .eq("daycare_id", daycareId)
      .gte("clock_in", from)
      .lt("clock_in", to),
  ]);

  const entries = (entriesResult.data ?? []).map(mapEntry);

  return members.map((member) => {
    const own = entries.filter((entry) => entry.profileId === member.id);
    return {
      member,
      totalMinutes: sumMinutes(own),
      shifts: own.length,
      isClockedIn: own.some((entry) => entry.clockOut === null),
    };
  });
}
