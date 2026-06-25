import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import { AppCard } from "../../src/components/AppCard";
import { AppTextInput } from "../../src/components/AppTextInput";
import { SetupStepLayout } from "../../src/components/SetupStepLayout";
import { useDaycareBranding } from "../../src/daycare/DaycareBrandingContext";
import { updateDaycareSettings } from "../../src/services/daycareSetup.service";
import { isBlank } from "../../src/utils/validation";

const TOTAL_STEPS = 6;

export default function SetupDaycareDetailsScreen() {
  const router = useRouter();
  const { settings, refresh } = useDaycareBranding();
  const [daycareName, setDaycareName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDaycareName(settings.daycareName);
    setOwnerName(settings.ownerName ?? "");
    setSupportPhone(settings.supportPhone ?? "");
    setSupportEmail(settings.supportEmail ?? "");
  }, [settings]);

  async function handleNext() {
    if (isBlank(daycareName) || isBlank(ownerName)) {
      return;
    }
    setSaving(true);
    const ok = await updateDaycareSettings({
      daycareName: daycareName.trim(),
      ownerName: ownerName.trim(),
      supportPhone: supportPhone.trim() || null,
      supportEmail: supportEmail.trim() || null,
    });
    setSaving(false);
    if (!ok) {
      return;
    }
    await refresh();
    router.push("/setup/branding" as Href);
  }

  return (
    <SetupStepLayout
      step={1}
      totalSteps={TOTAL_STEPS}
      title="פרטי הגן"
      subtitle="בואי נתחיל מהבסיס — שם הגן ופרטי קשר"
      onNext={handleNext}
      nextDisabled={isBlank(daycareName) || isBlank(ownerName)}
      loading={saving}
    >
      <AppCard>
        <AppTextInput label="שם הגן" value={daycareName} onChangeText={setDaycareName} />
        <AppTextInput label="שם הגננת / מנהלת" value={ownerName} onChangeText={setOwnerName} />
        <AppTextInput
          label="טלפון ליצירת קשר"
          value={supportPhone}
          onChangeText={setSupportPhone}
          keyboardType="phone-pad"
        />
        <AppTextInput
          label="אימייל ליצירת קשר"
          value={supportEmail}
          onChangeText={setSupportEmail}
          keyboardType="email-address"
        />
      </AppCard>
    </SetupStepLayout>
  );
}
