import React, { useState } from "react";
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { AppTextInput } from "../../src/components/AppTextInput";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import {
  createCamera,
  deleteCamera,
  getCamerasForTeacher,
  toggleCameraEnabled,
  updateCamera,
  type Camera,
} from "../../src/services/cameras.service";
import { confirmDelete } from "../../src/utils/confirm";
import { parseCameraSchedule } from "../../src/utils/cameraSchedule";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

export default function TeacherCamerasScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const { data, loading, error, reload } = useAsyncData(() => getCamerasForTeacher(), []);
  const cameras = data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setEditingId(null);
    setName("");
    setLocation("");
    setStreamUrl("");
    setStartTime("08:00");
    setEndTime("16:00");
    setShowForm(false);
  }

  function startEdit(camera: Camera) {
    setEditingId(camera.id);
    setName(camera.name);
    setLocation(camera.location ?? "");
    setStreamUrl(camera.streamExternalId ?? "");
    setStartTime(camera.schedule.startTime ?? "08:00");
    setEndTime(camera.schedule.endTime ?? "16:00");
    setShowForm(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("חסר שם", "יש להזין שם למצלמה.");
      return;
    }

    setSaving(true);
    const schedule = parseCameraSchedule({
      startTime,
      endTime,
      days: [0, 1, 2, 3, 4, 5],
      timezone: "Asia/Jerusalem",
    });

    const ok = editingId
      ? await updateCamera(editingId, {
          name,
          location,
          streamExternalId: streamUrl,
          schedule,
        })
      : await createCamera({
          name,
          location,
          streamExternalId: streamUrl,
          schedule,
        });

    setSaving(false);

    if (ok) {
      resetForm();
      reload();
      Alert.alert("נשמר", "פרטי המצלמה עודכנו.");
    } else {
      Alert.alert("שגיאה", "לא הצלחנו לשמור. נסו שוב.");
    }
  }

  async function handleToggle(camera: Camera, enabled: boolean) {
    if (enabled && !camera.streamExternalId?.trim()) {
      Alert.alert("חסרה כתובת שידור", "הגדירו כתובת HLS לפני הפעלת המצלמה.");
      return;
    }
    await toggleCameraEnabled(camera.id, enabled);
    reload();
  }

  function handleDelete(cameraId: string) {
    confirmDelete("למחוק את המצלמה?", async () => {
      await deleteCamera(cameraId);
      reload();
    });
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader
          variant="back"
          onLeadingPress={() => router.back()}
          onBellPress={() => router.push("/notifications")}
        />
        <Text style={styles.title}>מצלמות לייב</Text>
        <Text style={styles.subtitle}>ניהול שידור חי להורים · שעות צפייה וכיבוי פרטיות</Text>

        {loading ? (
          <AppStateCard state="loading" title="טוען מצלמות" message="רגע..." />
        ) : error ? (
          <AppStateCard state="error" title="שגיאה" message="לא הצלחנו לטעון." actionLabel="נסו שוב" onActionPress={reload} />
        ) : (
          <>
            {cameras.map((camera) => (
              <AppCard key={camera.id} style={styles.cameraCard}>
                <View style={styles.cameraHeader}>
                  <Switch
                    value={camera.isEnabled}
                    onValueChange={(v) => handleToggle(camera, v)}
                    trackColor={{ true: Colors.primary, false: Colors.borderNeutral }}
                    thumbColor={Colors.white}
                  />
                  <View style={styles.cameraInfo}>
                    <Text style={styles.cameraName}>{camera.name}</Text>
                    {camera.location ? (
                      <Text style={styles.cameraMeta}>{camera.location}</Text>
                    ) : null}
                    <Text style={styles.cameraMeta}>{camera.scheduleLabel}</Text>
                    <Text style={styles.cameraMeta}>
                      {camera.isEnabled
                        ? camera.isWithinSchedule
                          ? "פעילה כעת"
                          : "מחוץ לשעות צפייה"
                        : "כבויה"}
                    </Text>
                  </View>
                  <Ionicons name="videocam-outline" size={22} color={Colors.primary} />
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => startEdit(camera)}
                    style={styles.actionTouch}
                    accessibilityRole="button"
                    accessibilityLabel={`עריכת מצלמה ${camera.name}`}
                  >
                    <Text style={styles.link}>עריכה</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(camera.id)}
                    style={styles.actionTouch}
                    accessibilityRole="button"
                    accessibilityLabel={`מחיקת מצלמה ${camera.name}`}
                  >
                    <Text style={styles.deleteLink}>מחיקה</Text>
                  </TouchableOpacity>
                </View>
              </AppCard>
            ))}

            {!showForm ? (
              <AppButton title="הוספת מצלמה" onPress={() => setShowForm(true)} />
            ) : (
              <AppCard style={styles.formCard}>
                <Text style={styles.formTitle}>{editingId ? "עריכת מצלמה" : "מצלמה חדשה"}</Text>
                <AppTextInput label="שם" value={name} onChangeText={setName} />
                <AppTextInput label="מיקום" value={location} onChangeText={setLocation} />
                <AppTextInput
                  label="כתובת HLS (שידור)"
                  value={streamUrl}
                  onChangeText={setStreamUrl}
                  placeholder="https://..."
                />
                <AppTextInput label="שעת התחלה" value={startTime} onChangeText={setStartTime} />
                <AppTextInput label="שעת סיום" value={endTime} onChangeText={setEndTime} />
                <View style={styles.formActions}>
                  <AppButton title={saving ? "שומר..." : "שמירה"} onPress={handleSave} disabled={saving} />
                  <AppButton title="ביטול" variant="secondary" onPress={resetForm} />
                </View>
              </AppCard>
            )}

            <AppCard style={styles.noteCard}>
              <Text style={styles.noteTitle}>הערה לפיילוט</Text>
              <Text style={styles.noteText}>
                הדביקו כתובת HLS מהספק (או שידור בדיקה). ההורים מקבלים קישור חתום ל-5 דקות בלבד.
                ראו docs/15-live-cameras-discovery.md
              </Text>
            </AppCard>
          </>
        )}
      </AppScreen>
      <BottomNavBar activeItem="settings" variant="teacher" onItemPress={handleBottomNavPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.pageBackground },
  screenContent: { paddingBottom: Spacing.xxl },
  title: { ...Typography.titleLarge, color: Colors.textPrimary, textAlign: "right", marginTop: Spacing.sm },
  subtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: "right", marginBottom: Spacing.lg },
  cameraCard: { marginBottom: Spacing.md, gap: Spacing.sm },
  cameraHeader: { flexDirection: "row-reverse", alignItems: "center", gap: Spacing.md },
  cameraInfo: { flex: 1, alignItems: "flex-end" },
  cameraName: { ...Typography.subtitle, fontWeight: "700", color: Colors.textPrimary },
  cameraMeta: { ...Typography.label, color: Colors.textSecondary, marginTop: 2 },
  actionsRow: { flexDirection: "row-reverse", gap: Spacing.lg },
  actionTouch: { minHeight: 44, justifyContent: "center" },
  link: { ...Typography.bodyMedium, fontWeight: "700", color: Colors.primary },
  deleteLink: { ...Typography.bodyMedium, fontWeight: "700", color: Colors.error },
  formCard: { gap: Spacing.sm, marginBottom: Spacing.lg },
  formTitle: { ...Typography.title, color: Colors.textPrimary, textAlign: "right" },
  formActions: { gap: Spacing.sm, marginTop: Spacing.sm },
  noteCard: { marginTop: Spacing.md, backgroundColor: Colors.secondary },
  noteTitle: { ...Typography.bodyMedium, fontWeight: "800", textAlign: "right", color: Colors.primary },
  noteText: { ...Typography.caption, color: Colors.textSecondary, textAlign: "right" },
});
