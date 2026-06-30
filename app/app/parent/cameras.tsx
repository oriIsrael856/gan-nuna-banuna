import React, { useCallback, useEffect, useState } from "react";
import { Alert, Linking, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { LiveCameraPlayer } from "../../src/components/LiveCameraPlayer";
import { CLIENT_CONFIG } from "../../src/config/client.config";
import { PRIVACY_POLICY_URL } from "../../src/config/env";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import {
  getCameraStreamUrl,
  getEnabledCamerasForParent,
  hasCameraConsent,
  setCameraConsent,
  type Camera,
} from "../../src/services/cameras.service";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

const privacyUrl = CLIENT_CONFIG.privacyPolicyUrl || PRIVACY_POLICY_URL;

export default function ParentCamerasScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("parent");

  const { data: consent, reload: reloadConsent } = useAsyncData(() => hasCameraConsent(), []);
  const { data: cameras, loading, error, reload } = useAsyncData(
    () => getEnabledCamerasForParent(),
    [],
  );

  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentSaving, setConsentSaving] = useState(false);

  const loadStream = useCallback(async (camera: Camera) => {
    if (!camera.isWithinSchedule) {
      setStreamError("הצפייה זמינה רק בשעות הגן.");
      setStreamUrl(null);
      return;
    }

    setStreamLoading(true);
    setStreamError(null);
    const session = await getCameraStreamUrl(camera.id);
    setStreamLoading(false);

    if (!session?.streamUrl) {
      setStreamError("השידור אינו זמין כרגע. נסו שוב מאוחר יותר.");
      setStreamUrl(null);
      return;
    }

    setStreamUrl(session.streamUrl);
  }, []);

  useEffect(() => {
    if (selectedCamera && consent) {
      void loadStream(selectedCamera);
    }
  }, [selectedCamera, consent, loadStream]);

  async function handleConsentSubmit() {
    if (!consentChecked) {
      Alert.alert("נדרש אישור", "יש לאשר את תנאי הצפייה במצלמות.");
      return;
    }

    setConsentSaving(true);
    const ok = await setCameraConsent(true);
    setConsentSaving(false);

    if (ok) {
      reloadConsent();
    } else {
      Alert.alert("שגיאה", "לא הצלחנו לשמור את האישור.");
    }
  }

  function handleBack() {
    if (selectedCamera) {
      setSelectedCamera(null);
      setStreamUrl(null);
      setStreamError(null);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/parent/home");
    }
  }

  if (!consent) {
    return (
      <View style={styles.root}>
        <AppScreen scrollable contentStyle={styles.screenContent}>
          <AppHeader variant="back" onLeadingPress={handleBack} onBellPress={() => router.push("/notifications")} />
          <Text style={styles.title}>מצלמות לייב</Text>
          <Text style={styles.subtitle}>צפייה בגן בזמן אמת</Text>

          <AppCard style={styles.consentCard}>
            <Ionicons name="shield-checkmark-outline" size={32} color={Colors.primary} style={styles.consentIcon} />
            <Text style={styles.consentTitle}>אישור צפייה במצלמות</Text>
            <Text style={styles.consentBody}>
              • הצפייה מותרת רק בשעות פעילות הגן{"\n"}
              • ייתכן שילדים נוספים יופיעו בתמונה{"\n"}
              • אין להקליט או לשתף את השידור{"\n"}
              • הגן רשאי לכבות שידור בכל עת (שינה / פרטיות)
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(privacyUrl).catch(() => {})}
              accessibilityRole="link"
              accessibilityLabel="מדיניות פרטיות"
            >
              <Text style={styles.policyLink}>מדיניות פרטיות ›</Text>
            </TouchableOpacity>
            <View style={styles.consentRow}>
              <Switch
                value={consentChecked}
                onValueChange={setConsentChecked}
                trackColor={{ true: Colors.primary, false: Colors.borderNeutral }}
                thumbColor={Colors.white}
              />
              <Text style={styles.consentCheckLabel}>אני מאשר/ת צפייה במצלמות הגן</Text>
            </View>
            <AppButton
              title={consentSaving ? "שומר..." : "המשך לצפייה"}
              onPress={handleConsentSubmit}
              disabled={consentSaving}
            />
          </AppCard>
        </AppScreen>
        <BottomNavBar activeItem="home" variant="parent" onItemPress={handleBottomNavPress} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader variant="back" onLeadingPress={handleBack} onBellPress={() => router.push("/notifications")} />
        <Text style={styles.title}>{selectedCamera ? selectedCamera.name : "מצלמות לייב"}</Text>
        <Text style={styles.subtitle}>
          {selectedCamera?.location ?? "בחרו מצלמה לצפייה · עיכוב שידור 5–15 שניות"}
        </Text>

        {selectedCamera ? (
          <>
            <LiveCameraPlayer
              streamUrl={streamUrl}
              loading={streamLoading}
              errorMessage={streamError}
            />
            <AppButton
              title="רענון שידור"
              variant="secondary"
              onPress={() => loadStream(selectedCamera)}
              style={styles.refreshBtn}
            />
          </>
        ) : loading ? (
          <AppStateCard state="loading" title="טוען מצלמות" message="רגע..." />
        ) : error ? (
          <AppStateCard state="error" title="שגיאה" message="לא הצלחנו לטעון." actionLabel="נסו שוב" onActionPress={reload} />
        ) : (cameras ?? []).length === 0 ? (
          <AppStateCard
            state="empty"
            title="אין מצלמות פעילות"
            message="הגן טרם הפעיל שידור חי. בדקו שוב מאוחר יותר."
          />
        ) : (
          (cameras ?? []).map((camera) => (
            <TouchableOpacity
              key={camera.id}
              activeOpacity={0.85}
              onPress={() => setSelectedCamera(camera)}
              accessibilityRole="button"
              accessibilityLabel={`צפייה במצלמה ${camera.name}`}
            >
              <AppCard style={styles.cameraCard}>
                <View style={styles.cameraRow}>
                  <Ionicons name="chevron-back" size={18} color={Colors.textSecondary} />
                  <View style={styles.cameraInfo}>
                    <Text style={styles.cameraName}>{camera.name}</Text>
                    {camera.location ? <Text style={styles.cameraMeta}>{camera.location}</Text> : null}
                    <Text style={styles.cameraMeta}>
                      {camera.isWithinSchedule ? "זמין עכשיו" : "מחוץ לשעות צפייה"} · {camera.scheduleLabel}
                    </Text>
                  </View>
                  <View style={styles.iconCircle}>
                    <Ionicons name="videocam" size={22} color={Colors.primary} />
                  </View>
                </View>
              </AppCard>
            </TouchableOpacity>
          ))
        )}
      </AppScreen>
      <BottomNavBar activeItem="home" variant="parent" onItemPress={handleBottomNavPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.pageBackground },
  screenContent: { paddingBottom: Spacing.xxl },
  title: { ...Typography.titleLarge, color: Colors.textPrimary, textAlign: "right", marginTop: Spacing.sm },
  subtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: "right", marginBottom: Spacing.lg },
  consentCard: { alignItems: "center", gap: Spacing.md, paddingVertical: Spacing.lg },
  consentIcon: { alignSelf: "center" },
  consentTitle: { ...Typography.title, color: Colors.textPrimary, textAlign: "center" },
  consentBody: { ...Typography.body, color: Colors.textSecondary, textAlign: "right", alignSelf: "stretch" },
  policyLink: { ...Typography.bodyMedium, fontWeight: "700", color: Colors.primary },
  consentRow: { flexDirection: "row-reverse", alignItems: "center", gap: Spacing.md, alignSelf: "stretch" },
  consentCheckLabel: { flex: 1, ...Typography.bodyMedium, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  cameraCard: { marginBottom: Spacing.sm },
  cameraRow: { flexDirection: "row-reverse", alignItems: "center", gap: Spacing.md },
  cameraInfo: { flex: 1, alignItems: "flex-end" },
  cameraName: { ...Typography.subtitle, fontWeight: "700", color: Colors.textPrimary },
  cameraMeta: { ...Typography.label, color: Colors.textSecondary, marginTop: 2 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshBtn: { marginTop: Spacing.md },
});
