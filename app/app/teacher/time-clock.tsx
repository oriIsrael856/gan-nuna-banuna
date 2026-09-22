import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { TimeEntriesMonth } from "../../src/components/TimeEntriesMonth";
import { useDaycareColors } from "../../src/daycare/DaycareBrandingContext";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getCurrentUserRole } from "../../src/services/auth.service";
import {
  clockIn,
  clockOut,
  currentMonth,
  formatDuration,
  getMyMonthEntries,
  getOpenEntry,
  type MonthRef,
  type TimeEntry,
} from "../../src/services/staffTime.service";
import { showAlert } from "../../src/utils/alert";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

export default function TimeClockScreen() {
  const router = useRouter();
  const colors = useDaycareColors();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const isAdmin = getCurrentUserRole() === "admin";

  const [month, setMonth] = useState<MonthRef>(currentMonth());
  const [openEntry, setOpenEntry] = useState<TimeEntry | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [open, list] = await Promise.all([getOpenEntry(), getMyMonthEntries(month)]);
    setOpenEntry(open);
    setEntries(list);
    setLoading(false);
  }, [month]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function handleToggle() {
    setBusy(true);
    const ok = openEntry ? await clockOut(openEntry.id) : await clockIn();
    setBusy(false);
    if (!ok) {
      showAlert("שגיאה", "לא הצלחנו לשמור את הדיווח. נסו שוב.");
      return;
    }
    void load();
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppScreen scrollable contentStyle={styles.content}>
        <AppHeader
          onBellPress={() => router.push("/notifications")}
          onLeadingPress={() => router.push("/settings")}
        />
        <Text style={[styles.title, { color: colors.textPrimary }]}>כניסה / יציאה</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          דיווח שעות עבודה יומי
        </Text>

        <AppCard style={styles.statusCard}>
          <View
            style={[
              styles.statusIcon,
              { backgroundColor: openEntry ? colors.primary : colors.secondary },
            ]}
          >
            <Ionicons
              name={openEntry ? "time" : "time-outline"}
              size={34}
              color={openEntry ? "#FFFFFF" : colors.primary}
            />
          </View>
          {openEntry ? (
            <>
              <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                נכנסת ב-{formatTime(openEntry.clockIn)}
              </Text>
              <Text style={[styles.statusMeta, { color: colors.textSecondary }]}>
                {formatDuration(openEntry.minutes)} שעות עד עכשיו
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>לא בעבודה כרגע</Text>
              <Text style={[styles.statusMeta, { color: colors.textSecondary }]}>
                לחצו לדיווח כניסה כשמתחילים את היום
              </Text>
            </>
          )}
          <AppButton
            title={busy ? "שומר..." : openEntry ? "דיווח יציאה" : "דיווח כניסה"}
            onPress={handleToggle}
            disabled={busy || loading}
          />
        </AppCard>

        <TimeEntriesMonth month={month} onChangeMonth={setMonth} entries={entries} loading={loading} />

        {isAdmin ? (
          <AppButton
            title="דוח שעות צוות"
            variant="outline"
            onPress={() => router.push("/admin/staff-hours" as Href)}
          />
        ) : null}
      </AppScreen>

      <BottomNavBar activeItem="clock" variant="teacher" onItemPress={handleBottomNavPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: Spacing.lg, paddingBottom: 120 },
  title: {
    ...Typography.titleLarge,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    textAlign: "right",
    marginTop: -Spacing.md,
  },
  statusCard: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  statusIcon: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  statusTitle: { ...Typography.subtitle, fontWeight: "800", textAlign: "center" },
  statusMeta: { ...Typography.body, textAlign: "center", marginBottom: Spacing.xs },
});
