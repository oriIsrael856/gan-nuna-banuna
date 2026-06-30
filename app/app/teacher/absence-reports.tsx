import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getAbsenceReports } from "../../src/services/absence.service";
import { Colors } from "../../src/theme/colors";
import { Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TeacherAbsenceReportsScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const { data, loading, error, reload } = useAsyncData(() => getAbsenceReports(7), []);
  const reports = data ?? [];

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader
          variant="back"
          onLeadingPress={() => router.push("/teacher/home")}
          onBellPress={() => router.push("/notifications")}
        />
        <Text style={styles.title}>דיווחי היעדרות</Text>
        <Text style={styles.subtitle}>דיווחים מהורים בשבוע האחרון</Text>

        {loading ? (
          <AppStateCard state="loading" title="טוען דיווחים" message="רגע..." />
        ) : error ? (
          <AppStateCard
            state="error"
            title="לא הצלחנו לטעון"
            message="אירעה שגיאה בטעינת הדיווחים."
            actionLabel="נסו שוב"
            onActionPress={reload}
          />
        ) : reports.length === 0 ? (
          <AppStateCard
            state="empty"
            title="אין דיווחים"
            message="דיווחי היעדרות מהורים יופיעו כאן."
          />
        ) : (
          reports.map((report) => (
            <AppCard key={report.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.date}>{formatDate(report.createdAt)}</Text>
                <Text style={styles.childName}>{report.childName}</Text>
              </View>
              <Text style={styles.type}>{report.reportType}</Text>
              <Text style={styles.meta}>
                {report.reporterName} · {report.reportDate}
              </Text>
              {report.note ? <Text style={styles.note}>{report.note}</Text> : null}
            </AppCard>
          ))
        )}
      </AppScreen>

      <BottomNavBar activeItem="home" variant="teacher" onItemPress={handleBottomNavPress} />
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
  card: {
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  childName: {
    ...Typography.subtitle,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "right",
  },
  date: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  type: {
    ...Typography.bodyMedium,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  meta: {
    ...Typography.label,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  note: {
    ...Typography.body,
    color: Colors.textPrimary,
    textAlign: "right",
  },
});
