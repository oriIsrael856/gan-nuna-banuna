import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useNotifications } from "../../src/notifications/NotificationsContext";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getCurrentDaycareName, getCurrentUser } from "../../src/services/auth.service";
import { getChildren } from "../../src/services/children.service";
import { getContractsByStatus } from "../../src/services/contracts.service";
import { getDailyReportSummary } from "../../src/services/dailyReports.service";
import { Colors } from "../../src/theme/colors";
import { Heroes } from "../../src/theme/heroes";
import { BorderRadius, Spacing } from "../../src/theme/spacing";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const teacherQuickActions: {
  id: string;
  label: string;
  description: string;
  icon: IoniconName;
  route?: Href;
}[] = [
  {
    id: "children",
    label: "ילדים בגן",
    description: "צפייה וניהול הרשימה",
    icon: "people-outline",
    route: "/teacher/children",
  },
  {
    id: "attendance",
    label: "נוכחות",
    description: "סימון נוכחות והיעדרויות",
    icon: "checkbox-outline",
    route: "/teacher/attendance",
  },
  {
    id: "daily-report",
    label: "סיכום יום",
    description: "מעקב ודוחות יומיים",
    icon: "document-text-outline",
    route: "/teacher/daily-report",
  },
  {
    id: "contracts",
    label: "חוזים",
    description: "צפייה וניהול חוזים",
    icon: "folder-open-outline",
    route: "/teacher/contracts",
  },
  {
    id: "upload-contract",
    label: "העלאת חוזה",
    description: "העלאת חוזה חדש",
    icon: "cloud-upload-outline",
    route: "/teacher/upload-contract",
  },
  {
    id: "messages",
    label: "הודעות להורים",
    description: "שיחות עם ההורים",
    icon: "chatbubbles-outline",
    route: "/messages",
  },
  {
    id: "gallery",
    label: "גלריה",
    description: "העלאת תמונות מהגן",
    icon: "images-outline",
    route: "/teacher/gallery",
  },
  {
    id: "contact-messages",
    label: "פניות מהורים",
    description: "הודעות מטופס יצירת קשר",
    icon: "mail-outline",
    route: "/teacher/contact-messages",
  },
  {
    id: "absence-reports",
    label: "דיווחי היעדרות",
    description: "דיווחים מהורים",
    icon: "alert-circle-outline",
    route: "/teacher/absence-reports",
  },
];

export default function TeacherHomeScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const ownerName = getCurrentUser().name;
  const daycareName = getCurrentDaycareName();
  const { unreadCount } = useNotifications();

  const { data, loading, error, reload } = useAsyncData(async () => {
    const [children, summary, pendingContracts] = await Promise.all([
      getChildren(),
      getDailyReportSummary(),
      getContractsByStatus("sent"),
    ]);
    return {
      children,
      summary,
      pendingContractsCount: pendingContracts.length,
    };
  }, []);

  const children = data?.children ?? [];
  const summary = data?.summary;
  const pendingContractsCount = data?.pendingContractsCount ?? 0;

  const formattedDate = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const summaryItems: { label: string; value: number; text?: string; icon: IoniconName }[] =
    summary
      ? [
          {
            label: "ילדים בגן",
            value: children.length,
            text: `מתוך ${summary.totalChildren}`,
            icon: "people-outline",
          },
          {
            label: "נוכחים היום",
            value: summary.presentChildren,
            icon: "checkmark-circle-outline",
          },
          { label: "התראות חדשות", value: unreadCount, text: "שלא נקראו", icon: "mail-outline" },
          {
            label: "חוזים להורים",
            value: pendingContractsCount,
            text: "ממתינים לחתימה",
            icon: "document-text-outline",
          },
        ]
      : [];

  function handleActionPress(route: Href | undefined) {
    if (route) {
      router.push(route);
      return;
    }

    Alert.alert("בקרוב", "הפעולה הזו תתווסף בהמשך.");
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable noPadding contentStyle={styles.screenContent}>
        <View style={styles.heroSection}>
          <Image
            source={Heroes.teacherHome}
            style={styles.fullHeroImage}
            contentFit="cover"
            contentPosition="top"
          />
          <View style={styles.headerOverlay}>
            <AppHeader
              onBellPress={() => router.push("/notifications")}
              onLeadingPress={() => router.push("/settings")}
            />
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>בוקר טוב, {ownerName}</Text>
            <Text style={styles.greetingSubtext}>יום נפלא ב{daycareName}!</Text>
          </View>
          {loading ? (
            <AppStateCard
              state="loading"
              title="טוען נתונים"
              message="רגע, טוענים את סיכום היום"
            />
          ) : error ? (
            <AppStateCard
              state="error"
              title="לא הצלחנו לטעון"
              message="אירעה שגיאה בטעינת הנתונים. נסו שוב."
              actionLabel="נסו שוב"
              onActionPress={reload}
            />
          ) : (
            <AppCard>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>סיכום היום</Text>
                <Text style={styles.summaryDate}>{formattedDate}</Text>
              </View>

              <View style={styles.summaryGrid}>
                {summaryItems.map((item) => (
                  <View key={item.label} style={styles.summaryItem}>
                    <Ionicons name={item.icon} size={20} color={Colors.primary} />
                    <Text style={styles.summaryValue}>{item.value}</Text>
                    <Text style={styles.summaryLabel}>{item.label}</Text>
                    {item.text ? <Text style={styles.summaryText}>{item.text}</Text> : null}
                  </View>
                ))}
              </View>
            </AppCard>
          )}

          <Text style={styles.actionsTitle}>פעולות מרכזיות</Text>
          <View style={styles.actionsGrid}>
            {teacherQuickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                activeOpacity={0.75}
                onPress={() => handleActionPress(action.route)}
                style={styles.actionItem}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name={action.icon} size={22} color={Colors.primary} />
                </View>
                <Text style={styles.actionText}>{action.label}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {pendingContractsCount > 0 && (
            <AppCard style={styles.reminderCard}>
              <Text style={styles.reminderTitle}>לתשומת ליבך</Text>
              <Text style={styles.reminderText}>
                {pendingContractsCount} חוזים ממתינים לחתימה. כדאי לעקוב ולעדכן את ההורים.
              </Text>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push("/teacher/contracts")}
                style={styles.reminderAction}
              >
                <Text style={styles.reminderActionText}>לעיון בחוזים ‹</Text>
              </TouchableOpacity>
            </AppCard>
          )}
        </View>
      </AppScreen>
      <BottomNavBar
        activeItem="home"
        variant="teacher"
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
  heroSection: {
    width: "100%",
    height: 360,
    position: "relative",
    backgroundColor: Colors.background,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  fullHeroImage: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  greetingBlock: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
    textAlign: "center",
  },
  greetingSubtext: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "700",
    marginTop: 2,
    textAlign: "center",
  },
  body: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  summaryHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  summaryDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  summaryGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  summaryItem: {
    width: "48%",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
    marginTop: 2,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 2,
    textAlign: "center",
  },
  summaryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  actionsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  actionItem: {
    width: "48%",
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: "flex-end",
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
    marginBottom: Spacing.xs,
  },
  actionText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: "800",
    textAlign: "right",
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "right",
  },
  reminderCard: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.sentBackground,
  },
  reminderTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  reminderText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.sentText,
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  reminderAction: {
    alignSelf: "flex-end",
    marginTop: Spacing.md,
  },
  reminderActionText: {
    color: Colors.primary,
    fontWeight: "800",
  },
});
