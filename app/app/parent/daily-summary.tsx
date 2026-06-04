import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "../../src/components/AppCard";
import { AppScreen } from "../../src/components/AppScreen";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import {
  mockDailyActivities,
  mockDailyMeals,
  mockDailyMessages,
  mockDailyNotes,
  mockDailyReportSummary,
} from "../../src/data/mockDailyReports";
import { Colors } from "../../src/theme/colors";
import { Spacing } from "../../src/theme/spacing";

const ACTIVITY_CATEGORY_LABELS: Record<string, string> = {
  learning: "למידה",
  creative: "יצירה",
  movement: "תנועה",
  story: "סיפור",
  outdoor: "חצר",
};

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "בוקר",
  lunch: "צהריים",
  snack: "ביניים",
};

const NOTE_TYPE_LABELS: Record<string, string> = {
  general: "כללי",
  health: "בריאות",
  behavior: "התנהגות",
  sleep: "שינה",
};

export default function DailySummaryScreen() {
  return (
    <View style={styles.root}>
      <AppScreen scrollable>
        <View style={styles.content}>
          <Text style={styles.title}>סיכום היום</Text>
          <Text style={styles.subtitle}>עדכונים מהגן להיום</Text>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>סיכום כללי</Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {mockDailyReportSummary.presentChildren}/
                  {mockDailyReportSummary.totalChildren}
                </Text>
                <Text style={styles.summaryLabel}>נוכחים</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {mockDailyReportSummary.activitiesCount}
                </Text>
                <Text style={styles.summaryLabel}>פעילויות</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {mockDailyReportSummary.mealsCount}
                </Text>
                <Text style={styles.summaryLabel}>ארוחות</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {mockDailyReportSummary.messagesCount}
                </Text>
                <Text style={styles.summaryLabel}>הודעות</Text>
              </View>
            </View>
          </AppCard>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>פעילויות</Text>

            {mockDailyActivities.map((activity, index) => (
              <View
                key={activity.id}
                style={[
                  styles.listItem,
                  index === mockDailyActivities.length - 1 &&
                    styles.listItemLast,
                ]}
              >
                <View style={styles.listItemHeader}>
                  <Text style={styles.listItemTime}>{activity.time}</Text>
                  <Text style={styles.badge}>
                    {ACTIVITY_CATEGORY_LABELS[activity.category]}
                  </Text>
                </View>

                <Text style={styles.listItemTitle}>{activity.title}</Text>
                <Text style={styles.listItemText}>{activity.description}</Text>
              </View>
            ))}
          </AppCard>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>ארוחות</Text>

            {mockDailyMeals.map((meal, index) => (
              <View
                key={meal.id}
                style={[
                  styles.listItem,
                  index === mockDailyMeals.length - 1 && styles.listItemLast,
                ]}
              >
                <View style={styles.listItemHeader}>
                  <Text style={styles.listItemTime}>{meal.time}</Text>
                  <Text style={styles.badge}>
                    {MEAL_TYPE_LABELS[meal.mealType]}
                  </Text>
                </View>

                <Text style={styles.listItemTitle}>{meal.title}</Text>
                <Text style={styles.listItemText}>{meal.description}</Text>
              </View>
            ))}
          </AppCard>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>הודעות</Text>

            {mockDailyMessages.map((message, index) => (
              <View
                key={message.id}
                style={[
                  styles.listItem,
                  index === mockDailyMessages.length - 1 &&
                    styles.listItemLast,
                  !message.isRead && styles.listItemUnread,
                ]}
              >
                <View style={styles.listItemHeader}>
                  <Text style={styles.listItemTime}>{message.time}</Text>
                  <Text style={styles.listItemTitle}>{message.from}</Text>
                </View>

                <Text style={styles.listItemText}>{message.text}</Text>
              </View>
            ))}
          </AppCard>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>הערות</Text>

            {mockDailyNotes.map((note, index) => (
              <View
                key={note.id}
                style={[
                  styles.listItem,
                  index === mockDailyNotes.length - 1 && styles.listItemLast,
                ]}
              >
                <View style={styles.listItemHeader}>
                  <Text style={styles.badge}>{NOTE_TYPE_LABELS[note.type]}</Text>

                  {note.childName != null && (
                    <Text style={styles.listItemTitle}>{note.childName}</Text>
                  )}
                </View>

                <Text style={styles.listItemText}>{note.text}</Text>
              </View>
            ))}
          </AppCard>
        </View>
      </AppScreen>

      <BottomNavBar activeItem="daily" variant="parent" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingTop: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    textAlign: "right",
  },
  card: {
    marginTop: Spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: "right",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.xs,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  listItemUnread: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingHorizontal: Spacing.xs,
  },
  listItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  listItemTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  listItemText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "right",
  },
  badge: {
    fontSize: 11,
    color: Colors.primary,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
});