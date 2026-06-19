import {
  mockDailyActivities,
  mockDailyMeals,
  mockDailyMessages,
  mockDailyNotes,
  mockDailyReportSummary,
} from "../data/mockDailyReports";
import type {
  DailyActivity,
  DailyMeal,
  DailyMessage,
  DailyNote,
} from "../data/mockDailyReports";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { catalogImageUrl } from "./activityCatalog.service";
import { getCurrentDaycareId } from "./auth.service";
import { mapActivity, mapMeal, mapNote, todayIso } from "./mappers";

export interface DailyReportSummary {
  date: string;
  presentChildren: number;
  totalChildren: number;
  activitiesCount: number;
  mealsCount: number;
  messagesCount: number;
  notesCount: number;
}

async function getTodayReportId(): Promise<string | null> {
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("daily_reports")
    .select("id")
    .eq("report_date", todayIso())
    .limit(1);
  return data?.[0]?.id ?? null;
}

export async function getDailyReportSummary(): Promise<DailyReportSummary> {
  if (!isSupabaseConfigured || !supabase) {
    return mockDailyReportSummary;
  }

  const sb = supabase;
  const reportId = await getTodayReportId();

  const [childResult, attendanceResult, activityResult, mealResult, noteResult] =
    await Promise.all([
      sb.from("children").select("id"),
      sb
        .from("attendance_records")
        .select("status")
        .eq("attendance_date", todayIso()),
      reportId
        ? sb.from("daily_activities").select("id").eq("report_id", reportId)
        : Promise.resolve({ data: [] as { id: string }[] }),
      reportId
        ? sb.from("daily_meals").select("id").eq("report_id", reportId)
        : Promise.resolve({ data: [] as { id: string }[] }),
      reportId
        ? sb.from("daily_notes").select("id").eq("report_id", reportId)
        : Promise.resolve({ data: [] as { id: string }[] }),
    ]);

  const totalChildren = childResult.data?.length ?? 0;
  const presentChildren = (attendanceResult.data ?? []).filter(
    (record) => record.status === "arrived" || record.status === "late",
  ).length;

  return {
    date: todayIso(),
    presentChildren,
    totalChildren,
    activitiesCount: activityResult.data?.length ?? 0,
    mealsCount: mealResult.data?.length ?? 0,
    messagesCount: 0,
    notesCount: noteResult.data?.length ?? 0,
  };
}

export async function getDailyActivities(): Promise<DailyActivity[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockDailyActivities;
  }

  const sb = supabase;
  const reportId = await getTodayReportId();
  if (!reportId) {
    return [];
  }

  const { data } = await sb
    .from("daily_activities")
    .select("*")
    .eq("report_id", reportId)
    .order("activity_time");

  const activities = data ?? [];
  const catalogIds = Array.from(
    new Set(
      activities
        .map((row) => row.catalog_id)
        .filter((value): value is string => value !== null),
    ),
  );

  const imageByCatalogId = new Map<string, string | null>();
  if (catalogIds.length > 0) {
    const { data: catalogRows } = await sb
      .from("activity_catalog")
      .select("id, image_path")
      .in("id", catalogIds);
    for (const row of catalogRows ?? []) {
      imageByCatalogId.set(row.id, catalogImageUrl(row.image_path));
    }
  }

  return activities.map((row) =>
    mapActivity(row, row.catalog_id ? imageByCatalogId.get(row.catalog_id) : null),
  );
}

export async function getDailyMeals(): Promise<DailyMeal[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockDailyMeals;
  }

  const reportId = await getTodayReportId();
  if (!reportId) {
    return [];
  }

  const { data } = await supabase
    .from("daily_meals")
    .select("*")
    .eq("report_id", reportId)
    .order("meal_time");
  return (data ?? []).map(mapMeal);
}

export async function getDailyMessages(): Promise<DailyMessage[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockDailyMessages;
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return [];
  }

  const { data: threads } = await supabase
    .from("message_threads")
    .select("id")
    .eq("daycare_id", daycareId)
    .eq("kind", "broadcast");

  const threadIds = (threads ?? []).map((thread) => thread.id);
  if (threadIds.length === 0) {
    return [];
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .in("thread_id", threadIds)
    .order("created_at", { ascending: false })
    .limit(10);

  return (messages ?? [])
    .reverse()
    .map((message) => ({
      id: message.id,
      from: "הגן",
      time: new Date(message.created_at).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: message.body,
      isRead: message.is_read,
    }));
}

export async function getDailyNotes(): Promise<DailyNote[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockDailyNotes;
  }

  const sb = supabase;
  const reportId = await getTodayReportId();
  if (!reportId) {
    return [];
  }

  const [noteResult, childResult] = await Promise.all([
    sb.from("daily_notes").select("*").eq("report_id", reportId),
    sb.from("children").select("id, full_name"),
  ]);

  const nameById = new Map((childResult.data ?? []).map((row) => [row.id, row.full_name]));

  return (noteResult.data ?? []).map((row) =>
    mapNote(row, row.child_id ? nameById.get(row.child_id) : undefined),
  );
}

async function ensureTodayReportId(): Promise<string | null> {
  if (!supabase) {
    return null;
  }

  const existing = await getTodayReportId();
  if (existing) {
    return existing;
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return null;
  }

  const { data, error } = await supabase
    .from("daily_reports")
    .insert({ daycare_id: daycareId, report_date: todayIso() })
    .select("id")
    .single();

  if (error || !data) {
    return await getTodayReportId();
  }

  return data.id;
}

export async function addDailyActivity(input: {
  title: string;
  time?: string;
  description?: string;
  category?: string;
  catalogId?: string | null;
}): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const reportId = await ensureTodayReportId();
  if (!reportId) {
    return false;
  }

  const { error } = await supabase.from("daily_activities").insert({
    report_id: reportId,
    title: input.title,
    description: input.description || null,
    activity_time: input.time ? input.time : null,
    category: input.category || null,
    catalog_id: input.catalogId || null,
  });

  return !error;
}

export async function updateDailyActivity(
  id: string,
  input: { title?: string; time?: string; description?: string; category?: string },
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase
    .from("daily_activities")
    .update({
      title: input.title,
      description: input.description ?? null,
      activity_time: input.time ? input.time : null,
      category: input.category ?? null,
    })
    .eq("id", id);

  return !error;
}

export async function deleteDailyActivity(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase.from("daily_activities").delete().eq("id", id);
  return !error;
}

export async function addDailyMeal(input: {
  mealType: string;
  title: string;
  time?: string;
  description?: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const reportId = await ensureTodayReportId();
  if (!reportId) {
    return false;
  }

  const { error } = await supabase.from("daily_meals").insert({
    report_id: reportId,
    meal_type: input.mealType,
    title: input.title,
    description: input.description || null,
    meal_time: input.time ? input.time : null,
  });

  return !error;
}

export async function updateDailyMeal(
  id: string,
  input: { mealType?: string; title?: string; time?: string; description?: string },
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase
    .from("daily_meals")
    .update({
      meal_type: input.mealType,
      title: input.title,
      description: input.description ?? null,
      meal_time: input.time ? input.time : null,
    })
    .eq("id", id);

  return !error;
}

export async function deleteDailyMeal(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase.from("daily_meals").delete().eq("id", id);
  return !error;
}

export async function updateDailyNote(
  id: string,
  input: { childId?: string | null; noteType?: string; text?: string },
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase
    .from("daily_notes")
    .update({
      child_id: input.childId ?? null,
      note_type: input.noteType,
      text: input.text,
    })
    .eq("id", id);

  return !error;
}

export async function deleteDailyNote(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase.from("daily_notes").delete().eq("id", id);
  return !error;
}

export async function addDailyNote(input: {
  childId: string | null;
  noteType: string;
  text: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const reportId = await ensureTodayReportId();
  if (!reportId) {
    return false;
  }

  const { error } = await supabase.from("daily_notes").insert({
    report_id: reportId,
    child_id: input.childId,
    note_type: input.noteType,
    text: input.text,
  });

  return !error;
}
