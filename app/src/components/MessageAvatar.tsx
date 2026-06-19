import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../theme/colors";

export type MessageAvatarVariant = "broadcast" | "direct" | "sender";

interface MessageAvatarProps {
  initial: string;
  size?: "sm" | "md";
  variant?: MessageAvatarVariant;
  showBadge?: boolean;
}

const SIZES = {
  sm: { outer: 32, text: 14, badge: 14, icon: 8 },
  md: { outer: 52, text: 22, badge: 18, icon: 10 },
} as const;

export function MessageAvatar({
  initial,
  size = "md",
  variant = "sender",
  showBadge = false,
}: MessageAvatarProps) {
  const dims = SIZES[size];
  const displayInitial = variant === "broadcast" ? "כ" : initial.slice(0, 1);

  return (
    <View style={[styles.wrapper, { width: dims.outer, height: dims.outer }]}>
      <View
        style={[
          styles.circle,
          {
            width: dims.outer,
            height: dims.outer,
            borderRadius: dims.outer / 2,
          },
          variant === "broadcast" && styles.broadcastCircle,
        ]}
      >
        {variant === "broadcast" ? (
          <Ionicons name="megaphone-outline" size={dims.text} color={Colors.primary} />
        ) : (
          <Text style={[styles.initial, { fontSize: dims.text }]}>{displayInitial}</Text>
        )}
      </View>

      {showBadge ? (
        <View
          style={[
            styles.badge,
            {
              width: dims.badge,
              height: dims.badge,
              borderRadius: dims.badge / 2,
            },
            variant === "direct" && styles.directBadge,
          ]}
        >
          {variant === "broadcast" ? (
            <Ionicons name="people" size={dims.icon} color={Colors.white} />
          ) : (
            <Ionicons name="person" size={dims.icon} color={Colors.white} />
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  circle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  broadcastCircle: {
    backgroundColor: Colors.secondary,
  },
  initial: {
    fontWeight: "800",
    color: Colors.primary,
  },
  badge: {
    position: "absolute",
    bottom: -2,
    left: -2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  directBadge: {
    backgroundColor: Colors.primary,
  },
});
