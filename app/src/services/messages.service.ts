import { mockMessageThreads } from "../data/mockMessages";
import type { ChatMessage, MessageThread } from "../data/mockMessages";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { Database } from "../types/database";
import { getCurrentDaycareId, getCurrentUser, getCurrentUserRole } from "./auth.service";
import { formatTimeHHMM, mapChatMessage, resolveSenderInitial } from "./mappers";
import { createNotification } from "./notifications.service";

type ThreadRow = Database["public"]["Tables"]["message_threads"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

type MessageWithSender = MessageRow & {
  profiles?: { full_name: string } | null;
};

async function fetchMessagesForThreads(
  sb: NonNullable<typeof supabase>,
  threadIds: string[],
): Promise<MessageWithSender[]> {
  if (threadIds.length === 0) {
    return [];
  }

  const { data: messages } = await (
    threadIds.length === 1
      ? sb.from("messages").select("*").eq("thread_id", threadIds[0])
      : sb.from("messages").select("*").in("thread_id", threadIds)
  ).order("created_at");

  const rows = messages ?? [];
  const senderIds = [
    ...new Set(rows.map((message) => message.sender_id).filter((id): id is string => Boolean(id))),
  ];

  const profileMap = new Map<string, string>();
  if (senderIds.length > 0) {
    const { data: profiles } = await sb
      .from("profiles")
      .select("id, full_name")
      .in("id", senderIds);
    for (const profile of profiles ?? []) {
      profileMap.set(profile.id, profile.full_name);
    }
  }

  return rows.map((message) => ({
    ...message,
    profiles: message.sender_id
      ? { full_name: profileMap.get(message.sender_id) ?? "" }
      : null,
  }));
}

function buildThread(thread: ThreadRow, messages: MessageWithSender[], myId: string): MessageThread {
  const chat = messages.map((message) => mapChatMessage(message, myId, thread.title));
  const last = messages[messages.length - 1];
  const unreadCount = messages.filter(
    (message) => message.sender_id !== myId && !message.is_read,
  ).length;

  return {
    id: thread.id,
    name: thread.title,
    subtitle: thread.subtitle ?? "",
    avatarInitial: thread.avatar_initial ?? thread.title.slice(0, 1),
    lastMessage: last?.body ?? "",
    lastTime: last ? formatTimeHHMM(last.created_at) : "",
    unreadCount,
    kind: thread.kind === "direct" ? "direct" : "broadcast",
    parentProfileId: thread.parent_profile_id ?? undefined,
    messages: chat,
  };
}

export async function getMessageThreads(): Promise<MessageThread[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockMessageThreads;
  }

  const sb = supabase;
  const myId = getCurrentUser().id;

  const { data: threads, error } = await sb
    .from("message_threads")
    .select("*")
    .order("created_at");

  if (error || !threads) {
    return [];
  }

  const threadIds = threads.map((thread) => thread.id);
  const allMessages = await fetchMessagesForThreads(sb, threadIds);

  return threads.map((thread) =>
    buildThread(
      thread,
      allMessages.filter((message) => message.thread_id === thread.id),
      myId,
    ),
  );
}

export async function getMessageThreadById(
  threadId: string | undefined,
): Promise<MessageThread | undefined> {
  if (!threadId) {
    return undefined;
  }

  if (!isSupabaseConfigured || !supabase) {
    return mockMessageThreads.find((thread) => thread.id === threadId);
  }

  const sb = supabase;
  const myId = getCurrentUser().id;

  const { data: thread, error } = await sb
    .from("message_threads")
    .select("*")
    .eq("id", threadId)
    .single();

  if (error || !thread) {
    return undefined;
  }

  const messages = await fetchMessagesForThreads(sb, [threadId]);

  return buildThread(thread, messages, myId);
}

export async function sendMessage(
  threadId: string,
  body: string,
): Promise<ChatMessage | null> {
  if (!isSupabaseConfigured || !supabase) {
    const user = getCurrentUser();
    return {
      id: `local-${Date.now()}`,
      fromMe: true,
      text: body,
      time: formatTimeHHMM(new Date().toISOString()),
      senderInitial: resolveSenderInitial(user.name),
      senderName: user.name,
    };
  }

  const sb = supabase;
  const user = getCurrentUser();
  const myId = user.id;

  const { data, error } = await sb
    .from("messages")
    .insert({ thread_id: threadId, sender_id: myId, body })
    .select("*")
    .single();

  if (error || !data) {
    return null;
  }

  // Fan-out a notification to the other side of the conversation. Failures
  // here must not block the message itself, so the result is ignored.
  await notifyThreadRecipients(sb, threadId, myId, body);

  return mapChatMessage({ ...data, profiles: { full_name: user.name } }, myId);
}

async function notifyThreadRecipients(
  sb: NonNullable<typeof supabase>,
  threadId: string,
  senderId: string,
  body: string,
): Promise<void> {
  const { data: thread } = await sb
    .from("message_threads")
    .select("kind, parent_profile_id, title")
    .eq("id", threadId)
    .single();

  if (!thread) {
    return;
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return;
  }

  let recipientIds: string[] = [];
  if (thread.kind === "direct") {
    if (getCurrentUserRole() === "parent") {
      const { data: staff } = await sb
        .from("profiles")
        .select("id")
        .eq("daycare_id", daycareId)
        .in("role", ["teacher", "admin"]);
      recipientIds = (staff ?? []).map((row) => row.id);
    } else if (thread.parent_profile_id) {
      recipientIds = [thread.parent_profile_id];
    }
  } else {
    const { data: parents } = await sb
      .from("profiles")
      .select("id")
      .eq("daycare_id", daycareId)
      .eq("role", "parent");
    recipientIds = (parents ?? []).map((row) => row.id);
  }

  recipientIds = recipientIds.filter((id) => id !== senderId);
  if (recipientIds.length === 0) {
    return;
  }

  await createNotification({
    recipientIds,
    type: "message",
    title: thread.title,
    body,
  });
}

export interface ParentOption {
  profileId: string;
  name: string;
}

export async function getParentOptions(): Promise<ParentOption[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return [];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("daycare_id", daycareId)
    .eq("role", "parent")
    .order("full_name");

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({ profileId: row.id, name: row.full_name }));
}

export async function createThread(input: {
  kind: "broadcast" | "direct";
  title: string;
  subtitle?: string;
  parentProfileId?: string;
}): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) {
    return `local-thread-${Date.now()}`;
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return null;
  }

  const { data, error } = await supabase
    .from("message_threads")
    .insert({
      daycare_id: daycareId,
      title: input.title,
      subtitle: input.subtitle || null,
      avatar_initial: input.title.slice(0, 1),
      kind: input.kind,
      parent_profile_id: input.parentProfileId || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

export async function getOrCreateParentStaffThread(): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) {
    return "local-parent-staff-thread";
  }

  const daycareId = getCurrentDaycareId();
  const parentId = getCurrentUser().id;
  if (!daycareId || getCurrentUserRole() !== "parent") {
    return null;
  }

  const { data: existing } = await supabase
    .from("message_threads")
    .select("id")
    .eq("daycare_id", daycareId)
    .eq("kind", "direct")
    .eq("parent_profile_id", parentId)
    .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  return createThread({
    kind: "direct",
    title: "צוות הגן",
    subtitle: "הודעה פרטית לגן",
    parentProfileId: parentId,
  });
}

export async function deleteThread(threadId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase.from("message_threads").delete().eq("id", threadId);
  return !error;
}

export async function markThreadRead(threadId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const myId = getCurrentUser().id;
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("thread_id", threadId)
    .neq("sender_id", myId)
    .eq("is_read", false);

  return !error;
}
