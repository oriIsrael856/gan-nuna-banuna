import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";

import { AppButton } from "../src/components/AppButton";
import { AppCard } from "../src/components/AppCard";
import { AppScreen } from "../src/components/AppScreen";
import { AppText } from "../src/components/AppText";
import { AppTextInput } from "../src/components/AppTextInput";
import { CLIENT_CONFIG } from "../src/config/client.config";
import { isDemoLoginEnabled } from "../src/config/env";
import { useAuth } from "../src/auth/AuthContext";
import { useDaycareSettings, useHero } from "../src/daycare/DaycareBrandingContext";
import { Colors } from "../src/theme/colors";
import { BorderRadius, Shadow, Spacing } from "../src/theme/spacing";

export default function HomeScreen() {
  const router = useRouter();
  const { profile, initializing, isConfigured, signIn, signInAsRole, resetPassword } = useAuth();
  const daycareSettings = useDaycareSettings();
  const loginHero = useHero("login");
  const showDemoLogin = !isConfigured && isDemoLoginEnabled;
  const showConfigError = !isConfigured && !isDemoLoginEnabled;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) {
      return;
    }
    if (profile.role === "platform_admin") {
      router.replace("/platform" as Href);
      return;
    }
    if (profile.role === "parent") {
      router.replace("/parent/home");
      return;
    }
    if (profile.role === "admin" && !profile.setupCompleted) {
      router.replace("/setup/daycare-details" as Href);
      return;
    }
    router.replace("/teacher/home");
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
      <View style={styles.heroSection}>
        <Image source={loginHero} style={styles.fullHeroImage} contentFit="cover" contentPosition="top" />
        <View style={styles.heroGradient} />
        <View style={styles.heroContent}>
          <View style={styles.logoCircle}>
            <AppText variant="display" tone="brand" style={styles.logoText}>
              {CLIENT_CONFIG.logoInitial}
            </AppText>
          </View>
          <View style={styles.heroGreeting}>
            <AppText variant="titleLarge" tone="white" style={styles.heroTitle}>
              {daycareSettings.daycareName}
            </AppText>
            <AppText variant="bodyMedium" tone="white" style={styles.heroSubtitle}>
              הבית הדיגיטלי החם של הגן
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <AppCard elevation="elevated" style={styles.welcomeCard}>
          <AppText variant="title">ברוכים הבאים</AppText>

          {isConfigured ? (
            <>
              <AppText variant="body" tone="secondary">
                התחברו עם כתובת המייל והסיסמה שלכם.
              </AppText>

              <AppTextInput
                label="אימייל"
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <AppTextInput
                label="סיסמה"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
              />

              {error ? (
                <AppText variant="bodyMedium" tone="error">
                  {error}
                </AppText>
              ) : null}

              <View style={styles.actions}>
                <AppButton
                  title={submitting ? "מתחבר..." : "כניסה"}
                  onPress={handleSignIn}
                  disabled={submitting}
                />
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  activeOpacity={0.7}
                  style={styles.forgotButton}
                  accessibilityRole="button"
                  accessibilityLabel="שכחתי סיסמה"
                >
                  <AppText variant="bodyMedium" tone="brand" style={styles.forgotText}>
                    שכחתי סיסמה
                  </AppText>
                </TouchableOpacity>
              </View>
            </>
          ) : showConfigError ? (
            <AppText variant="body" tone="secondary">
              האפליקציה לא מוגדרת לשרת. פנו למנהל המערכת או ודאו שהגדרות Supabase הוזנו בבניית
              האפליקציה.
            </AppText>
          ) : showDemoLogin ? (
            <>
              <AppText variant="body" tone="secondary">
                כאן תוכלו לעקוב אחרי היום בגן, לקבל עדכונים, לצפות בהודעות ולנהל מסמכים בצורה
                פשוטה ונעימה.
              </AppText>

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
          <AppCard style={styles.previewCard}>
            <AppText variant="subtitle">עדכונים יומיים</AppText>
            <AppText variant="caption" tone="secondary" style={styles.previewText}>
              סיכום יום, פעילויות והודעות מהגן
            </AppText>
          </AppCard>

          <AppCard style={styles.previewCard}>
            <AppText variant="subtitle">נוכחות ומסמכים</AppText>
            <AppText variant="caption" tone="secondary" style={styles.previewText}>
              מעקב נוכחות וניהול חוזים במקום אחד
            </AppText>
          </AppCard>
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
  heroSection: {
    width: "100%",
    height: 320,
    position: "relative",
    backgroundColor: Colors.background,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  fullHeroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: Colors.heroOverlay,
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
    ...Shadow.card,
  },
  logoText: {
    textAlign: "center",
    fontSize: 44,
    lineHeight: 48,
  },
  heroGreeting: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  heroTitle: {
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    textAlign: "center",
    color: "rgba(255,255,255,0.9)",
  },
  body: {
    paddingHorizontal: Spacing.md,
    marginTop: -Spacing.xl,
    gap: Spacing.lg,
  },
  welcomeCard: {
    gap: Spacing.md,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  forgotButton: {
    minHeight: 44,
    justifyContent: "center",
  },
  forgotText: {
    textAlign: "center",
  },
  previewSection: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  previewCard: {
    gap: Spacing.xs,
  },
  previewText: {
    marginTop: 2,
  },
});
