import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeroCornerDecor from "../../assets/parent/home/hero/hero-corner-decor-mobile.svg";
import { AppActionGrid } from "../../src/components/AppActionGrid";
import { AppCard } from "../../src/components/AppCard";
import { AppStateCard } from "../../src/components/AppStateCard";
import { AppSummaryCard } from "../../src/components/AppSummaryCard";
import { HomeBottomNav } from "../../src/components/parentHome/HomeBottomNav";
import { HomeHeroControls } from "../../src/components/parentHome/HomeHeroControls";
import { ParentHomeColors } from "../../src/components/parentHome/homeAssets";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useNotifications } from "../../src/notifications/NotificationsContext";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getChildren } from "../../src/services/children.service";
import { getContractsByStatus } from "../../src/services/contracts.service";
import { getDailyReportSummary } from "../../src/services/dailyReports.service";
import { Colors } from "../../src/theme/colors";
import { Typography } from "../../src/theme/typography";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import type { IllustratedIconName } from "../../src/theme/illustratedIcons";

// Same hero artwork and geometry as Parent Home for a unified design language.
const TEACHER_HOME_HERO = require("../../assets/parent/home/hero/hero-background-artwork-mobile.png");
const HERO_ASPECT = 1020 / 1179;
const HERO_HEIGHT_SCALE = 1.02;
const DECOR_VIEWPORT = 393;
const DECOR_WIDTH_RATIO = 560 / DECOR_VIEWPORT;
const DECOR_HEIGHT_RATIO = 182.007 / DECOR_VIEWPORT;
const DECOR_LEFT_RATIO = -82 / DECOR_VIEWPORT;
const DECOR_TOP_RATIO = -41 / DECOR_VIEWPORT;
const CARD_OVERLAP = 42;

// On web, pin the hero and bottom nav to the visual viewport so browser
// toolbar show/hide and scroll chaining don't shift them.
const FIXED_POSITION = Platform.OS === "web" ? ("fixed" as "absolute") : "absolute";

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
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const { unreadCount } = useNotifications();

  const heroHeight = Math.round(width * HERO_ASPECT * HERO_HEIGHT_SCALE);
  const decorWidth = Math.round(width * DECOR_WIDTH_RATIO);
  const decorHeight = Math.round(width * DECOR_HEIGHT_RATIO);
  const decorLeft = Math.round(width * DECOR_LEFT_RATIO);
  const decorTop = Math.round(width * DECOR_TOP_RATIO);
  const cardTop = heroHeight - CARD_OVERLAP;

  const [navHeight, setNavHeight] = useState(84);
  const contentBottom = navHeight + Spacing.md;

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

  const summaryItems = summary
    ? [
        {
          key: "children",
          label: "ילדים בגן",
          value: String(children.length),
          subtext: `מתוך ${summary.totalChildren}`,
          iconName: "children" as IllustratedIconName,
        },
        {
          key: "present",
          label: "נוכחים היום",
          value: String(summary.presentChildren),
          subtext: "היום",
          iconName: "attendance" as IllustratedIconName,
        },
        {
          key: "notifications",
          label: "התראות חדשות",
          value: String(unreadCount),
          subtext: "שלא נקראו",
          iconName: "messages" as IllustratedIconName,
        },
        {
          key: "contracts",
          label: "חוזים ממתינים",
          value: String(pendingContractsCount),
          subtext: "לחתימה",
          iconName: "contracts" as IllustratedIconName,
        },
      ]
    : [];

  const actionItems = TEACHER_ACTIONS.map((action) => ({
    id: action.id,
    title: action.label,
    subtitle: action.subtitle,
    iconName: action.icon,
    onPress: () => router.push(action.route),
  }));

  return (
    <View style={styles.root}>
      {/*
        Pinned layers use position:fixed on web. Only render them while focused,
        otherwise a stacked (still-mounted) home keeps painting its hero over
        the next screen — which looked like the hero image "changed" on return.
      */}
      {isFocused ? (
        <View style={[styles.hero, { height: heroHeight }]} pointerEvents="none">
          <Image
            source={TEACHER_HOME_HERO}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="top"
            recyclingKey="teacher-home-hero"
            cachePolicy="memory-disk"
          />
          <View style={styles.heroOverlay} pointerEvents="none" />
          <View
            style={[
              styles.heroDecor,
              {
                width: decorWidth,
                height: decorHeight,
                left: decorLeft,
                top: decorTop,
              },
            ]}
            pointerEvents="none"
          >
            <HeroCornerDecor width={decorWidth} height={decorHeight} />
          </View>
        </View>
      ) : null}

      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: cardTop, paddingBottom: contentBottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
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
              <AppSummaryCard items={summaryItems} dateText={formattedDate} />

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

              <AppActionGrid actions={actionItems} />
            </>
        )}
      </ScrollView>

      {isFocused ? (
        <>
          {/* Pinned hero controls (menu + notifications) above the scroll layer */}
          <View style={styles.heroControlsLayer} pointerEvents="box-none">
            <HomeHeroControls
              topInset={insets.top}
              unreadCount={unreadCount}
              onMenuPress={() => router.push("/settings")}
              onNotificationsPress={() => router.push("/notifications")}
            />
          </View>

          {/* Fixed Bottom Navigation */}
          <View
            style={styles.navWrap}
            onLayout={(e) => setNavHeight(e.nativeEvent.layout.height)}
          >
            <HomeBottomNav activeItem="home" onItemPress={handleBottomNavPress} />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Same soft-green page surface as Parent Home.
    backgroundColor: ParentHomeColors.pageBackground,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  hero: {
    position: FIXED_POSITION,
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    backgroundColor: Colors.background,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(31,58,43,0.12)",
  },
  heroDecor: {
    position: "absolute",
  },
  heroControlsLayer: {
    position: FIXED_POSITION,
    top: 0,
    left: 0,
    right: 0,
    height: 0,
    overflow: "visible",
    zIndex: 10,
  },
  navWrap: {
    position: FIXED_POSITION,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
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
});
