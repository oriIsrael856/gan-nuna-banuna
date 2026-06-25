import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Colors } from "../theme/colors";
import { Spacing } from "../theme/spacing";
import { AppButton } from "./AppButton";
import { AppCard } from "./AppCard";
import { AppText } from "./AppText";

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
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="body" tone="secondary" style={styles.message}>
        {message}
      </AppText>
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
    textAlign: "center",
  },
  message: {
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  action: {
    marginTop: Spacing.md,
    width: "100%",
  },
});
