import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { IllustratedIcon } from "../../src/components/IllustratedIcon";
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
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import type { IllustratedIconName } from "../../src/theme/illustratedIcons";

interface TeacherAction {
  id: string;
  icon: IllustratedIconName;
  label: string;
  subtitle: string;
  route: Href;
}

const TEACHER_ACTIONS: TeacherAction[] = [
  { id: "children", icon: "children", label: "ילדים בגן", subtitle: "צפייה וניהול", route: "/teacher/children" },
  { id: "attendance", icon: "attendance", label: "נוכחות", subtitle: "סימון נוכחות", route: "/teacher/attendance" },
  { id: "daily-report", icon: "dailySummary", label: "תיעוד יומי", subtitle: "צילום ודוחות", route: "/teacher/daily-report" },
  { id: "contracts", icon: "contracts", label: "חוזים", subtitle: "צפייה וניהול", route: "/teacher/contracts" },
  { id: "upload-contract", icon: "uploadContract", label: "העלאת חוזה", subtitle: "חוזה חדש", route: "/teacher/upload-contract" },
  { id: "messages", icon: "messages", label: "הודעות להורים", subtitle: "שיחות עם הורים", route: "/messages" },
  { id: "gallery", icon: "photos", label: "גלריה", subtitle: "תמונות מהגן", route: "/teacher/gallery" },
  { id: "cameras", icon: "cameras", label: "מצלמות לייב", subtitle: "שידור חי", route: "/teacher/cameras" as Href },
  { id: "albums", icon: "albums", label: "אלבומים", subtitle: "קולאז'ים לפי נושא", route: "/teacher/albums" as Href },
  { id: "event-suggestions", icon: "suggestions", label: "הצעות לאירועים", subtitle: "רעיונות להורים", route: "/teacher/event-suggestions" as Href },
  { id: "contact-messages", icon: "contact", label: "פניות מהורים", subtitle: "טופס יצירת קשר", route: "/teacher/contact-messages" },
  { id: "absence-reports", icon: "absence", label: "דיווחי היעדרות", subtitle: "דיווחים מהורים", route: "/teacher/absence-reports" },
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
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const summaryItems: { label: string; value: number; text?: string; icon: IllustratedIconName }[] =
    summary
      ? [
          {
            label: "ילדים בגן",
            value: children.length,
            text: `מתוך ${summary.totalChildren}`,
            icon: "children",
          },
          {
            label: "נוכחים היום",
            value: summary.presentChildren,
            text: "היום",
            icon: "attendance",
          },
          { label: "התראות חדשות", value: unreadCount, text: "שלא נקראו", icon: "messages" },
          {
            label: "חוזים ממתינים",
            value: pendingContractsCount,
            text: "לחתימה",
            icon: "contracts",
          },
        ]
      : [];

  return (
    <View style={styles.root}>
      <AppScreen scrollable noPadding contentStyle={styles.screenContent}>
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
          <View style={styles.heroGreeting}>
            <Text style={styles.greeting}>בוקר טוב, {ownerName} ☀️</Text>
            <Text style={styles.greetingSubtext}>יום נפלא ב{daycareName}</Text>
          </View>
        </View>

        <View style={styles.body}>
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
            <>
              <AppCard style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryTitle}>סיכום היום</Text>
                  <Text style={styles.summaryDate}>{formattedDate}</Text>
                </View>
                <View style={styles.statsGrid}>
                  {summaryItems.map((item) => (
                    <View key={item.label} style={styles.statItem}>
                      <Text style={styles.statLabel} numberOfLines={1}>
                        {item.label}
                      </Text>
                      <IllustratedIcon name={item.icon} size={44} style={styles.statIcon} />
                      <Text style={styles.statValue}>{item.value}</Text>
                      {item.text ? (
                        <Text style={styles.statText} numberOfLines={1}>
                          {item.text}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </AppCard>

              {pendingContractsCount > 0 ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push("/teacher/contracts")}
                  accessibilityRole="button"
                  accessibilityLabel={`${pendingContractsCount} חוזים ממתינים לחתימה`}
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
              ) : null}

              <View style={styles.actionsGrid}>
                {TEACHER_ACTIONS.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    activeOpacity={0.85}
                    onPress={() => router.push(action.route)}
                    accessibilityRole="button"
                    accessibilityLabel={`${action.label}, ${action.subtitle}`}
                    style={styles.actionPressable}
                  >
                    <AppCard style={styles.actionCard}>
                      <IllustratedIcon name={action.icon} size={56} />
                      <Text style={styles.actionLabel} numberOfLines={1}>
                        {action.label}
                      </Text>
                      <Text style={styles.actionSubtitle} numberOfLines={1}>
                        {action.subtitle}
                      </Text>
                    </AppCard>
                  </TouchableOpacity>
                ))}
              </View>
            </>
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
    height: 300,
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
    top: Spacing.xxl + Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    alignItems: "center",
  },
  greeting: {
    ...Typography.titleLarge,
    color: Colors.white,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    textAlign: "center",
  },
  greetingSubtext: {
    ...Typography.bodyMedium,
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  body: {
    paddingHorizontal: Spacing.md,
    marginTop: -Spacing.xl,
    gap: Spacing.md,
  },
  summaryCard: {
    gap: Spacing.md,
  },
  summaryHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  summaryDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  statItem: {
    flexBasis: "47%",
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
  },
  statIcon: {
    marginVertical: 4,
  },
  statValue: {
    ...Typography.title,
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.label,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  statText: {
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
  actionsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.md,
  },
  actionPressable: {
    width: "31.5%",
  },
  actionCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    gap: 4,
  },
  actionLabel: {
    ...Typography.captionMedium,
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: 4,
  },
  actionSubtitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
