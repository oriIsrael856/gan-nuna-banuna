import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../theme/colors";
import { BorderRadius, Shadow, Spacing } from "../theme/spacing";

export type BottomNavItem =
  | "home"
  | "daily"
  | "calendar"
  | "profile"
  | "settings";

type BottomNavVariant = "parent" | "teacher";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface BottomNavBarProps {
  activeItem?: BottomNavItem;
  variant?: BottomNavVariant;
  onItemPress?: (item: BottomNavItem) => void;
}

interface NavItemConfig {
  key: BottomNavItem;
  label: string;
  icon: IoniconName;
}

const PARENT_NAV_ITEMS: NavItemConfig[] = [
  { key: "settings", label: "הגדרות", icon: "settings-outline" },
  { key: "daily", label: "תיעוד יומי", icon: "camera-outline" },
  { key: "home", label: "בית", icon: "home" },
  { key: "calendar", label: "לוח שנה", icon: "calendar-outline" },
  { key: "profile", label: "פרופיל", icon: "person-outline" },
];

const TEACHER_NAV_ITEMS: NavItemConfig[] = [
  { key: "settings", label: "הגדרות", icon: "settings-outline" },
  { key: "daily", label: "תיעוד יומי", icon: "camera-outline" },
  { key: "home", label: "בית", icon: "home" },
  { key: "calendar", label: "לוח שנה", icon: "calendar-outline" },
  { key: "profile", label: "פרופיל", icon: "person-outline" },
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
              <Ionicons
                name={item.icon}
                size={isHome ? 26 : 22}
                color={
                  isHome
                    ? Colors.white
                    : isActive
                      ? Colors.primary
                      : Colors.textSecondary
                }
              />
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