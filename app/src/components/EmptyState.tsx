import React from "react";
import { StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "./AppButton";
import { AppCard } from "./AppCard";
import { AppText } from "./AppText";
import { Colors } from "../theme/colors";
import { BorderRadius, Spacing } from "../theme/spacing";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface EmptyStateProps {
  icon?: IoniconName;
  title: string;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon = "leaf-outline",
  title,
  message,
  actionLabel,
  onActionPress,
  style,
}: EmptyStateProps) {
  return (
    <AppCard style={[styles.card, style]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={Colors.primary} />
      </View>
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="body" tone="secondary" style={styles.message}>
        {message}
      </AppText>
      {actionLabel && onActionPress ? (
        <AppButton title={actionLabel} onPress={onActionPress} style={styles.action} />
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.xs,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    lineHeight: 22,
  },
  action: {
    marginTop: Spacing.md,
    alignSelf: "stretch",
  },
});
