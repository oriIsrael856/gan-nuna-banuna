import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "./AppCard";
import { AppStateCard } from "./AppStateCard";
import { useDaycareColors } from "../daycare/DaycareBrandingContext";
import {
  formatDuration,
  formatMonthLabel,
  shiftMonth,
  sumMinutes,
  type MonthRef,
  type TimeEntry,
} from "../services/staffTime.service";
import { Colors } from "../theme/colors";
import { BorderRadius, Spacing } from "../theme/spacing";
import { Typography } from "../theme/typography";

interface TimeEntriesMonthProps {
  month: MonthRef;
  onChangeMonth: (month: MonthRef) => void;
  entries: TimeEntry[];
  loading: boolean;
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

/** Month navigator + total hours + per-shift rows. Shared by staff and admin views. */
export function TimeEntriesMonth({ month, onChangeMonth, entries, loading }: TimeEntriesMonthProps) {
  const colors = useDaycareColors();
  const total = sumMinutes(entries);

  return (
    <AppCard style={styles.card}>
      <View style={styles.monthRow}>
        <TouchableOpacity
          onPress={() => onChangeMonth(shiftMonth(month, 1))}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="חודש הבא"
        >
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: colors.textPrimary }]}>{formatMonthLabel(month)}</Text>
        <TouchableOpacity
          onPress={() => onChangeMonth(shiftMonth(month, -1))}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="חודש קודם"
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.totalBox, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.totalValue, { color: colors.primary }]}>{formatDuration(total)}</Text>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
          שעות החודש · {entries.length} משמרות
        </Text>
      </View>

      {loading ? (
        <AppStateCard state="loading" title="טוען שעות" message="רגע..." />
      ) : entries.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>אין דיווחים בחודש הזה.</Text>
      ) : (
        entries.map((entry, index) => (
          <View
            key={entry.id}
            style={[styles.row, index === entries.length - 1 && styles.rowLast]}
          >
            <Text style={[styles.rowDuration, { color: colors.textPrimary }]}>
              {entry.clockOut ? formatDuration(entry.minutes) : "פתוח"}
            </Text>
            <View style={styles.rowText}>
              <Text style={[styles.rowDay, { color: colors.textPrimary }]}>{formatDay(entry.clockIn)}</Text>
              <Text style={[styles.rowTimes, { color: colors.textSecondary }]}>
                {formatTime(entry.clockIn)} – {entry.clockOut ? formatTime(entry.clockOut) : "עדיין בעבודה"}
              </Text>
            </View>
          </View>
        ))
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.sm },
  monthRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthLabel: { ...Typography.subtitle, fontWeight: "700" },
  totalBox: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  totalValue: { fontSize: 32, fontWeight: "800" },
  totalLabel: { ...Typography.caption, marginTop: 2 },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowLast: { borderBottomWidth: 0 },
  rowText: { flex: 1, alignItems: "flex-end" },
  rowDay: { ...Typography.body, fontWeight: "700" },
  rowTimes: { ...Typography.caption, marginTop: 2 },
  rowDuration: { ...Typography.subtitle, fontWeight: "700", minWidth: 56, textAlign: "left" },
  empty: { ...Typography.body, textAlign: "right" },
});
