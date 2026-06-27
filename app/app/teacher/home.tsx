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
import { useHero } from "../../src/daycare/DaycareBrandingContext";
import { Colors } from "../../src/theme/colors";
import { Typography } from "../../src/theme/typography";
import { BorderRadius, Shadow, Spacing } from "../../src/theme/spacing";

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
    id: "cameras",
    label: "מצלמות לייב",
    description: "שידור חי להורים",
    icon: "videocam-outline",
    route: "/teacher/cameras" as Href,
  },
  {
    id: "albums",
    label: "אלבומים",
    description: "קולאזים לפי נושא",
    icon: "albums-outline",
    route: "/teacher/albums" as Href,
  },
  {
    id: "event-suggestions",
    label: "הצעות לאירועים",
    description: "רעיונות מיוחדים להורים",
    icon: "sparkles-outline",
    route: "/teacher/event-suggestions" as Href,
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
  const teacherHomeHero = useHero("teacherHome");
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
            label: "חוזים ממתינים",
            value: pendingContractsCount,
            text: "לחתימה",
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
        {/* Hero */}
        <View style={styles.heroSection}>
          <Image
            source={teacherHomeHero}
            style={styles.fullHeroImage}
            contentFit="cover"
            contentPosition="top"
          />
          <View style={styles.heroGradient} />
          <View style={styles.headerOverlay}>
            <AppHeader
              onBellPress={() => router.push("/notifications")}
              onLeadingPress={() => router.push("/settings")}
            />
          </View>
          {/* Greeting inside hero */}
          <View style={styles.heroGreeting}>
            <Text style={styles.greeting}>בוקר טוב, {ownerName} ☀️</Text>
            <Text style={styles.greetingSubtext}>יום נפלא ב{daycareName}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Summary card */}
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
            <AppCard elevation="elevated">
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>סיכום היום</Text>
                <Text style={styles.summaryDate}>{formattedDate}</Text>
              </View>
              <View style={styles.summaryGrid}>
                {summaryItems.map((item, index) => (
                  <View
                    key={item.label}
                    style={[
                      styles.summaryItem,
                      index < summaryItems.length - 2 && styles.summaryItemBorderBottom,
                      index % 2 === 0 && styles.summaryItemBorderStart,
                    ]}
                  >
                    <View style={styles.summaryIconWrap}>
                      <Ionicons name={item.icon} size={18} color={Colors.primary} />
                    </View>
                    <Text style={styles.summaryValue}>{item.value}</Text>
                    <Text style={styles.summaryLabel}>{item.label}</Text>
                    {item.text ? <Text style={styles.summaryText}>{item.text}</Text> : null}
                  </View>
                ))}
              </View>
            </AppCard>
          )}

          {/* Pending contracts banner */}
          {pendingContractsCount > 0 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/teacher/contracts")}
            >
              <AppCard style={styles.reminderCard}>
                <View style={styles.reminderRow}>
                  <View style={styles.reminderIconWrap}>
                    <Ionicons name="alert-circle" size={20} color={Colors.warning} />
                  </View>
                  <View style={styles.reminderTextBlock}>
                    <Text style={styles.reminderTitle}>
                      {pendingContractsCount} חוזים ממתינים לחתימה
                    </Text>
                    <Text style={styles.reminderText}>לחצו לעיון ומעקב אחר ההורים</Text>
                  </View>
                  <Ionicons name="chevron-back" size={18} color={Colors.textSecondary} />
                </View>
              </AppCard>
            </TouchableOpacity>
          )}

          {/* Quick actions */}
          <Text style={styles.actionsTitle}>פעולות מרכזיות</Text>
          <View style={styles.actionsGrid}>
            {teacherQuickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                activeOpacity={0.7}
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
    height: 340,
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
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    // Simulated gradient via opacity layering
    backgroundColor: Colors.heroOverlay,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  heroGreeting: {
    position: "absolute",
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
    alignItems: "flex-end",
  },
  greeting: {
    ...Typography.titleLarge,
    color: Colors.white,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    textAlign: "right",
  },
  greetingSubtext: {
    ...Typography.bodyMedium,
    color: "rgba(255,255,255,0.85)",
    textAlign: "right",
    marginTop: 2,
  },
  body: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  summaryHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  summaryDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  summaryGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  summaryItem: {
    width: "50%",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  summaryItemBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  summaryItemBorderStart: {
    borderStartWidth: 1,
    borderStartColor: Colors.divider,
  },
  summaryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    ...Typography.display,
    color: Colors.primary,
    lineHeight: 34,
  },
  summaryLabel: {
    ...Typography.captionMedium,
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: 2,
  },
  summaryText: {
    ...Typography.label,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  reminderCard: {
    backgroundColor: Colors.sentBackground,
    borderColor: Colors.reminderBorder,
  },
  reminderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },
  reminderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.reminderIconBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderTextBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  reminderTitle: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
  },
  reminderText: {
    ...Typography.caption,
    color: Colors.sentText ?? Colors.textSecondary,
    marginTop: 2,
  },
  actionsTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: Spacing.sm,
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
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.subtle,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
    marginBottom: Spacing.sm,
  },
  actionText: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    textAlign: "right",
  },
  actionDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "right",
  },
});
