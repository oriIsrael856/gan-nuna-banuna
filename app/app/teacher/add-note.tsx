import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppTextInput } from "../../src/components/AppTextInput";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getChildren } from "../../src/services/children.service";
import { addDailyNote, getDailyNotes, updateDailyNote } from "../../src/services/dailyReports.service";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

const NOTE_TYPES: { id: string; label: string }[] = [
  { id: "general", label: "כללי" },
  { id: "health", label: "בריאות" },
  { id: "behavior", label: "התנהגות" },
  { id: "sleep", label: "שינה" },
];

export default function AddNoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string }>();
  const editId = params.editId;
  const isEdit = Boolean(editId);
  const handleBottomNavPress = useBottomNavPress("teacher");
  const { data } = useAsyncData(() => getChildren(), []);
  const children = data ?? [];
  const [childId, setChildId] = useState<string | null>(null);
  const [noteType, setNoteType] = useState("general");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editId) {
      return;
    }
    getDailyNotes().then((notes) => {
      const note = notes.find((item) => item.id === editId);
      if (!note) {
        return;
      }
      setChildId(note.childId ?? null);
      setNoteType(note.type);
      setText(note.text);
    });
  }, [editId]);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push("/teacher/daily-report");
  }

  async function handleSave() {
    if (!text.trim()) {
      Alert.alert("חסר תוכן", "נא לכתוב את ההערה.");
      return;
    }
    setSaving(true);
    const ok = isEdit && editId
      ? await updateDailyNote(editId, { childId, noteType, text: text.trim() })
      : await addDailyNote({ childId, noteType, text: text.trim() });
    setSaving(false);
    if (ok) {
      Alert.alert("נשמר", isEdit ? "ההערה עודכנה." : "ההערה נוספה לסיכום היום.");
      handleBack();
    } else {
      Alert.alert("השמירה נכשלה", "אירעה שגיאה. נסו שוב.");
    }
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader
          variant="back"
          notificationCount={0}
          onLeadingPress={handleBack}
          onBellPress={() => router.push("/notifications")}
        />
        <Text style={styles.title}>{isEdit ? "עריכת הערה" : "הוספת הערה"}</Text>
        <Text style={styles.subtitle}>{isEdit ? "עדכון ההערה היומית" : "הערה יומית לילד/ה או כללית"}</Text>

        <AppCard style={styles.formCard}>
          <Text style={styles.fieldLabel}>ילד/ה</Text>
          <View style={styles.chipsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setChildId(null)}
              style={[styles.chip, childId === null && styles.chipSelected]}
              accessibilityRole="radio"
              accessibilityLabel="כללי"
              accessibilityState={{ selected: childId === null }}
            >
              <Text style={[styles.chipText, childId === null && styles.chipTextSelected]}>
                כללי
              </Text>
            </TouchableOpacity>
            {children.map((child) => {
              const selected = childId === child.id;
              return (
                <TouchableOpacity
                  key={child.id}
                  activeOpacity={0.8}
                  onPress={() => setChildId(child.id)}
                  style={[styles.chip, selected && styles.chipSelected]}
                  accessibilityRole="radio"
                  accessibilityLabel={child.name}
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {child.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>סוג הערה</Text>
          <View style={styles.chipsRow}>
            {NOTE_TYPES.map((item) => {
              const selected = noteType === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => setNoteType(item.id)}
                  style={[styles.chip, selected && styles.chipSelected]}
                  accessibilityRole="radio"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <AppTextInput
            label="תוכן ההערה"
            value={text}
            onChangeText={setText}
            placeholder="כתוב/כתבי את ההערה כאן..."
            multiline
          />

          <AppButton
            title={saving ? "שומר..." : "שמירה"}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
          />
        </AppCard>
      </AppScreen>

      <BottomNavBar activeItem="daily" variant="teacher" onItemPress={handleBottomNavPress} />
    </View>
  );
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
    marginBottom: Spacing.lg,
  },
  formCard: {
    gap: Spacing.md,
  },
  fieldLabel: {
    ...Typography.bodyMedium,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  chipsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.captionMedium,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  saveButton: {
    marginTop: Spacing.sm,
  },
});
