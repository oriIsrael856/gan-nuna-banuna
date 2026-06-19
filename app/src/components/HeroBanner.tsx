import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ImageContentPosition, ImageSource } from "expo-image";

import { Colors } from "../theme/colors";
import { heroOverlayTextStyles } from "../theme/heroOverlay";
import { BorderRadius, Spacing } from "../theme/spacing";

interface HeroBannerProps {
  source: ImageSource;
  title?: string;
  subtitle?: string;
  height?: number;
  contentPosition?: ImageContentPosition;
  children?: React.ReactNode;
}

export function HeroBanner({
  source,
  title,
  subtitle,
  height = 220,
  contentPosition = "center",
  children,
}: HeroBannerProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Image
        source={source}
        style={styles.image}
        contentFit="cover"
        contentPosition={contentPosition}
      />
      {title || subtitle ? (
        <View style={styles.textOverlay}>
          {title ? <Text style={heroOverlayTextStyles.title}>{title}</Text> : null}
          {subtitle ? <Text style={heroOverlayTextStyles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    backgroundColor: Colors.background,
    justifyContent: "flex-start",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  textOverlay: {
    alignItems: "center",
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
});
