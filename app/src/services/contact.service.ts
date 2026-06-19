import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  getCurrentDaycareId,
  getCurrentUser,
} from "./auth.service";
import { createNotification } from "./notifications.service";

export interface ContactMessage {
  id: string;
  subject: string | null;
  body: string;
  senderName: string;
  createdAt: string;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return [];
  }

  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, subject, body, created_at, sender_id")
    .eq("daycare_id", daycareId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const senderIds = [...new Set(data.map((row) => row.sender_id).filter(Boolean))] as string[];
  const senderNames = new Map<string, string>();

  if (senderIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", senderIds);

    for (const profile of profiles ?? []) {
      senderNames.set(profile.id, profile.full_name);
    }
  }

  return data.map((row) => ({
    id: row.id,
    subject: row.subject,
    body: row.body,
    senderName: row.sender_id ? (senderNames.get(row.sender_id) ?? "הורה") : "הורה",
    createdAt: row.created_at,
  }));
}

export async function submitContactMessage(input: {
  subject?: string;
  body: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const daycareId = getCurrentDaycareId();
  const userId = getCurrentUser().id;
  if (!daycareId) {
    return false;
  }

  const { error } = await supabase.from("contact_messages").insert({
    daycare_id: daycareId,
    sender_id: userId,
    subject: input.subject?.trim() || null,
    body: input.body.trim(),
  });

  if (error) {
    return false;
  }

  const { data: staff } = await supabase
    .from("profiles")
    .select("id")
    .eq("daycare_id", daycareId)
    .in("role", ["teacher", "admin"]);

  const recipientIds = (staff ?? []).map((row) => row.id).filter((id) => id !== userId);
  if (recipientIds.length > 0) {
    await createNotification({
      recipientIds,
      type: "contact",
      title: input.subject?.trim() || "פנייה מהורה",
      body: input.body.trim(),
    });
  }

  return true;
}
