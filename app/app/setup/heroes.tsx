import React from "react";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import { HeroImageEditor } from "../../src/components/HeroImageEditor";
import { SetupStepLayout } from "../../src/components/SetupStepLayout";
import { useDaycareBranding } from "../../src/daycare/DaycareBrandingContext";

const TOTAL_STEPS = 6;

export default function SetupHeroesScreen() {
  const router = useRouter();
  const { heroUrls, refresh } = useDaycareBranding();

  return (
    <SetupStepLayout
      step={3}
      totalSteps={TOTAL_STEPS}
      title="תמונות הירו"
      subtitle="אפשר להעלות עכשיו או לדלג ולעדכן אחר כך מניהול הגן"
      onBack={() => router.back()}
      onSkip={() => router.push("/setup/first-child" as Href)}
      onNext={() => router.push("/setup/first-child" as Href)}
    >
      <HeroImageEditor heroUrls={heroUrls} onChanged={refresh} compact />
    </SetupStepLayout>
  );
}
