import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "./AppButton";
import { AppScreen } from "./AppScreen";
import { useDaycareColors } from "../daycare/DaycareBrandingContext";
import { BorderRadius, Spacing } from "../theme/spacing";

interface SetupStepLayoutProps {
  title: string;
  subtitle?: string;
  step: number;
  totalSteps: number;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}

export function SetupStepLayout({
  title,
  subtitle,
  step,
  totalSteps,
  children,
  onNext,
  onBack,
  onSkip,
  nextLabel = "המשך",
  nextDisabled,
  loading,
}: SetupStepLayoutProps) {
  const colors = useDaycareColors();

  return (
    <AppScreen scrollable contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
          שלב {step} מתוך {totalSteps}
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${(step / totalSteps) * 100}%` },
            ]}
          />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>

      {children}

      <View style={styles.actions}>
        {onSkip ? (
          <AppButton title="דלג" variant="secondary" onPress={onSkip} disabled={loading} />
        ) : null}
        {onBack ? (
          <AppButton title="חזרה" variant="secondary" onPress={onBack} disabled={loading} />
        ) : null}
        {onNext ? (
          <AppButton
            title={loading ? "שומר..." : nextLabel}
            onPress={onNext}
            disabled={nextDisabled || loading}
          />
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.sm,
    alignItems: "flex-end",
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: "#E8E8E8",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "right",
    width: "100%",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "right",
    width: "100%",
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});
