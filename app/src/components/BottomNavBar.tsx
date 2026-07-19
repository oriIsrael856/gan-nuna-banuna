import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../theme/colors";
import { BorderRadius, Shadow, Spacing } from "../theme/spacing";

// On web, pin to the visual viewport so browser chrome / scroll chaining
// can't lift the bar (same approach as Parent Home's HomeBottomNav).
const FIXED_WEB =
  Platform.OS === "web"
    ? ({
        position: "fixed" as "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
      } as const)
    : null;

/** Approximate bar body height (excluding safe-area padding) — used as a
 *  layout spacer on web so scroll content isn't hidden under the fixed bar. */
const NAV_BODY_HEIGHT = 72;

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
  const insets = useSafeAreaInsets();
  const navItems = variant === "teacher" ? TEACHER_NAV_ITEMS : PARENT_NAV_ITEMS;
  const bottomPad = Spacing.md + insets.bottom;

  return (
    <>
      {Platform.OS === "web" ? (
        <View
          style={{ height: NAV_BODY_HEIGHT + bottomPad }}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      ) : null}
      <View style={[styles.wrapper, FIXED_WEB, { paddingBottom: bottomPad }]}>
        {navItems.map((item) => {
          const isActive = item.key === activeItem;
          const isHome = item.key === "home";

          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.75}
              onPress={() => onItemPress?.(item.key)}
              style={[styles.item, isHome ? styles.homeItem : undefined]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: isActive }}
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
    </>
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
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    ...Shadow.elevated,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  homeItem: {
    marginTop: -Spacing.lg,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  activeIconCircle: {
    backgroundColor: Colors.secondary,
  },
  homeIconCircle: {
    width: 56,
    height: 56,
    backgroundColor: Colors.primary,
    ...Shadow.card,
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: "600",
  },
});