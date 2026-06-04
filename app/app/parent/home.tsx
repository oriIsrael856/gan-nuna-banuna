import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { AppScreen } from "../../src/components/AppScreen";
import { AppCard } from "../../src/components/AppCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { CLIENT_CONFIG } from "../../src/config/client.config";
import { Colors } from "../../src/theme/colors";
import { Spacing } from "../../src/theme/spacing";
import { mockParent, mockParentChildId } from "../../src/data/mockParent";
import { mockChildren } from "../../src/data/mockChildren";
import { mockContracts } from "../../src/data/mockContracts";
import { mockDailyReportSummary } from "../../src/data/mockDailyReports";

const parentQuickActions: { id: string; label: string; route?: Href }[] = [
  { id: "daily-summary", label: "סיכום יום", route: "/parent/daily-summary" },
  { id: "contracts", label: "חוזים ומסמכים" },
  { id: "contact", label: "יצירת קשר עם הגן" },
];

export default function ParentHomeScreen() {
  const router = useRouter();
  const parentChild = mockChildren.find((child) => child.id === mockParentChildId);
  const parentContract = mockContracts.find((contract) => contract.childId === parentChild?.id);

  let contractTitle = "אין חוזה פעיל";
  let contractText = "לא נמצא חוזה משויך לילד/ה.";

  if (parentContract?.status === "sent") {
    contractTitle = "חוזה ממתין לחתימה";
    contractText = "ניתן לעיין בחוזה ולעבור לחתימה דיגיטלית בהמשך.";
  } else if (parentContract?.status === "signed") {
    contractTitle = "החוזה חתום";
    contractText = "החוזה לשנת הפעילות הנוכחית חתום ושמור במערכת.";
  } else if (parentContract?.status === "expired") {
    contractTitle = "החוזה פג תוקף";
    contractText = "יש צורך לחדש את החוזה מול הגן.";
  }

  const dailyActivitiesCount = mockDailyReportSummary.activitiesCount;
  const dailyMealsCount = mockDailyReportSummary.mealsCount;
  const dailyMessagesCount = mockDailyReportSummary.messagesCount;

  function handleQuickActionPress(route: Href | undefined) {
    if (route) {
      router.push(route);
    }
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable>
        <View style={styles.content}>
          <Text style={styles.title}>שלום {mockParent.name}</Text>

          <View style={styles.childInfo}>
            <Text style={styles.childName}>{parentChild?.name ?? "ילד/ה"}</Text>
            <Text style={styles.childSubtitle}>היום ב{CLIENT_CONFIG.daycareName}</Text>
          </View>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>סיכום היום</Text>
            <Text style={styles.cardText}>
              היום פורסמו {dailyActivitiesCount} פעילויות, {dailyMealsCount} ארוחות ו-{dailyMessagesCount} הודעות מהגן.
            </Text>
          </AppCard>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>{contractTitle}</Text>
            <Text style={styles.cardText}>{contractText}</Text>
          </AppCard>

          <AppCard style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>פעולות מהירות</Text>
            <View style={styles.actionsGrid}>
              {parentQuickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionItem}
                  activeOpacity={action.route ? 0.7 : 1}
                  onPress={() => handleQuickActionPress(action.route)}
                >
                  <Text style={styles.actionText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </AppCard>
        </View>
      </AppScreen>

      <BottomNavBar activeItem="home" variant="parent" />
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
  },
  childInfo: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  childName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  childSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  card: {
    marginTop: Spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionsCard: {
    marginTop: Spacing.lg,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  actionItem: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  actionText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
});