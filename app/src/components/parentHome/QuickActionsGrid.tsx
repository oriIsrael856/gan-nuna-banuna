import React from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import { Spacing } from "../../theme/spacing";
import { HomeAssets } from "./homeAssets";

/** Figma: 361px content width, 8px column gutter on 393px frame. */
const HORIZONTAL_PADDING = Spacing.md;
const COLUMN_GAP = Spacing.sm;

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  illustration: ImageSourcePropType;
  route: Href;
}

/**
 * Figma node 22:45 — 3×3 grid. Order is the approved RTL visual order: with a
 * row-reverse wrapping container the first item in each triple renders on the
 * right (matching the Figma column positions x=246 / 123 / 0). Titles and
 * subtitles are read from Figma; routes are preserved from the product.
 */
const QUICK_ACTIONS: QuickAction[] = [
  // Row 1 (right → left): Daily Summary, Forms, Calendar
  { id: "daily-summary", title: "סיכום יום", subtitle: "מעקב ותיעוד יומי", illustration: HomeAssets.quickActions.dailySummary, route: "/parent/daily-summary" },
  { id: "forms", title: "מסמכים", subtitle: "טפסים ומסמכים", illustration: HomeAssets.quickActions.forms, route: "/parent/contract-renewal" },
  { id: "calendar", title: "לוח שנה", subtitle: "אירועים ופעילויות", illustration: HomeAssets.quickActions.calendar, route: "/calendar" },
  // Row 2: Today Photos, Live Cameras, Albums
  { id: "today-photos", title: "תמונות", subtitle: "תמונות אחרונות", illustration: HomeAssets.quickActions.todayPhotos, route: "/parent/gallery" },
  { id: "live-cameras", title: "מצלמות", subtitle: "צפייה בזמן אמת", illustration: HomeAssets.quickActions.liveCameras, route: "/parent/cameras" as Href },
  { id: "albums", title: "אלבומים", subtitle: "אלבומי תמונות", illustration: HomeAssets.quickActions.albums, route: "/parent/albums" as Href },
  // Row 3: Announcements, Suggestions, Contact
  { id: "announcements", title: "הודעות מהגן", subtitle: "עדכונים חשובים", illustration: HomeAssets.quickActions.announcements, route: "/messages" },
  { id: "suggestions", title: "הצעות מהגן", subtitle: "רעיונות מהגן", illustration: HomeAssets.quickActions.suggestions, route: "/parent/event-suggestions" as Href },
  { id: "contact", title: "צור קשר", subtitle: "שיחה ישירה עם הגן", illustration: HomeAssets.quickActions.contact, route: "/parent/contact" },
];

export function QuickActionsGrid() {
  const router = useRouter();

  return (
    <View style={styles.grid}>
      {QUICK_ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.id}
          activeOpacity={0.85}
          onPress={() => router.push(action.route)}
          accessibilityRole="button"
          accessibilityLabel={`${action.title}. ${action.subtitle}`}
          style={styles.card}
        >
          <Image
            source={action.illustration}
            style={styles.illustration}
            contentFit="contain"
            transition={120}
          />
          <Text style={styles.title} numberOfLines={1}>
            {action.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {action.subtitle}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const DARK_GREEN = "#315A44";

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  card: {
    height: 116,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    paddingTop: 2,
    paddingBottom: 10,
    paddingHorizontal: 4,
    // Figma: shadow 0 4 14 rgba(31,58,43,0.07)
    shadowColor: "#1F3A2B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  illustration: {
    width: 78,
    height: 72,
  },
  title: {
    marginTop: 0,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
    color: DARK_GREEN,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "400",
    color: DARK_GREEN,
    textAlign: "center",
  },
});
