import React from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import { AppCard } from "../../src/components/AppCard";
import { SetupStepLayout } from "../../src/components/SetupStepLayout";
import { useDaycareColors } from "../../src/daycare/DaycareBrandingContext";
import { Typography } from "../../src/theme/typography";

const TOTAL_STEPS = 6;

export default function SetupFirstContractScreen() {
  const router = useRouter();
  const colors = useDaycareColors();

  return (
    <SetupStepLayout
      step={5}
      totalSteps={TOTAL_STEPS}
      title="חוזה ראשון"
      subtitle="אפשר לדלג — חוזים מועלים ממסך החוזים אחרי סיום ההקמה"
      onBack={() => router.back()}
      onSkip={() => router.push("/setup/complete" as Href)}
      onNext={() => router.push("/setup/complete" as Href)}
      nextLabel="סיום ללא חוזה"
    >
      <AppCard>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          בשלב זה אין חובה להעלות חוזה. אחרי סיום ההקמה תוכלי להעלות חוזים ממסך החוזים או מניהול
          הגן.
        </Text>
      </AppCard>
    </SetupStepLayout>
  );
}

const styles = StyleSheet.create({
  text: {
    ...Typography.body,
    textAlign: "right",
  },
});
