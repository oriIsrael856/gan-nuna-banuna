import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "../theme/colors";
import { Spacing } from "../theme/spacing";

interface AppScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  noPadding?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function AppScreen({
  children,
  scrollable = false,
  noPadding = false,
  style,
  contentStyle,
}: AppScreenProps) {
  const paddingStyle = noPadding ? undefined : styles.padded;

  return (
    <SafeAreaView style={[styles.container, style]}>
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, paddingStyle, contentStyle]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, paddingStyle, contentStyle]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  padded: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
});