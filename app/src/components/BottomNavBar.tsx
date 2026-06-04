import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "../theme/colors";
import { BorderRadius, Shadow, Spacing } from "../theme/spacing";

export type BottomNavItem =
  | "home"
  | "daily"
  | "absence"
  | "contracts"
  | "children"
  | "attendance"
  | "settings";

type BottomNavVariant = "parent" | "teacher";

interface BottomNavBarProps {
  activeItem?: BottomNavItem;
  variant?: BottomNavVariant;
  onItemPress?: (item: BottomNavItem) => void;
}

interface NavItemConfig {
  key: BottomNavItem;
  label: string;
  icon: string;
}

const PARENT_NAV_ITEMS: NavItemConfig[] = [
  { key: "contracts", label: "חוזים", icon: "□" },
  { key: "daily", label: "סיכום", icon: "◦" },
  { key: "home", label: "בית", icon: "⌂" },
  { key: "absence", label: "היעדרות", icon: "!" },
  { key: "settings", label: "הגדרות", icon: "*" },
];

const TEACHER_NAV_ITEMS: NavItemConfig[] = [
  { key: "contracts", label: "חוזים", icon: "□" },
  { key: "daily", label: "סיכום", icon: "◦" },
  { key: "home", label: "בית", icon: "⌂" },
  { key: "attendance", label: "נוכחות", icon: "+" },
  { key: "children", label: "ילדים", icon: "○" },
];

export function BottomNavBar({
  activeItem = "home",
  variant = "parent",
  onItemPress,
}: BottomNavBarProps) {
  const navItems = variant === "teacher" ? TEACHER_NAV_ITEMS : PARENT_NAV_ITEMS;

  return (
    <View style={styles.wrapper}>
      {navItems.map((item) => {
        const isActive = item.key === activeItem;
        const isHome = item.key === "home";

        return (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.75}
            onPress={() => onItemPress?.(item.key)}
            style={[styles.item, isHome ? styles.homeItem : undefined]}
          >
            <View
              style={[
                styles.iconCircle,
                isActive ? styles.activeIconCircle : undefined,
                isHome ? styles.homeIconCircle : undefined,
              ]}
            >
              <Text
                style={[
                  styles.iconText,
                  isActive ? styles.activeIconText : undefined,
                  isHome ? styles.homeIconText : undefined,
                ]}
              >
                {item.icon}
              </Text>
            </View>

            <Text style={[styles.label, isActive ? styles.activeLabel : undefined]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    ...Shadow.card,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  homeItem: {
    marginTop: -Spacing.lg,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  activeIconCircle: {
    backgroundColor: Colors.secondary,
  },
  homeIconCircle: {
    width: 54,
    height: 54,
    backgroundColor: Colors.primary,
  },
  iconText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  activeIconText: {
    color: Colors.primary,
  },
  homeIconText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "700",
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: "700",
  },
});