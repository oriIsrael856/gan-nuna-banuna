import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { Image } from "expo-image";

import { Colors } from "../theme/colors";
import { BorderRadius, Shadow, Spacing } from "../theme/spacing";
import { IllustratedIcon } from "./IllustratedIcon";
import type { IllustratedIconName } from "../theme/illustratedIcons";

export interface AppSummaryItem {
  key: string;
  label: string;
  value: string;
  /** Optional hint below the value (e.g. "מתוך 12") */
  subtext?: string;
  /** Bespoke illustration (optimized PNG). Falls back to `iconName` placeholder. */
  illustration?: ImageSourcePropType;
  iconName?: IllustratedIconName;
}

interface AppSummaryCardProps {
  items: AppSummaryItem[];
  title?: string;
  /** Defaults to today's Hebrew date. Pass "" to hide. */
  dateText?: string;
  /** Horizontal inset from screen edges (default: 2 × Spacing.md) */
  horizontalInset?: number;
}

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

/**
 * The warm "summary" card from the Parent Home design, made reusable: a white
 * rounded card holding a row of warm mini-tiles, each with a label, illustration
 * and a value. See docs/16-design-system.md.
 */
export function AppSummaryCard({
  items,
  title = "סיכום היום",
  dateText,
  horizontalInset = Spacing.md * 2,
}: AppSummaryCardProps) {
  const { width } = useWindowDimensions();
  const date = dateText ?? formatTodayHebrew();
  const cardPadding = 16;
  const columnGap = Spacing.sm;
  const innerWidth = width - horizontalInset - cardPadding * 2;
  const itemWidth = (innerWidth - columnGap * 3) / 4;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {date ? (
          <Text style={styles.headerDate} numberOfLines={1}>
            {date}
          </Text>
        ) : null}
      </View>

      <View style={[styles.grid, { gap: columnGap, height: ITEM_H }]}>
        {items.map((item) => (
          <View key={item.key} style={[styles.item, { width: itemWidth, height: ITEM_H }]}>
            <Text
              style={styles.itemLabel}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {item.label}
            </Text>
            <View style={styles.itemIllustration}>
              {item.illustration ? (
                <Image
                  source={item.illustration}
                  style={styles.itemImage}
                  contentFit="contain"
                  transition={120}
                />
              ) : (
                <IllustratedIcon name={item.iconName ?? "calendar"} width={90} height={84} />
              )}
            </View>
            <Text
              style={[styles.itemValue, item.subtext ? styles.itemValueWithSubtext : undefined]}
              numberOfLines={1}
            >
              {item.value}
            </Text>
            {item.subtext ? (
              <Text style={styles.itemSubtext} numberOfLines={1}>
                {item.subtext}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const ITEM_H = 118;
const ILLUSTRATION_W = 90;
const ILLUSTRATION_H = 84;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl - 4, // 20
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 18,
    ...Shadow.warmCard,
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
    color: Colors.brandGreen,
    textAlign: "right",
  },
  headerDate: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textMutedGreen,
    textAlign: "left",
  },
  grid: {
    flexDirection: "row-reverse",
  },
  item: {
    backgroundColor: Colors.surfaceWarm,
    borderWidth: 1,
    borderColor: Colors.borderWarm,
    borderRadius: BorderRadius.md, // 12
    overflow: "hidden",
  },
  itemLabel: {
    position: "absolute",
    top: 7,
    left: 0,
    right: 0,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "500",
    color: Colors.brandGreen,
    textAlign: "center",
  },
  itemIllustration: {
    position: "absolute",
    top: 14,
    left: "50%",
    marginLeft: -(ILLUSTRATION_W / 2),
    width: ILLUSTRATION_W,
    height: ILLUSTRATION_H,
    alignItems: "center",
    justifyContent: "center",
  },
  itemImage: {
    width: ILLUSTRATION_W,
    height: ILLUSTRATION_H,
  },
  itemValue: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    color: Colors.brandGreen,
    textAlign: "center",
  },
  itemValueWithSubtext: {
    bottom: 18,
  },
  itemSubtext: {
    position: "absolute",
    bottom: 6,
    left: 0,
    right: 0,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "500",
    color: Colors.textMutedGreen,
    textAlign: "center",
  },
});
