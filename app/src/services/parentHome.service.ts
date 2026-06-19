import {
  mockParentMessages,
  mockParentPhotos,
  mockParentStats,
} from "../data/mockParentHome";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  getCurrentDaycareId,
  getCurrentParentChildId,
} from "./auth.service";
import { getCalendarEvents } from "./calendar.service";
import { getUnreadNotificationsCount } from "./notifications.service";
import { todayIso } from "./mappers";

export interface ParentHomeStat {
  id: string;
  label: string;
  value: string;
  text: string;
}

export interface ParentHomePhoto {
  id: string;
  label: string;
  imageUrl?: string;
}

export interface ParentHomeMessage {
  id: string;
  date: string;
  title: string;
  description: string;
}

export async function getParentHomeStats(): Promise<ParentHomeStat[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockParentStats.filter((stat) => stat.id !== "payments");
  }

  const sb = supabase;
  const childId = getCurrentParentChildId();
  const today = todayIso();
  const monthStart = today.slice(0, 7) + "-01";

  const [events, unreadCount, attendanceResult] = await Promise.all([
    getCalendarEvents(),
    getUnreadNotificationsCount(),
    childId
      ? sb
          .from("attendance_records")
          .select("status")
          .eq("child_id", childId)
          .gte("attendance_date", monthStart)
          .lte("attendance_date", today)
      : Promise.resolve({ data: [] as { status: string }[] }),
  ]);

  const upcomingEvents = events.filter(
    (event) => (event.dateIso ?? "") >= today,
  ).slice(0, 7);
  const attendanceRows = attendanceResult.data ?? [];
  const presentDays = attendanceRows.filter(
    (row) => row.status === "arrived" || row.status === "late",
  ).length;

  return [
    {
      id: "events",
      label: "אירועים קרובים",
      value: String(upcomingEvents.length),
      text: "בשבוע הקרוב",
    },
    {
      id: "messages",
      label: "הודעות חדשות",
      value: String(unreadCount),
      text: "חדשות",
    },
    {
      id: "attendance",
      label: "נוכחות החודש",
      value: attendanceRows.length > 0 ? `${presentDays}/${attendanceRows.length}` : "—",
      text: "ימים",
    },
  ];
}

export async function getParentHomePhotos(): Promise<ParentHomePhoto[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockParentPhotos;
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return [];
  }

  const { data, error } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("daycare_id", daycareId)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data) {
    return [];
  }

  const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  return data.map((row) => ({
    id: row.id,
    label: row.label ?? "תמונה",
    imageUrl: baseUrl
      ? `${baseUrl}/storage/v1/object/public/gallery/${row.image_path}`
      : undefined,
  }));
}

export async function getParentHomeMessages(): Promise<ParentHomeMessage[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockParentMessages;
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return [];
  }

  const { data: threads } = await supabase
    .from("message_threads")
    .select("id, title")
    .eq("daycare_id", daycareId)
    .eq("kind", "broadcast")
    .order("created_at", { ascending: false })
    .limit(3);

  if (!threads?.length) {
    return [];
  }

  const threadIds = threads.map((thread) => thread.id);
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .in("thread_id", threadIds)
    .order("created_at", { ascending: false })
    .limit(5);

  const titleByThread = new Map(threads.map((thread) => [thread.id, thread.title]));

  return (messages ?? []).map((message) => ({
    id: message.id,
    date: new Date(message.created_at).toLocaleDateString("he-IL"),
    title: titleByThread.get(message.thread_id) ?? "עדכון מהגן",
    description: message.body,
  }));
}
