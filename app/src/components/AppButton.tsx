import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";

import { Colors } from "../theme/colors";
import { BorderRadius, Shadow, Spacing } from "../theme/spacing";
import { Typography } from "../theme/typography";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

function getContainerStyle(variant: ButtonVariant) {
  switch (variant) {
    case "secondary":
      return styles.secondary;
    case "outline":
      return styles.outline;
    case "danger":
      return styles.danger;
    case "primary":
    default:
      return styles.primary;
  }
}

function getTextStyle(variant: ButtonVariant) {
  switch (variant) {
    case "secondary":
      return styles.secondaryText;
    case "outline":
      return styles.outlineText;
    case "danger":
      return styles.dangerText;
    case "primary":
    default:
      return styles.primaryText;
  }
}

export function AppButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
  textStyle,
}: AppButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.base,
        getContainerStyle(variant),
        disabled ? styles.disabled : undefined,
        style,
      ]}
    >
      <Text style={[styles.text, getTextStyle(variant), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
  },
  disabled: {
    opacity: 0.5,
  },
  primary: {
    backgroundColor: Colors.primary,
    ...Shadow.subtle,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  danger: {
    backgroundColor: Colors.error,
  },
  text: {
    ...Typography.subtitle,
    textAlign: "center",
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.textPrimary,
  },
  outlineText: {
    color: Colors.primary,
  },
  dangerText: {
    color: Colors.white,
  },
});