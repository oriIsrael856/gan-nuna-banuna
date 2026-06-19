import { mockNotifications } from "../data/mockNotifications";
import type { AppNotification } from "../data/mockNotifications";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { getCurrentDaycareId, getCurrentUser } from "./auth.service";
import { mapNotification } from "./mappers";

function recipientFilter(userId: string) {
  return `recipient_id.eq.${userId},recipient_id.is.null`;
}

export interface CreateNotificationInput {
  recipientIds: string[];
  type?: string;
  title: string;
  body?: string;
}

export async function getNotifications(): Promise<AppNotification[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockNotifications;
  }

  const userId = getCurrentUser().id;
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .or(recipientFilter(userId))
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(mapNotification);
}

export async function getUnreadNotificationsCount(): Promise<number> {
  if (!isSupabaseConfigured || !supabase) {
    return mockNotifications.filter((item) => !item.isRead).length;
  }

  const userId = getCurrentUser().id;
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)
    .or(recipientFilter(userId));

  if (error || count === null) {
    return 0;
  }

  return count;
}

export async function markNotificationRead(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  return !error;
}

export async function markAllNotificationsRead(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const userId = getCurrentUser().id;
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false)
    .or(recipientFilter(userId));

  return !error;
}

/**
 * Fan-out: inserts one notification row per recipient so read-state and the
 * unread counter are correct per user. No-op in mock mode.
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId || input.recipientIds.length === 0) {
    return false;
  }

  const rows = input.recipientIds.map((recipientId) => ({
    daycare_id: daycareId,
    recipient_id: recipientId,
    type: input.type || "message",
    title: input.title,
    body: input.body || null,
  }));

  const { error } = await supabase.from("notifications").insert(rows);
  return !error;
}
