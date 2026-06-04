import React from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../src/components/AppButton";
import { AppCard } from "../src/components/AppCard";
import { AppScreen } from "../src/components/AppScreen";
import { CLIENT_CONFIG } from "../src/config/client.config";
import { Colors } from "../src/theme/colors";
import { BorderRadius, Shadow, Spacing } from "../src/theme/spacing";

export default function HomeScreen() {
  const router = useRouter();

  function handleParentLogin() {
    router.push("/parent/home");
  }

  function handleTeacherLogin() {
    router.push("/teacher/home");
  }

  return (
    <AppScreen scrollable contentStyle={styles.screenContent}>
      <View style={styles.heroSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>{CLIENT_CONFIG.logoInitial}</Text>
        </View>

        <Text style={styles.gardenName}>{CLIENT_CONFIG.daycareName}</Text>
        <Text style={styles.subtitle}>הבית הדיגיטלי החם של הגן</Text>
      </View>

      <AppCard style={styles.welcomeCard}>
        <Text style={styles.cardTitle}>ברוכים הבאים</Text>

        <Text style={styles.cardText}>
          כאן תוכלו לעקוב אחרי היום בגן, לקבל עדכונים, לצפות בהודעות ולנהל מסמכים בצורה פשוטה ונעימה.
        </Text>

        <View style={styles.actions}>
          <AppButton title="כניסה להורים" onPress={handleParentLogin} />

          <AppButton
            title="כניסת צוות הגן"
            onPress={handleTeacherLogin}
            variant="outline"
          />
        </View>
      </AppCard>

      <View style={styles.previewSection}>
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>עדכונים יומיים</Text>
          <Text style={styles.previewText}>סיכום יום, פעילויות והודעות מהגן</Text>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>נוכחות ומסמכים</Text>
          <Text style={styles.previewText}>מעקב נוכחות וניהול חוזים במקום אחד</Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    justifyContent: "center",
    gap: Spacing.lg,
  },
  heroSection: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.xl,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
    ...Shadow.card,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "700",
    color: Colors.primary,
  },
  gardenName: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  welcomeCard: {
    gap: Spacing.md,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  previewSection: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  previewCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "right",
  },
});
