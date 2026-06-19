import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

import { Colors } from "../theme/colors";
import { BorderRadius, Spacing } from "../theme/spacing";

interface HeroBannerProps {
  source: ImageSourcePropType;
  title?: string;
  subtitle?: string;
  height?: number;
  children?: React.ReactNode;
}

export function HeroBanner({
  source,
  title,
  subtitle,
  height = 220,
  children,
}: HeroBannerProps) {
  return (
    <ImageBackground
      source={source}
      resizeMode="cover"
      style={[styles.image, { height }]}
      imageStyle={styles.imageRadius}
    >
      {title || subtitle ? (
        <View style={styles.textOverlay}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    justifyContent: "flex-start",
  },
  imageRadius: {
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  textOverlay: {
    alignItems: "center",
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginTop: 2,
  },
});
