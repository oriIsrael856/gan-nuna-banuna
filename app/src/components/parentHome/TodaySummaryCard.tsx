import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { Image } from "expo-image";

import { Spacing } from "../../theme/spacing";
import { HomeAssets } from "./homeAssets";

/** Matches summaryWrap horizontal inset in parent/home.tsx */
const SUMMARY_MARGIN = Spacing.md;
const CARD_PADDING = Spacing.md;
const COLUMN_GAP = Spacing.sm;
/** Figma mini-card height (node 36:24) */
const ITEM_H = 99;
const ILLUSTRATION_ASPECT = 84 / 90;

export interface SummaryValues {
  events: string;
  messages: string;
  attendance: string;
  children: string;
}

interface SummaryItem {
  key: keyof SummaryValues;
  label: string;
  illustration: ImageSourcePropType;
}

/**
 * Figma node 36:24. RTL visual order (right → left): upcoming events,
 * new notifications, monthly attendance, children in kindergarten.
 */
const SUMMARY_ITEMS: SummaryItem[] = [
  { key: "events", label: "אירועים קרובים", illustration: HomeAssets.summary.events },
  { key: "messages", label: "הודעות חדשות", illustration: HomeAssets.summary.messages },
  { key: "attendance", label: "נוכחות החודש", illustration: HomeAssets.summary.attendance },
  { key: "children", label: "ילדים בגן", illustration: HomeAssets.summary.children },
];

function formatTodayHebrew(): string {
  try {
    return new Intl.DateTimeFormat("he-IL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  } catch {
    return "";
  }
}

interface TodaySummaryCardProps {
  values: SummaryValues;
}

export function TodaySummaryCard({ values }: TodaySummaryCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const innerWidth = screenWidth - SUMMARY_MARGIN * 2 - CARD_PADDING * 2;
  const itemWidth = (innerWidth - COLUMN_GAP * 3) / 4;
  const illustrationWidth = Math.min(72, Math.round(itemWidth * 0.88));
  const illustrationHeight = Math.round(illustrationWidth * ILLUSTRATION_ASPECT);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          סיכום היום
        </Text>
        <Text style={styles.headerDate} numberOfLines={1}>
          {formatTodayHebrew()}
        </Text>
      </View>

      <View style={[styles.grid, { gap: COLUMN_GAP, height: ITEM_H }]}>
        {SUMMARY_ITEMS.map((item) => (
          <View key={item.key} style={[styles.item, { width: itemWidth, height: ITEM_H }]}>
            <Text
              style={styles.itemLabel}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {item.label}
            </Text>
            <View style={styles.illustrationWrap}>
              <Image
                source={item.illustration}
                style={{ width: illustrationWidth, height: illustrationHeight }}
                contentFit="contain"
                transition={120}
              />
            </View>
            <Text style={styles.itemValue} numberOfLines={1}>
              {values[item.key]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const DARK_GREEN = "#315A44";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingTop: 12,
    paddingHorizontal: CARD_PADDING,
    paddingBottom: 18,
    shadowColor: "#1F3A2B",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    height: 22,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "500",
    color: DARK_GREEN,
    textAlign: "right",
  },
  headerDate: {
    fontSize: 12,
    fontWeight: "500",
    color: "#647166",
    textAlign: "left",
  },
  grid: {
    flexDirection: "row-reverse",
  },
  item: {
    backgroundColor: "#FFFCF8",
    borderWidth: 1,
    borderColor: "#F1E6D7",
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    paddingTop: 7,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  itemLabel: {
    width: "100%",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "500",
    color: DARK_GREEN,
    textAlign: "center",
  },
  illustrationWrap: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  itemValue: {
    width: "100%",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    color: DARK_GREEN,
    textAlign: "center",
  },
});
