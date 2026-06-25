import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "../../src/auth/AuthContext";
import { AppCard } from "../../src/components/AppCard";
import { SetupStepLayout } from "../../src/components/SetupStepLayout";
import { useDaycareBranding, useDaycareColors } from "../../src/daycare/DaycareBrandingContext";
import { completeSetup } from "../../src/services/daycareSetup.service";
import { Spacing } from "../../src/theme/spacing";

const TOTAL_STEPS = 6;

export default function SetupCompleteScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const { settings, refresh } = useDaycareBranding();
  const colors = useDaycareColors();
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    setSaving(true);
    const ok = await completeSetup();
    if (ok) {
      await refresh();
      await refreshProfile();
      router.replace("/teacher/home");
    }
    setSaving(false);
  }

  return (
    <SetupStepLayout
      step={6}
      totalSteps={TOTAL_STEPS}
      title="הגן מוכן!"
      subtitle="סיכום קצר לפני כניסה למסך הבית"
      onBack={() => router.back()}
      onNext={handleFinish}
      nextLabel="סיום והמשך לגן"
      loading={saving}
    >
      <AppCard>
        <Text style={[styles.line, { color: colors.textPrimary }]}>
          שם הגן: {settings.daycareName}
        </Text>
        <Text style={[styles.line, { color: colors.textPrimary }]}>
          גננת: {settings.ownerName}
        </Text>
        {settings.supportPhone ? (
          <Text style={[styles.line, { color: colors.textSecondary }]}>
            טלפון: {settings.supportPhone}
          </Text>
        ) : null}
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          מ"ניהול הגן" בהגדרות תוכלי להוסיף מורים, ילדים, הורים ולעדכן תמונות.
        </Text>
      </AppCard>
    </SetupStepLayout>
  );
}

const styles = StyleSheet.create({
  line: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: Spacing.xs,
  },
  hint: {
    fontSize: 14,
    textAlign: "right",
    marginTop: Spacing.md,
    lineHeight: 20,
  },
});
