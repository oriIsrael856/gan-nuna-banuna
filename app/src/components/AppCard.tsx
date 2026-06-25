import React from "react";
import { StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { Colors } from "../theme/colors";
import { BorderRadius, Shadow, Spacing } from "../theme/spacing";

interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Use "elevated" for modals, alerts, or key CTAs that need more prominence */
  elevation?: "default" | "elevated";
}

export function AppCard({ children, style, elevation = "default" }: AppCardProps) {
  return (
    <View
      style={[
        styles.card,
        elevation === "elevated" ? styles.cardElevated : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.055)",
    ...Shadow.card,
  },
  cardElevated: {
    ...Shadow.elevated,
  },
});
