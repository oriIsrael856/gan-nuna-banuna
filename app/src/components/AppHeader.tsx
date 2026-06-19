import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useNotifications } from "../notifications/NotificationsContext";
import { Colors } from "../theme/colors";
import { BorderRadius, Shadow } from "../theme/spacing";

interface AppHeaderProps {
  variant?: "menu" | "back";
  notificationCount?: number;
  onLeadingPress?: () => void;
  onBellPress?: () => void;
}

export function AppHeader({
  variant = "menu",
  notificationCount,
  onLeadingPress,
  onBellPress,
}: AppHeaderProps) {
  const { unreadCount } = useNotifications();
  const badgeCount = notificationCount ?? unreadCount;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onLeadingPress}
        style={styles.roundButton}
      >
        <Ionicons
          name={variant === "back" ? "chevron-forward" : "menu"}
          size={22}
          color={Colors.textPrimary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onBellPress}
        style={styles.roundButton}
      >
        <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
        {badgeCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cardBackground,
    ...Shadow.card,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "800",
    marginTop: -1,
  },
});
