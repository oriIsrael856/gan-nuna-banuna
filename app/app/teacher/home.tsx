import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppScreen } from "../../src/components/AppScreen";
import { AppCard } from "../../src/components/AppCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { Colors } from "../../src/theme/colors";
import { Spacing } from "../../src/theme/spacing";

export default function TeacherHomeScreen() {
  return (
    <View style={styles.root}>
      <AppScreen scrollable>
        <View style={styles.content}>
          <Text style={styles.title}>Teacher Home</Text>
          <View style={styles.statsRow}>
            <AppCard style={styles.statCard}>
              <Text style={styles.statNumber}>22</Text>
              <Text style={styles.statLabel}>Children</Text>
            </AppCard>
            <AppCard style={styles.statCard}>
              <Text style={styles.statNumber}>16</Text>
              <Text style={styles.statLabel}>Present Today</Text>
            </AppCard>
          </View>
          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>Today Overview</Text>
            <Text style={styles.cardText}>Attendance and daily actions will appear here.</Text>
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
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
