import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

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
  createEventSuggestion,
  deleteEventSuggestion,
  getEventSuggestions,
  SUGGESTION_TYPES,
} from "../../src/services/eventSuggestions.service";
import { confirmDelete } from "../../src/utils/confirm";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

export default function TeacherEventSuggestionsScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const { data, loading, error, reload } = useAsyncData(() => getEventSuggestions(), []);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [suggestionType, setSuggestionType] = useState<string>(SUGGESTION_TYPES[0].id);
  const [requiresRsvp, setRequiresRsvp] = useState(false);
  const [notifyParents, setNotifyParents] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!title.trim() || !body.trim()) {
      Alert.alert("חסר מידע", "יש למלא כותרת ותוכן.");
      return;
    }

    setSaving(true);
    const ok = await createEventSuggestion({
      title,
      body,
      suggestionType,
      eventDate: eventDate || undefined,
      requiresRsvp,
      notifyParents,
    });
    setSaving(false);

    if (ok) {
      setShowForm(false);
      setTitle("");
      setBody("");
      setEventDate("");
      reload();
      Alert.alert("נשלח", notifyParents ? "ההצעה נשלחה להורים עם התראה." : "ההצעה נשמרה.");
    } else {
      Alert.alert("שגיאה", "לא הצלחנו לשמור.");
    }
  }

  function handleDelete(id: string) {
    confirmDelete("למחוק את ההצעה?", async () => {
      await deleteEventSuggestion(id);
      reload();
    });
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader variant="back" onLeadingPress={() => router.back()} onBellPress={() => router.push("/notifications")} />
        <Text style={styles.title}>הצעות לאירועים</Text>
        <Text style={styles.subtitle}>שליחת רעיונות והזמנות מיוחדות להורים</Text>

        {loading ? (
          <AppStateCard state="loading" title="טוען" message="רגע..." />
        ) : error ? (
          <AppStateCard state="error" title="שגיאה" message="לא הצלחנו לטעון." actionLabel="נסו שוב" onActionPress={reload} />
        ) : (
          <>
            {(data ?? []).map((item) => (
              <AppCard key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={styles.actionTouch}
                    accessibilityRole="button"
                    accessibilityLabel={`מחיקת הצעה ${item.title}`}
                  >
                    <Text style={styles.deleteLink}>מחיקה</Text>
                  </TouchableOpacity>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemBody} numberOfLines={3}>{item.body}</Text>
                    {item.requiresRsvp ? (
                      <Text style={styles.rsvpMeta}>
                        מגיעים: {item.attendingCount} · לא מגיעים: {item.notAttendingCount}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </AppCard>
            ))}

            {!showForm ? (
              <AppButton title="הצעה חדשה להורים" onPress={() => setShowForm(true)} />
            ) : (
              <AppCard style={styles.formCard}>
                <AppTextInput label="כותרת" value={title} onChangeText={setTitle} />
                <AppTextInput label="תוכן" value={body} onChangeText={setBody} multiline />
                <AppTextInput label="תאריך (YYYY-MM-DD)" value={eventDate} onChangeText={setEventDate} />
                <Text style={styles.fieldLabel}>סוג</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
                  {SUGGESTION_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.typeChip, suggestionType === t.id && styles.typeChipActive]}
                      onPress={() => setSuggestionType(t.id)}
                      accessibilityRole="radio"
                      accessibilityLabel={t.label}
                      accessibilityState={{ selected: suggestionType === t.id }}
                    >
                      <Text style={[styles.typeChipText, suggestionType === t.id && styles.typeChipTextActive]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.switchRow}>
                  <Switch value={requiresRsvp} onValueChange={setRequiresRsvp} trackColor={{ true: Colors.primary, false: Colors.borderNeutral }} thumbColor={Colors.white} />
                  <Text style={styles.switchLabel}>דרוש אישור הגעה (RSVP)</Text>
                </View>
                <View style={styles.switchRow}>
                  <Switch value={notifyParents} onValueChange={setNotifyParents} trackColor={{ true: Colors.primary, false: Colors.borderNeutral }} thumbColor={Colors.white} />
                  <Text style={styles.switchLabel}>שליחת התראה להורים</Text>
                </View>
                <AppButton title={saving ? "שולח..." : "שליחה"} onPress={handleCreate} disabled={saving} />
                <AppButton title="ביטול" variant="secondary" onPress={() => setShowForm(false)} />
              </AppCard>
            )}
          </>
        )}
      </AppScreen>
      <BottomNavBar activeItem="home" variant="teacher" onItemPress={handleBottomNavPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.pageBackground },
  screenContent: { paddingBottom: Spacing.xxl },
  title: { ...Typography.titleLarge, color: Colors.textPrimary, textAlign: "right", marginTop: Spacing.sm },
  subtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: "right", marginBottom: Spacing.lg },
  itemCard: { marginBottom: Spacing.sm },
  itemHeader: { flexDirection: "row-reverse", gap: Spacing.md },
  itemInfo: { flex: 1, alignItems: "flex-end" },
  itemTitle: { ...Typography.subtitle, fontWeight: "700", color: Colors.textPrimary },
  itemBody: { ...Typography.caption, color: Colors.textSecondary, marginTop: 4, textAlign: "right" },
  rsvpMeta: { ...Typography.labelBold, color: Colors.primary, marginTop: 6 },
  deleteLink: { ...Typography.bodyMedium, fontWeight: "700", color: Colors.error },
  actionTouch: { minHeight: 44, justifyContent: "center" },
  formCard: { gap: Spacing.sm, marginTop: Spacing.md },
  fieldLabel: { ...Typography.bodyMedium, fontWeight: "700", textAlign: "right", color: Colors.textPrimary },
  typeRow: { flexDirection: "row-reverse", gap: Spacing.sm },
  typeChip: { minHeight: 44, justifyContent: "center", paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, backgroundColor: Colors.secondary },
  typeChipActive: { backgroundColor: Colors.primary },
  typeChipText: { ...Typography.captionMedium, color: Colors.textPrimary },
  typeChipTextActive: { color: Colors.white, fontWeight: "700" },
  switchRow: { flexDirection: "row-reverse", alignItems: "center", gap: Spacing.md },
  switchLabel: { ...Typography.bodyMedium, flex: 1, fontWeight: "700", textAlign: "right", color: Colors.textPrimary },
});
