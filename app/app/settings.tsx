import React, { useEffect, useState } from "react";
import { Alert, Linking, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "../src/components/AppCard";
import { AppHeader } from "../src/components/AppHeader";
import { AppScreen } from "../src/components/AppScreen";
import { BottomNavBar } from "../src/components/BottomNavBar";
import { useAuth } from "../src/auth/AuthContext";
import { CLIENT_CONFIG } from "../src/config/client.config";
import { PRIVACY_POLICY_URL, TERMS_URL } from "../src/config/env";
import { useBottomNavPress } from "../src/navigation/useBottomNavPress";
import { getCurrentDaycareName, getCurrentUserRole } from "../src/services/auth.service";
import { getPilotReadinessLabel } from "../src/services/pilot.service";
import {
  isPushAvailableInCurrentRuntime,
  registerPushToken,
  unregisterPushToken,
} from "../src/services/push.service";
import {
  hasCameraConsent,
  setCameraConsent,
} from "../src/services/cameras.service";
import { Colors } from "../src/theme/colors";
import { BorderRadius, Spacing } from "../src/theme/spacing";
import { Typography } from "../src/theme/typography";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const privacyUrl = CLIENT_CONFIG.privacyPolicyUrl || PRIVACY_POLICY_URL;
const termsUrl = CLIENT_CONFIG.termsUrl || TERMS_URL;

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, profile } = useAuth();
  const role = getCurrentUserRole();
  const variant = role === "teacher" || role === "admin" ? "teacher" : "parent";
  const handleBottomNavPress = useBottomNavPress(variant);
  const pilotLabel = getPilotReadinessLabel();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [cameraConsent, setCameraConsentState] = useState(false);

  useEffect(() => {
    if (variant === "parent") {
      void hasCameraConsent().then(setCameraConsentState);
    }
  }, [variant]);

  useEffect(() => {
    if (profile && pushEnabled) {
      registerPushToken(profile.id);
    }
  }, [profile, pushEnabled]);

  async function handlePushToggle(next: boolean) {
    if (next && !isPushAvailableInCurrentRuntime()) {
      Alert.alert(
        "לא זמין ב-Expo Go",
        "התראות פוש דורשות development build (לא Expo Go). שאר האפליקציה עובדת כרגיל.",
      );
      return;
    }

    setPushEnabled(next);
    if (!profile) {
      return;
    }
    if (next) {
      await registerPushToken(profile.id);
    } else {
      await unregisterPushToken(profile.id);
    }
  }

  async function handleCameraConsentToggle(next: boolean) {
    const ok = await setCameraConsent(next);
    if (ok) {
      setCameraConsentState(next);
    } else {
      Alert.alert("שגיאה", "לא הצלחנו לעדכן את האישור.");
    }
  }

  function openUrl(url: string) {
    Linking.openURL(url).catch(() => {});
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader
          onBellPress={() => router.push("/notifications")}
          onLeadingPress={() => {}}
        />
        <Text style={styles.title}>הגדרות</Text>
        <Text style={styles.subtitle}>ניהול ההתראות וההעדפות שלך</Text>

        <View style={styles.pilotBadge}>
          <Text style={styles.pilotBadgeText}>{pilotLabel}</Text>
        </View>

        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>התראות</Text>
          <ToggleRow
            icon="notifications-outline"
            label="התראות פוש"
            value={pushEnabled}
            onValueChange={handlePushToggle}
          />
          <ToggleRow
            icon="mail-outline"
            label="התראות במייל"
            subtitle="בקרוב"
            value={false}
            disabled
          />
          <ToggleRow
            icon="volume-high-outline"
            label="צליל התראה"
            subtitle="בקרוב"
            value={false}
            disabled
            isLast
          />
        </AppCard>

        {variant === "parent" ? (
          <AppCard style={styles.card}>
            <Text style={styles.sectionTitle}>מצלמות לייב</Text>
            <ToggleRow
              icon="videocam-outline"
              label="אישור צפייה במצלמות"
              subtitle="נדרש לפני צפייה בשידור חי מהגן"
              value={cameraConsent}
              onValueChange={handleCameraConsentToggle}
              isLast
            />
          </AppCard>
        ) : (
          <AppCard style={styles.card}>
            <Text style={styles.sectionTitle}>מצלמות</Text>
            <LinkRow
              icon="videocam-outline"
              label="ניהול מצלמות לייב"
              onPress={() => router.push("/teacher/cameras" as Href)}
              isLast
            />
          </AppCard>
        )}

        {variant === "teacher" && profile?.role === "admin" ? (
          <AppCard style={styles.card}>
            <Text style={styles.sectionTitle}>ניהול הגן</Text>
            <LinkRow
              icon="business-outline"
              label="פתיחה וניהול הגן"
              onPress={() => router.push("/admin" as Href)}
              isLast
            />
          </AppCard>
        ) : null}

        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>כללי</Text>
          <LinkRow icon="language-outline" label="שפה" value="עברית" />
          <LinkRow icon="information-circle-outline" label="גרסה" value="1.0.0" />
          <LinkRow
            icon="shield-checkmark-outline"
            label="מדיניות פרטיות"
            onPress={() => openUrl(privacyUrl)}
          />
          <LinkRow
            icon="document-text-outline"
            label="תנאי שימוש"
            onPress={() => openUrl(termsUrl)}
            isLast
          />
        </AppCard>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={async () => {
            await signOut();
            router.replace("/");
          }}
          style={styles.logoutButton}
          accessibilityRole="button"
          accessibilityLabel="התנתקות"
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>התנתקות</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>{getCurrentDaycareName()}</Text>
      </AppScreen>

      <BottomNavBar activeItem="settings" variant={variant} onItemPress={handleBottomNavPress} />
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  subtitle,
  value,
  onValueChange,
  disabled,
  isLast,
}: {
  icon: IoniconName;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange?: (next: boolean) => void;
  disabled?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: Colors.primary, false: Colors.borderNeutral }}
        thumbColor={Colors.white}
      />
      <View style={styles.rowTextBlock}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
    </View>
  );
}

function LinkRow({
  icon,
  label,
  value,
  onPress,
  isLast,
}: {
  icon: IoniconName;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
}) {
  const content = (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.rowEnd}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {onPress ? <Ionicons name="chevron-back" size={18} color={Colors.textSecondary} /> : null}
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
  },
  screenContent: {
    paddingBottom: Spacing.xxl,
  },
  title: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  pilotBadge: {
    alignSelf: "flex-end",
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  pilotBadgeText: {
    ...Typography.labelBold,
    color: Colors.primary,
  },
  card: {
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    textAlign: "right",
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    minHeight: 44,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  rowTextBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  rowLabel: {
    ...Typography.body,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  rowSubtitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowEnd: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  rowValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  logoutButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.cardBackground,
  },
  logoutText: {
    ...Typography.subtitle,
    fontWeight: "800",
    color: Colors.error,
  },
  footerText: {
    ...Typography.label,
    textAlign: "center",
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
});
