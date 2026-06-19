import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Colors } from "../theme/colors";
import { Spacing } from "../theme/spacing";
import { AppButton } from "./AppButton";
import { AppCard } from "./AppCard";

interface AppStateCardProps {
  title: string;
  message: string;
  state?: "empty" | "error" | "loading";
  actionLabel?: string;
  onActionPress?: () => void;
}

export function AppStateCard({
  title,
  message,
  state = "empty",
  actionLabel,
  onActionPress,
}: AppStateCardProps) {
  return (
    <AppCard style={styles.card}>
      {state === "loading" ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onActionPress ? (
        <View style={styles.action}>
          <AppButton title={actionLabel} onPress={onActionPress} />
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  loader: {
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  action: {
    marginTop: Spacing.md,
    width: "100%",
  },
});
