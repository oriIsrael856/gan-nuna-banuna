import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "../../../src/components/AppCard";
import { AppHeader } from "../../../src/components/AppHeader";
import { AppScreen } from "../../../src/components/AppScreen";
import { AppStateCard } from "../../../src/components/AppStateCard";
import { useDaycareColors } from "../../../src/daycare/DaycareBrandingContext";
import {
  currentMonth,
  formatDuration,
  formatMonthLabel,
  getStaffMonthSummary,
  shiftMonth,
  type MonthRef,
  type StaffMonthSummary,
} from "../../../src/services/staffTime.service";
import { Colors } from "../../../src/theme/colors";
import { BorderRadius, Spacing } from "../../../src/theme/spacing";
import { Typography } from "../../../src/theme/typography";

export default function AdminStaffHoursScreen() {
  const router = useRouter();
  const colors = useDaycareColors();
  const [month, setMonth] = useState<MonthRef>(currentMonth());
  const [rows, setRows] = useState<StaffMonthSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setRows(await getStaffMonthSummary(month));
    setLoading(false);
  }, [month]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppScreen scrollable contentStyle={styles.content}>
        <AppHeader onBellPress={() => router.push("/notifications")} onLeadingPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>דוח שעות צוות</Text>

        <View style={styles.monthRow}>
          <TouchableOpacity
            onPress={() => setMonth(shiftMonth(month, 1))}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="חודש הבא"
          >
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.monthLabel, { color: colors.textPrimary }]}>{formatMonthLabel(month)}</Text>
          <TouchableOpacity
            onPress={() => setMonth(shiftMonth(month, -1))}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="חודש קודם"
          >
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <AppStateCard state="loading" title="טוען דוח" message="רגע, מחשבים שעות" />
        ) : (
          <AppCard style={styles.list}>
            {rows.map((row, index) => (
              <TouchableOpacity
                key={row.member.id}
                activeOpacity={0.75}
                onPress={() =>
                  router.push(
                    `/admin/staff-hours/${row.member.id}?name=${encodeURIComponent(row.member.fullName)}` as Href,
                  )
                }
                style={[styles.row, index === rows.length - 1 && styles.rowLast]}
                accessibilityRole="button"
                accessibilityLabel={`${row.member.fullName}, ${formatDuration(row.totalMinutes)} שעות`}
              >
                <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
                <View style={styles.rowText}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: colors.textPrimary }]}>{row.member.fullName}</Text>
                    {row.isClockedIn ? (
                      <View style={[styles.liveDot, { backgroundColor: colors.primary }]} />
                    ) : null}
                  </View>
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    {row.member.role === "admin" ? "מנהל/ת" : "מורה"} · {row.shifts} משמרות
                  </Text>
                </View>
                <View style={[styles.hoursBox, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.hoursValue, { color: colors.primary }]}>
                    {formatDuration(row.totalMinutes)}
                  </Text>
                  <Text style={[styles.hoursLabel, { color: colors.textSecondary }]}>שעות</Text>
                </View>
              </TouchableOpacity>
            ))}
            {rows.length === 0 ? (
              <Text style={[styles.empty, { color: colors.textSecondary }]}>אין אנשי צוות.</Text>
            ) : null}
          </AppCard>
        )}
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: Spacing.lg, paddingBottom: Spacing.xxl },
  title: {
    ...Typography.titleLarge,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  monthRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xs,
  },
  monthLabel: { ...Typography.subtitle, fontWeight: "700" },
  list: { gap: 0, paddingVertical: Spacing.xs },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowLast: { borderBottomWidth: 0 },
  rowText: { flex: 1, alignItems: "flex-end" },
  nameRow: { flexDirection: "row-reverse", alignItems: "center", gap: Spacing.xs },
  name: { ...Typography.subtitle, fontWeight: "700" },
  liveDot: { width: 8, height: 8, borderRadius: BorderRadius.full },
  meta: { ...Typography.caption, marginTop: 2 },
  hoursBox: {
    minWidth: 64,
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  hoursValue: { ...Typography.subtitle, fontWeight: "800" },
  hoursLabel: { ...Typography.caption },
  empty: { ...Typography.body, textAlign: "right", paddingVertical: Spacing.sm },
});
