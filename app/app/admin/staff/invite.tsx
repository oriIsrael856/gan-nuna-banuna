import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { showAlert } from "../../../src/utils/alert";
import { useRouter } from "expo-router";

import { AppButton } from "../../../src/components/AppButton";
import { AppCard } from "../../../src/components/AppCard";
import { AppHeader } from "../../../src/components/AppHeader";
import { AppScreen } from "../../../src/components/AppScreen";
import { AppTextInput } from "../../../src/components/AppTextInput";
import { useDaycareColors } from "../../../src/daycare/DaycareBrandingContext";
import { getCurrentDaycareId } from "../../../src/services/auth.service";
import { inviteTeacher } from "../../../src/services/staff.service";
import { Spacing } from "../../../src/theme/spacing";
import { Typography } from "../../../src/theme/typography";
import { isBlank, isValidEmail } from "../../../src/utils/validation";

export default function AdminInviteTeacherScreen() {
  const router = useRouter();
  const colors = useDaycareColors();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleInvite() {
    const daycareId = getCurrentDaycareId();
    if (!daycareId) {
      showAlert("שגיאה", "לא נמצא גן.");
      return;
    }
    if (isBlank(fullName) || isBlank(email)) {
      showAlert("שדות חסרים", "שם ואימייל הם שדות חובה.");
      return;
    }
    if (!isValidEmail(email)) {
      showAlert("אימייל לא תקין", "בדקו את כתובת האימייל.");
      return;
    }

    setSaving(true);
    const result = await inviteTeacher({
      email: email.trim(),
      fullName: fullName.trim(),
      phone: phone.trim() || undefined,
      daycareId,
    });
    setSaving(false);

    if (!result.ok) {
      showAlert("שגיאה", result.error ?? "ההזמנה נכשלה.");
      return;
    }

    showAlert(
      "נשלח",
      result.status === "already_exists"
        ? "המשתמש כבר קיים — שויך לגן כמורה."
        : "הזמנה נשלחה למייל.",
      [{ text: "אישור", onPress: () => router.back() }],
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppScreen scrollable contentStyle={styles.content}>
        <AppHeader onBellPress={() => router.push("/notifications")} onLeadingPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>הזמנת מורה</Text>
        <AppCard>
          <AppTextInput label="שם מלא" value={fullName} onChangeText={setFullName} />
          <AppTextInput label="אימייל" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <AppTextInput label="טלפון (אופציונלי)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </AppCard>
        <AppButton title={saving ? "שולח..." : "שליחת הזמנה"} onPress={handleInvite} disabled={saving} />
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
  },
});
