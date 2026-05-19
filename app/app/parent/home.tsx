import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppScreen } from "../../src/components/AppScreen";
import { AppCard } from "../../src/components/AppCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { Colors } from "../../src/theme/colors";
import { Spacing } from "../../src/theme/spacing";

export default function ParentHomeScreen() {
  return (
    <View style={styles.root}>
      <AppScreen scrollable>
        <View style={styles.content}>
          <Text style={styles.title}>שלום רחל</Text>
          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>סיכום היום</Text>
            <Text style={styles.cardText}>כאן יופיעו עדכונים יומיים מהגן.</Text>
          </AppCard>
            <AppCard style={styles.card}>
    <Text style={styles.cardTitle}>חוזה ממתין לחתימה</Text>
    <Text style={styles.cardText}>
      ניתן יהיה לעיין בחוזה ולעבור לחתימה דיגיטלית בהמשך.
    </Text>
  </AppCard>

        </View>
      </AppScreen>
      <BottomNavBar activeItem="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingTop: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  card: {
    marginTop: Spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
