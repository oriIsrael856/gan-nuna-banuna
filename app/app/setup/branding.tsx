import React, { useEffect, useState } from "react";
import {  } from "react-native";
import { showAlert } from "../../src/utils/alert";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import { AppCard } from "../../src/components/AppCard";
import { AppTextInput } from "../../src/components/AppTextInput";
import { SetupStepLayout } from "../../src/components/SetupStepLayout";
import { useDaycareBranding } from "../../src/daycare/DaycareBrandingContext";
import { updateDaycareSettings } from "../../src/services/daycareSetup.service";

const TOTAL_STEPS = 6;

export default function SetupBrandingScreen() {
  const router = useRouter();
  const { settings, refresh } = useDaycareBranding();
  const [tagline, setTagline] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTagline(settings.tagline ?? "");
    setSubtitle(settings.subtitle ?? "");
    setPrimaryColor(settings.primaryColor ?? "");
    setSecondaryColor(settings.secondaryColor ?? "");
  }, [settings]);

  async function handleNext() {
    setSaving(true);
    const result = await updateDaycareSettings({
      tagline: tagline.trim() || null,
      subtitle: subtitle.trim() || null,
      primaryColor: primaryColor.trim() || null,
      secondaryColor: secondaryColor.trim() || null,
    });
    setSaving(false);
    if (!result.ok) {
      showAlert("לא הצלחנו לשמור", result.error ?? "נסו שוב.");
      return;
    }
    await refresh();
    router.push("/setup/heroes" as Href);
  }

  return (
    <SetupStepLayout
      step={2}
      totalSteps={TOTAL_STEPS}
      title="מיתוג הגן"
      subtitle="טקסטים וצבעים שיופיעו באפליקציה"
      onBack={() => router.back()}
      onNext={handleNext}
      loading={saving}
    >
      <AppCard>
        <AppTextInput label="סלוגן" value={tagline} onChangeText={setTagline} />
        <AppTextInput label="כותרת משנה" value={subtitle} onChangeText={setSubtitle} />
        <AppTextInput
          label="צבע ראשי (hex)"
          value={primaryColor}
          onChangeText={setPrimaryColor}
          placeholder="#7A9A72"
        />
        <AppTextInput
          label="צבע משני (hex)"
          value={secondaryColor}
          onChangeText={setSecondaryColor}
          placeholder="#F4D6C6"
        />
      </AppCard>
    </SetupStepLayout>
  );
}
