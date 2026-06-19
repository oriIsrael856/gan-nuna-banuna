import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "../src/components/AppCard";
import { AppHeader } from "../src/components/AppHeader";
import { AppScreen } from "../src/components/AppScreen";
import { AppStateCard } from "../src/components/AppStateCard";
import { BottomNavBar } from "../src/components/BottomNavBar";
import { useAsyncData } from "../src/hooks/useAsyncData";
import { useNotifications } from "../src/notifications/NotificationsContext";
import { useBottomNavPress } from "../src/navigation/useBottomNavPress";
import { getCurrentUserRole } from "../src/services/auth.service";
import { getNotifications } from "../src/services/notifications.service";
import { Colors } from "../src/theme/colors";
import { BorderRadius, Spacing } from "../src/theme/spacing";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const TYPE_ICONS: Record<string, IoniconName> = {
  message: "chatbubble-ellipses-outline",
  contract: "document-text-outline",
  event: "calendar-outline",
  daily: "sunny-outline",
};

export default function NotificationsScreen() {
  const router = useRouter();
  const role = getCurrentUserRole();
  const variant = role === "teacher" ? "teacher" : "parent";
  const handleBottomNavPress = useBottomNavPress(variant);
  const { markAllRead } = useNotifications();
  const { data, loading, error, reload } = useAsyncData(() => getNotifications(), []);
  const notifications = data ?? [];

  useEffect(() => {
    // Mark notifications as read once the screen is viewed, then refresh the list.
    markAllRead().then(() => reload());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push(variant === "teacher" ? "/teacher/home" : "/parent/home");
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader variant="back" notificationCount={0} onLeadingPress={handleBack} onBellPress={() => {}} />
        <Text style={styles.title}>התראות</Text>
        <Text style={styles.subtitle}>כל העדכונים שלך במקום אחד</Text>

        {loading ? (
          <AppStateCard state="loading" title="טוען התראות" message="רגע, טוענים את ההתראות" />
        ) : error ? (
          <AppStateCard
            state="error"
            title="לא הצלחנו לטעון"
            message="אירעה שגיאה בטעינת ההתראות. נסו שוב."
            actionLabel="נסו שוב"
            onActionPress={reload}
          />
        ) : notifications.length === 0 ? (
          <AppStateCard
            state="empty"
            title="אין התראות"
            message="כל ההתראות החדשות יופיעו כאן."
          />
        ) : (
          <View style={styles.list}>
            {notifications.map((item) => (
            <AppCard
              key={item.id}
              style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
            >
              <View style={styles.notifIcon}>
                <Ionicons
                  name={TYPE_ICONS[item.type] ?? "notifications-outline"}
                  size={20}
                  color={Colors.primary}
                />
              </View>

              <View style={styles.notifInfo}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifText}>{item.text}</Text>
                <Text style={styles.notifTime}>{item.time}</Text>
              </View>

              {!item.isRead ? <View style={styles.unreadDot} /> : null}
            </AppCard>
            ))}
          </View>
        )}
      </AppScreen>

      <BottomNavBar
        activeItem="home"
        variant={variant}
        onItemPress={handleBottomNavPress}
      />
    </View>
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
  list: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  notifCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },
  notifCardUnread: {
    backgroundColor: Colors.sentBackground,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  notifInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  notifText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
    lineHeight: 19,
  },
  notifTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
});
