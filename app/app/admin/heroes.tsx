import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { HeroImageEditor } from "../../src/components/HeroImageEditor";
import { useDaycareBranding, useDaycareColors } from "../../src/daycare/DaycareBrandingContext";
import { Spacing } from "../../src/theme/spacing";

export default function AdminHeroesScreen() {
  const router = useRouter();
  const colors = useDaycareColors();
  const { heroUrls, refresh } = useDaycareBranding();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppScreen scrollable contentStyle={styles.content}>
        <AppHeader onBellPress={() => router.push("/notifications")} onLeadingPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>תמונות הירו</Text>
        <HeroImageEditor heroUrls={heroUrls} onChanged={refresh} />
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: Spacing.xxl },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "right",
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
