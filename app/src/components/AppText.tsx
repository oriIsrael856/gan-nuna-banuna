import React from "react";
import { StyleSheet, Text } from "react-native";
import type { StyleProp, TextProps, TextStyle } from "react-native";

import { Colors } from "../theme/colors";
import { Typography } from "../theme/typography";

type TypographyVariant = keyof typeof Typography;

type TextTone = "primary" | "secondary" | "brand" | "white" | "error" | "inherit";

const toneColors: Record<TextTone, string | undefined> = {
  primary: Colors.textPrimary,
  secondary: Colors.textSecondary,
  brand: Colors.primary,
  white: Colors.white,
  error: Colors.error,
  inherit: undefined,
};

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  tone?: TextTone;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export function AppText({
  variant = "body",
  tone = "primary",
  style,
  children,
  ...rest
}: AppTextProps) {
  return (
    <Text
      style={[
        styles.base,
        Typography[variant],
        tone !== "inherit" ? { color: toneColors[tone] } : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});
