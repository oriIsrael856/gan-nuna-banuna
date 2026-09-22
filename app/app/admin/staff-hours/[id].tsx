import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { AppHeader } from "../../../src/components/AppHeader";
import { AppScreen } from "../../../src/components/AppScreen";
import { TimeEntriesMonth } from "../../../src/components/TimeEntriesMonth";
import { useDaycareColors } from "../../../src/daycare/DaycareBrandingContext";
import {
  currentMonth,
  getMemberMonthEntries,
  type MonthRef,
  type TimeEntry,
} from "../../../src/services/staffTime.service";
import { Spacing } from "../../../src/theme/spacing";
import { Typography } from "../../../src/theme/typography";

export default function AdminStaffMemberHoursScreen() {
  const router = useRouter();
  const colors = useDaycareColors();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const [month, setMonth] = useState<MonthRef>(currentMonth());
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) {
      return;
    }
    setLoading(true);
    setEntries(await getMemberMonthEntries(id, month));
    setLoading(false);
  }, [id, month]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppScreen scrollable contentStyle={styles.content}>
        <AppHeader onBellPress={() => router.push("/notifications")} onLeadingPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>{name ?? "דוח שעות"}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>דוח שעות חודשי</Text>

        <TimeEntriesMonth month={month} onChangeMonth={setMonth} entries={entries} loading={loading} />
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
  subtitle: {
    ...Typography.body,
    textAlign: "right",
    marginTop: -Spacing.md,
  },
});
