import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getUpcomingEvents } from "../../src/services/calendar.service";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const TYPE_META: Record<string, { label: string; icon: IoniconName }> = {
  trip: { label: "טיול", icon: "bus-outline" },
  event: { label: "אירוע", icon: "sparkles-outline" },
  meeting: { label: "פגישה", icon: "people-outline" },
  holiday: { label: "חופש", icon: "sunny-outline" },
};

export default function ParentUpcomingEventsScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("parent");
  const { data, loading, error, reload } = useAsyncData(() => getUpcomingEvents(), []);
  const events = data ?? [];

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push("/parent/home");
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader
          variant="back"
          onLeadingPress={handleBack}
          onBellPress={() => router.push("/notifications")}
        />
        <Text style={styles.title}>אירועים קרובים</Text>
        <Text style={styles.subtitle}>טיולים, מפגשים ואירועים בגן</Text>

        {loading ? (
          <AppStateCard state="loading" title="טוען אירועים" message="רגע..." />
        ) : error ? (
          <AppStateCard
            state="error"
            title="לא הצלחנו לטעון"
            message="אירעה שגיאה בטעינת האירועים."
            actionLabel="נסו שוב"
            onActionPress={reload}
          />
        ) : events.length === 0 ? (
          <AppStateCard
            state="empty"
            title="אין אירועים קרובים"
            message="אירועים וטיולים מהגן יופיעו כאן."
          />
        ) : (
          <View style={styles.list}>
            {events.map((event) => {
              const meta = TYPE_META[event.type] ?? TYPE_META.event;
              return (
                <AppCard key={event.id} style={styles.eventCard}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>{event.day}</Text>
                    <Text style={styles.dateMonth}>{event.month}</Text>
                  </View>

                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventMetaRow}>
                      <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                      <Text style={styles.eventTime}>{event.time || "כל היום"}</Text>
                    </View>
                  </View>

                  <View style={styles.typeChip}>
                    <Ionicons name={meta.icon} size={14} color={Colors.primary} />
                    <Text style={styles.typeText}>{meta.label}</Text>
                  </View>
                </AppCard>
              );
            })}
          </View>
        )}
      </AppScreen>

      <BottomNavBar activeItem="home" variant="parent" onItemPress={handleBottomNavPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
  },
  screenContent: {
    paddingBottom: Spacing.xxl,
  },
  title: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  list: {
    gap: Spacing.sm,
  },
  eventCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },
  dateBox: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  dateDay: {
    ...Typography.title,
    color: Colors.primary,
  },
  dateMonth: {
    ...Typography.labelBold,
    color: Colors.primary,
  },
  eventInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  eventTitle: {
    ...Typography.subtitle,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  eventMetaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  eventTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  typeChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
  },
  typeText: {
    ...Typography.labelBold,
    color: Colors.primary,
  },
});
