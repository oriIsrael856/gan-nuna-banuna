import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AppButton } from "../src/components/AppButton";
import { AppCard } from "../src/components/AppCard";
import { AppScreen } from "../src/components/AppScreen";
import { AppTextInput } from "../src/components/AppTextInput";
import { HeroBanner } from "../src/components/HeroBanner";
import { CLIENT_CONFIG } from "../src/config/client.config";
import { isDemoLoginEnabled } from "../src/config/env";
import { useAuth } from "../src/auth/AuthContext";
import { Colors } from "../src/theme/colors";
import { Heroes } from "../src/theme/heroes";
import { heroOverlayTextStyles } from "../src/theme/heroOverlay";
import { BorderRadius, Shadow, Spacing } from "../src/theme/spacing";

export default function HomeScreen() {
  const router = useRouter();
  const { profile, initializing, isConfigured, signIn, signInAsRole, resetPassword } = useAuth();
  const showDemoLogin = !isConfigured && isDemoLoginEnabled;
  const showConfigError = !isConfigured && !isDemoLoginEnabled;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      router.replace(profile.role === "teacher" ? "/teacher/home" : "/parent/home");
    }
  }, [profile, router]);

  async function handleForgotPassword() {
    if (!email.trim()) {
      Alert.alert("אימייל חסר", "הזינו את כתובת האימייל ואז לחצו שכחתי סיסמה.");
      return;
    }
    const result = await resetPassword(email);
    if (result.ok) {
      Alert.alert("נשלח מייל", "קישור לאיפוס סיסמה נשלח לכתובת האימייל שלכם.");
    } else {
      Alert.alert("שגיאה", result.error ?? "לא הצלחנו לשלוח מייל לאיפוס.");
    }
  }

  async function handleSignIn() {
    setError("");
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "התחברות נכשלה.");
    }
  }

  if (initializing) {
    return (
      <AppScreen>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable noPadding contentStyle={styles.screenContent}>
      <HeroBanner source={Heroes.login} height={280}>
        <View style={styles.heroOverlay}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>{CLIENT_CONFIG.logoInitial}</Text>
          </View>
          <Text style={heroOverlayTextStyles.titleLarge}>{CLIENT_CONFIG.daycareName}</Text>
          <Text style={heroOverlayTextStyles.subtitleLarge}>הבית הדיגיטלי החם של הגן</Text>
        </View>
      </HeroBanner>

      <View style={styles.body}>
        <AppCard style={styles.welcomeCard}>
          <Text style={styles.cardTitle}>ברוכים הבאים</Text>

          {isConfigured ? (
            <>
              <Text style={styles.cardText}>התחברו עם כתובת המייל והסיסמה שלכם.</Text>

              <AppTextInput
                label="אימייל"
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
              />
              <AppTextInput
                label="סיסמה"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.actions}>
                <AppButton
                  title={submitting ? "מתחבר..." : "כניסה"}
                  onPress={handleSignIn}
                  disabled={submitting}
                />
                <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                  <Text style={styles.forgotText}>שכחתי סיסמה</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : showConfigError ? (
            <>
              <Text style={styles.cardText}>
                האפליקציה לא מוגדרת לשרת. פנו למנהל המערכת או ודאו שהגדרות Supabase הוזנו בבניית
                האפליקציה.
              </Text>
            </>
          ) : showDemoLogin ? (
            <>
              <Text style={styles.cardText}>
                כאן תוכלו לעקוב אחרי היום בגן, לקבל עדכונים, לצפות בהודעות ולנהל מסמכים בצורה פשוטה ונעימה.
              </Text>

              <View style={styles.actions}>
                <AppButton title="כניסה להורים" onPress={() => signInAsRole("parent")} />
                <AppButton
                  title="כניסת צוות הגן"
                  onPress={() => signInAsRole("teacher")}
                  variant="outline"
                />
              </View>
            </>
          ) : null}
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
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: Spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroOverlay: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
  },
  body: {
    paddingHorizontal: Spacing.md,
    marginTop: -Spacing.xl,
    gap: Spacing.lg,
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
  errorText: {
    color: Colors.error,
    fontWeight: "700",
    textAlign: "right",
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  forgotText: {
    textAlign: "center",
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 14,
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
