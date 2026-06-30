import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppTextInput } from "../../src/components/AppTextInput";
import { useDaycareBranding, useDaycareColors } from "../../src/daycare/DaycareBrandingContext";
import { updateDaycareSettings } from "../../src/services/daycareSetup.service";
import { Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";
import { isBlank } from "../../src/utils/validation";

export default function AdminDaycareDetailsScreen() {
  const router = useRouter();
  const colors = useDaycareColors();
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

  async function handleSave() {
    if (isBlank(daycareName) || isBlank(ownerName)) {
      Alert.alert("שדות חסרים", "שם הגן ושם הגננת הם שדות חובה.");
      return;
    }
    setSaving(true);
    const result = await updateDaycareSettings({
      daycareName: daycareName.trim(),
      ownerName: ownerName.trim(),
      supportPhone: supportPhone.trim() || null,
      supportEmail: supportEmail.trim() || null,
    });
    setSaving(false);
    if (!result.ok) {
      Alert.alert("שגיאה", result.error ?? "לא הצלחנו לשמור.");
      return;
    }
    await refresh();
    Alert.alert("נשמר", "פרטי הגן עודכנו.");
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppScreen scrollable contentStyle={styles.content}>
        <AppHeader onBellPress={() => router.push("/notifications")} onLeadingPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>פרטי הגן</Text>
        <AppCard>
          <AppTextInput label="שם הגן" value={daycareName} onChangeText={setDaycareName} />
          <AppTextInput label="שם הגננת / מנהלת" value={ownerName} onChangeText={setOwnerName} />
          <AppTextInput label="טלפון" value={supportPhone} onChangeText={setSupportPhone} keyboardType="phone-pad" />
          <AppTextInput label="אימייל" value={supportEmail} onChangeText={setSupportEmail} keyboardType="email-address" />
        </AppCard>
        <AppButton title={saving ? "שומר..." : "שמירה"} onPress={handleSave} disabled={saving} />
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: Spacing.lg, paddingBottom: Spacing.xxl },
  title: {
    ...Typography.titleLarge,
    textAlign: "right",
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
