import React, { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { AppButton } from "../src/components/AppButton";
import { AppCard } from "../src/components/AppCard";
import { AppHeader } from "../src/components/AppHeader";
import { AppScreen } from "../src/components/AppScreen";
import { AppTextInput } from "../src/components/AppTextInput";
import { isSupabaseConfigured, supabase } from "../src/lib/supabase";
import { Colors } from "../src/theme/colors";
import { Typography } from "../src/theme/typography";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }

    if (!supabase) {
      setError("Supabase לא מוגדר");
      return;
    }

    setError("");
    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    Alert.alert("הסיסמה עודכנה", "אפשר להתחבר עם הסיסמה החדשה.", [
      { text: "המשך", onPress: () => router.replace("/") },
    ]);
  }

  if (!isSupabaseConfigured) {
    return (
      <AppScreen>
        <Text style={styles.title}>איפוס סיסמה</Text>
        <Text style={styles.subtitle}>נדרש חיבור ל-Supabase.</Text>
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable contentStyle={styles.content}>
      <AppHeader variant="back" onLeadingPress={() => router.replace("/")} />
      <Text style={styles.title}>הגדרת סיסמה חדשה</Text>
      <Text style={styles.subtitle}>בחרו סיסמה חדשה לחשבון שלכם</Text>

      <AppCard style={styles.card}>
        <AppTextInput
          value={password}
          onChangeText={setPassword}
          placeholder="סיסמה חדשה"
          secureTextEntry
        />
        <AppTextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="אימות סיסמה"
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton
          title={submitting ? "שומר..." : "שמירת סיסמה"}
          onPress={handleSave}
          disabled={submitting}
        />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  title: {
    ...Typography.titleLarge,
    textAlign: "right",
    marginTop: 8,
  },
  subtitle: {
    ...Typography.body,
    textAlign: "right",
    marginTop: 4,
    marginBottom: 16,
    opacity: 0.7,
  },
  card: {
    gap: 12,
  },
  error: {
    ...Typography.body,
    color: Colors.errorStrong,
    textAlign: "right",
  },
});
