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

export default function AdminBrandingScreen() {
  const router = useRouter();
  const colors = useDaycareColors();
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

  async function handleSave() {
    setSaving(true);
    const ok = await updateDaycareSettings({
      tagline: tagline.trim() || null,
      subtitle: subtitle.trim() || null,
      primaryColor: primaryColor.trim() || null,
      secondaryColor: secondaryColor.trim() || null,
    });
    setSaving(false);
    if (!ok) {
      Alert.alert("שגיאה", "לא הצלחנו לשמור.");
      return;
    }
    await refresh();
    Alert.alert("נשמר", "המיתוג עודכן.");
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppScreen scrollable contentStyle={styles.content}>
        <AppHeader onBellPress={() => router.push("/notifications")} onLeadingPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>מיתוג וצבעים</Text>
        <AppCard>
          <AppTextInput label="סלוגן" value={tagline} onChangeText={setTagline} />
          <AppTextInput label="כותרת משנה" value={subtitle} onChangeText={setSubtitle} />
          <AppTextInput label="צבע ראשי" value={primaryColor} onChangeText={setPrimaryColor} />
          <AppTextInput label="צבע משני" value={secondaryColor} onChangeText={setSecondaryColor} />
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
    fontSize: 24,
    fontWeight: "800",
    textAlign: "right",
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
