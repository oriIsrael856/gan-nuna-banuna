import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { BottomNavItem } from "../BottomNavBar";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface NavTab {
  key: BottomNavItem;
  label: string;
  icon: IoniconName;
}

/**
 * Figma node 36:25 ("Bottom Navigation / Parent / Home Active"). This is a
 * Parent Home-only visual variant — it preserves the shared BottomNavItem keys
 * and the onItemPress contract, so routing behavior is unchanged. The shared
 * BottomNavBar is intentionally untouched.
 *
 * Order L→R: Settings, Messages (parent) / Daily Log (teacher), Home (raised),
 * Calendar, Profile.
 */
const PARENT_SIDE_LEFT: NavTab[] = [
  { key: "settings", label: "הגדרות", icon: "settings-outline" },
  { key: "messages", label: "הודעות", icon: "chatbubbles-outline" },
];
const TEACHER_SIDE_LEFT: NavTab[] = [
  { key: "settings", label: "הגדרות", icon: "settings-outline" },
  { key: "daily", label: "תיעוד", icon: "camera-outline" },
];
const SIDE_RIGHT: NavTab[] = [
  { key: "calendar", label: "לוח שנה", icon: "calendar-outline" },
  { key: "profile", label: "פרופיל", icon: "person-outline" },
];

interface HomeBottomNavProps {
  activeItem?: BottomNavItem;
  variant?: "parent" | "teacher";
  onItemPress?: (item: BottomNavItem) => void;
}

export function HomeBottomNav({
  activeItem = "home",
  variant = "parent",
  onItemPress,
}: HomeBottomNavProps) {
  const insets = useSafeAreaInsets();

  const renderTab = (tab: NavTab) => {
    const active = tab.key === activeItem;
    return (
      <TouchableOpacity
        key={tab.key}
        activeOpacity={0.75}
        onPress={() => onItemPress?.(tab.key)}
        accessibilityRole="button"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: active }}
        style={styles.tab}
      >
        <Ionicons
          name={tab.icon}
          size={20}
          color={active ? "#315A44" : "#667469"}
        />
        <Text
          style={[styles.label, active ? styles.labelActive : null]}
          numberOfLines={1}
        >
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.surface, { paddingBottom: insets.bottom }]}>
      <View style={styles.row}>
        {(variant === "teacher" ? TEACHER_SIDE_LEFT : PARENT_SIDE_LEFT).map(renderTab)}

        <View style={styles.homeSlot}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onItemPress?.("home")}
            accessibilityRole="button"
            accessibilityLabel="בית"
            accessibilityState={{ selected: activeItem === "home" }}
            style={styles.homePill}
          >
            <Ionicons name="home" size={22} color="#FFFFFF" />
            <Text style={styles.homeLabel} numberOfLines={1}>
              בית
            </Text>
          </TouchableOpacity>
        </View>

        {SIDE_RIGHT.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: "#FFFDFC",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Figma: shadow 0 4 16 rgba(80,97,75,0.1)
    shadowColor: "#50614B",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: "#667469",
    textAlign: "center",
  },
  labelActive: {
    color: "#315A44",
  },
  homeSlot: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  homePill: {
    width: 54,
    height: 57,
    marginTop: -10,
    borderRadius: 16,
    backgroundColor: "#829D73",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingTop: 2,
    // Figma: shadow 0 3 10 rgba(73,100,66,0.16)
    shadowColor: "#496442",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
  },
  homeLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
