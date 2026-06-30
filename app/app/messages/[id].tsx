import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { AppHeader } from "../../src/components/AppHeader";
import { MessageAvatar } from "../../src/components/MessageAvatar";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useNotifications } from "../../src/notifications/NotificationsContext";
import { getCurrentUser, getCurrentUserRole } from "../../src/services/auth.service";
import { mapChatMessage } from "../../src/services/mappers";
import { isSupabaseConfigured, supabase } from "../../src/lib/supabase";
import {
  getMessageThreadById,
  markThreadRead,
  sendMessage,
} from "../../src/services/messages.service";
import type { ChatMessage } from "../../src/data/mockMessages";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Shadow, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

export default function ConversationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { refresh } = useNotifications();
  const isParent = getCurrentUserRole() === "parent";
  const { data: thread } = useAsyncData(
    () => getMessageThreadById(params.id),
    [params.id],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (thread) {
      setMessages(thread.messages);
      // Reading the conversation clears its unread messages + notifications.
      markThreadRead(thread.id).then(() => refresh());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !params.id) {
      return;
    }

    const sb = supabase;
    const myId = getCurrentUser().id;
    const threadTitle = thread?.name;

    const channel = sb
      .channel(`thread-messages-${params.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${params.id}`,
        },
        async (payload) => {
          const row = payload.new as {
            id: string;
            thread_id: string;
            sender_id: string | null;
            body: string;
            created_at: string;
          };

          let profiles: { full_name: string } | null = null;
          if (row.sender_id) {
            const { data } = await sb
              .from("profiles")
              .select("full_name")
              .eq("id", row.sender_id)
              .single();
            profiles = data;
          }

          const mapped = mapChatMessage(
            {
              id: row.id,
              thread_id: row.thread_id,
              sender_id: row.sender_id,
              body: row.body,
              is_read: false,
              created_at: row.created_at,
              profiles,
            },
            myId,
            threadTitle,
          );

          setMessages((prev) => {
            if (prev.some((message) => message.id === mapped.id)) {
              return prev;
            }
            return [...prev, mapped];
          });
          refresh();
        },
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [params.id, thread?.name, refresh]);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push("/messages");
  }

  const canSend = !isParent || thread?.kind === "direct";

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) {
      return;
    }

    setDraft("");
    setSending(true);
    const sent = await sendMessage(params.id, text);
    setSending(false);

    if (sent) {
      setMessages((prev) => [...prev, sent]);
      refresh();
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.headerArea}>
        <AppHeader
          variant="back"
          notificationCount={0}
          onLeadingPress={handleBack}
          onBellPress={() => router.push("/notifications")}
        />
        <Text style={styles.headerName}>{thread ? thread.name : "שיחה"}</Text>
        {thread ? <Text style={styles.headerSubtitle}>{thread.subtitle}</Text> : null}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.bubbleRow,
                message.fromMe ? styles.bubbleRowMine : styles.bubbleRowTheirs,
              ]}
            >
              {!message.fromMe ? (
                <MessageAvatar
                  initial={message.senderInitial}
                  variant="sender"
                  size="sm"
                />
              ) : null}
              <View
                style={[
                  styles.bubble,
                  message.fromMe ? styles.bubbleMine : styles.bubbleTheirs,
                ]}
              >
                <Text style={[styles.bubbleText, message.fromMe && styles.bubbleTextMine]}>
                  {message.text}
                </Text>
                <Text style={[styles.bubbleTime, message.fromMe && styles.bubbleTimeMine]}>
                  {message.time}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {canSend ? (
          <View style={styles.inputBar}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSend}
              style={styles.sendButton}
              accessibilityRole="button"
              accessibilityLabel="שליחה"
            >
              <Ionicons name="send" size={18} color={Colors.white} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="הקלד הודעה..."
              placeholderTextColor={Colors.textSecondary}
              textAlign="right"
              multiline
            />
          </View>
        ) : (
          <View style={styles.readOnlyBar}>
            <Ionicons name="megaphone-outline" size={18} color={Colors.primary} />
            <Text style={styles.readOnlyText}>הודעה כללית מהגן — לקריאה בלבד</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
  },
  flex: {
    flex: 1,
  },
  headerArea: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerName: {
    ...Typography.title,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  messagesContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  bubbleRowMine: {
    justifyContent: "flex-start",
  },
  bubbleRowTheirs: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  bubbleMine: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: Colors.cardBackground,
    borderBottomRightRadius: 4,
    ...Shadow.card,
  },
  bubbleText: {
    ...Typography.body,
    color: Colors.textPrimary,
    textAlign: "right",
  },
  bubbleTextMine: {
    color: Colors.white,
  },
  bubbleTime: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: "left",
    marginTop: 4,
  },
  bubbleTimeMine: {
    color: "rgba(255,255,255,0.8)",
  },
  inputBar: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  input: {
    ...Typography.body,
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === "ios" ? 12 : 8,
    paddingBottom: Platform.OS === "ios" ? 12 : 8,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    color: Colors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },
  readOnlyBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  readOnlyText: {
    ...Typography.body,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "right",
  },
});
