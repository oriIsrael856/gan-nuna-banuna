import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { MessageAvatar } from "../../src/components/MessageAvatar";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getCurrentUserRole } from "../../src/services/auth.service";
import {
  createThread,
  deleteThread,
  getMessageThreads,
  getOrCreateParentStaffThread,
  getParentOptions,
} from "../../src/services/messages.service";
import type { MessageThread } from "../../src/data/mockMessages";
import { confirmDelete } from "../../src/utils/confirm";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";

export default function MessagesScreen() {
  const router = useRouter();
  const role = getCurrentUserRole();
  const isTeacher = role === "teacher";
  const variant = isTeacher ? "teacher" : "parent";
  const handleBottomNavPress = useBottomNavPress(variant);
  const { data, loading, error, reload } = useAsyncData(() => getMessageThreads(), []);
  const threads = data ?? [];

  const [composerOpen, setComposerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const {
    data: parentOptions,
    loading: parentsLoading,
  } = useAsyncData(() => (isTeacher ? getParentOptions() : Promise.resolve([])), [isTeacher]);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push(variant === "teacher" ? "/teacher/home" : "/parent/home");
  }

  function handleDeleteThread(id: string) {
    confirmDelete("למחוק את השיחה?", async () => {
      await deleteThread(id);
      reload();
    });
  }

  async function startThread(kind: "broadcast" | "direct", parent?: { profileId: string; name: string }) {
    if (creating) {
      return;
    }
    setCreating(true);
    const id = await createThread({
      kind,
      title: kind === "broadcast" ? "עדכון לכל ההורים" : parent?.name ?? "הורה",
      subtitle: kind === "broadcast" ? "הודעה לכל ההורים" : "הודעה פרטית",
      parentProfileId: parent?.profileId,
    });
    setCreating(false);
    setComposerOpen(false);
    if (id) {
      router.push(`/messages/${id}`);
    }
  }

  async function openParentStaffChat() {
    if (creating) {
      return;
    }
    setCreating(true);
    const id = await getOrCreateParentStaffThread();
    setCreating(false);
    if (id) {
      router.push(`/messages/${id}`);
    }
  }

  const broadcastThreads = threads.filter((thread) => thread.kind === "broadcast");
  const privateThreads = threads.filter((thread) => thread.kind === "direct");

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader
          variant="back"
          notificationCount={0}
          onLeadingPress={handleBack}
          onBellPress={() => router.push("/notifications")}
        />
        <Text style={styles.title}>הודעות</Text>
        <Text style={styles.subtitle}>
          {isTeacher ? "שיחות עם ההורים" : "עדכונים מהגן והודעות פרטיות לצוות"}
        </Text>

        {isTeacher ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.newButton}
            onPress={() => setComposerOpen(true)}
          >
            <Ionicons name="create-outline" size={18} color={Colors.white} />
            <Text style={styles.newButtonText}>הודעה חדשה</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.newButton}
            disabled={creating}
            onPress={openParentStaffChat}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.white} />
            <Text style={styles.newButtonText}>
              {creating ? "פותח שיחה..." : "שליחת הודעה לצוות הגן"}
            </Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <AppStateCard state="loading" title="טוען הודעות" message="רגע, טוענים את השיחות" />
        ) : error ? (
          <AppStateCard
            state="error"
            title="לא הצלחנו לטעון"
            message="אירעה שגיאה בטעינת ההודעות. נסו שוב."
            actionLabel="נסו שוב"
            onActionPress={reload}
          />
        ) : threads.length === 0 ? (
          <AppStateCard
            state="empty"
            title="אין הודעות"
            message={
              isTeacher
                ? "שיחות עם ההורים יופיעו כאן."
                : "עדכונים מהגן יופיעו כאן. לשליחת הודעה פרטית לחצו על הכפתור למעלה."
            }
          />
        ) : (
          <View style={styles.list}>
            {isTeacher ? (
              threads.map((thread) => (
                <ThreadRow
                  key={thread.id}
                  thread={thread}
                  onPress={() => router.push(`/messages/${thread.id}`)}
                  onLongPress={() => handleDeleteThread(thread.id)}
                />
              ))
            ) : (
              <>
                {privateThreads.length > 0 ? (
                  <>
                    <Text style={styles.listSectionTitle}>שיחה עם צוות הגן</Text>
                    {privateThreads.map((thread) => (
                      <ThreadRow
                        key={thread.id}
                        thread={thread}
                        onPress={() => router.push(`/messages/${thread.id}`)}
                      />
                    ))}
                  </>
                ) : null}

                {broadcastThreads.length > 0 ? (
                  <>
                    <Text style={styles.listSectionTitle}>הודעות כלליות מהגן</Text>
                    {broadcastThreads.map((thread) => (
                      <ThreadRow
                        key={thread.id}
                        thread={thread}
                        onPress={() => router.push(`/messages/${thread.id}`)}
                      />
                    ))}
                  </>
                ) : null}
              </>
            )}
          </View>
        )}
      </AppScreen>

      <Modal
        visible={composerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setComposerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setComposerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>הודעה חדשה</Text>
            <Text style={styles.modalSubtitle}>בחרו למי לשלוח</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.modalOption}
              disabled={creating}
              onPress={() => startThread("broadcast")}
            >
              <Ionicons name="megaphone-outline" size={20} color={Colors.primary} />
              <View style={styles.modalOptionInfo}>
                <Text style={styles.modalOptionTitle}>כל ההורים</Text>
                <Text style={styles.modalOptionSubtitle}>הודעה כללית לכולם</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.modalSectionLabel}>הורה ספציפי</Text>
            {parentsLoading ? (
              <ActivityIndicator color={Colors.primary} style={styles.modalLoader} />
            ) : (parentOptions ?? []).length === 0 ? (
              <Text style={styles.modalEmpty}>אין הורים רשומים עדיין.</Text>
            ) : (
              <View style={styles.parentList}>
                {(parentOptions ?? []).map((parent) => (
                  <TouchableOpacity
                    key={parent.profileId}
                    activeOpacity={0.85}
                    style={styles.modalOption}
                    disabled={creating}
                    onPress={() => startThread("direct", parent)}
                  >
                    <View style={styles.parentAvatar}>
                      <Text style={styles.parentAvatarText}>{parent.name.slice(0, 1)}</Text>
                    </View>
                    <View style={styles.modalOptionInfo}>
                      <Text style={styles.modalOptionTitle}>{parent.name}</Text>
                      <Text style={styles.modalOptionSubtitle}>הודעה פרטית</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.modalCancel}
              onPress={() => setComposerOpen(false)}
            >
              <Text style={styles.modalCancelText}>ביטול</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <BottomNavBar
        activeItem="home"
        variant={variant}
        onItemPress={handleBottomNavPress}
      />
    </View>
  );
}

function ThreadRow({
  thread,
  onPress,
  onLongPress,
}: {
  thread: MessageThread;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} onLongPress={onLongPress}>
      <AppCard style={styles.threadCard}>
        <MessageAvatar initial={thread.avatarInitial} variant={thread.kind} showBadge />

        <View style={styles.threadInfo}>
          <Text style={styles.threadName}>{thread.name}</Text>
          {thread.subtitle ? (
            <Text style={styles.threadSubtitle} numberOfLines={1}>
              {thread.subtitle}
            </Text>
          ) : null}
          <Text style={styles.threadLast} numberOfLines={1}>
            {thread.lastMessage}
          </Text>
        </View>

        <View style={styles.threadMeta}>
          <Text style={styles.threadTime}>{thread.lastTime}</Text>
          {thread.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{thread.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContent: {
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
  },
  newButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  newButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "800",
  },
  list: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  listSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  threadCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },
  threadInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  threadName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  threadSubtitle: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 2,
  },
  threadLast: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
  },
  threadMeta: {
    alignItems: "center",
    gap: 6,
  },
  threadTime: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },
  unreadText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "right",
    marginBottom: Spacing.sm,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  parentList: {
    gap: Spacing.xs,
  },
  modalOption: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  modalOptionInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  modalOptionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  modalOptionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
  },
  parentAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  parentAvatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
  },
  modalLoader: {
    marginVertical: Spacing.md,
  },
  modalEmpty: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginVertical: Spacing.md,
  },
  modalCancel: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textSecondary,
  },
});
