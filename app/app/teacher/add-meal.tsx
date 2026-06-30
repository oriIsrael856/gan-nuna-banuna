import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppTextInput } from "../../src/components/AppTextInput";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import {
  addDailyMeal,
  getDailyMeals,
  updateDailyMeal,
} from "../../src/services/dailyReports.service";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

const MEAL_TYPES: { id: string; label: string }[] = [
  { id: "breakfast", label: "בוקר" },
  { id: "lunch", label: "צהריים" },
  { id: "snack", label: "ביניים" },
];

export default function AddMealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string }>();
  const editId = params.editId;
  const isEdit = Boolean(editId);
  const handleBottomNavPress = useBottomNavPress("teacher");
  const [mealType, setMealType] = useState("breakfast");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editId) {
      return;
    }
    getDailyMeals().then((meals) => {
      const meal = meals.find((item) => item.id === editId);
      if (!meal) {
        return;
      }
      setMealType(meal.mealType);
      setTitle(meal.title);
      setTime(meal.time);
      setDescription(meal.description);
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
    if (!title.trim()) {
      Alert.alert("חסר שם", "נא להזין שם לארוחה.");
      return;
    }
    setSaving(true);
    const ok = isEdit && editId
      ? await updateDailyMeal(editId, {
          mealType,
          title: title.trim(),
          time: time.trim(),
          description: description.trim(),
        })
      : await addDailyMeal({
          mealType,
          title: title.trim(),
          time: time.trim(),
          description: description.trim(),
        });
    setSaving(false);
    if (ok) {
      Alert.alert("נשמר", isEdit ? "הארוחה עודכנה." : "הארוחה נוספה לסיכום היום.");
      handleBack();
    } else {
      Alert.alert("השמירה נכשלה", "אירעה שגיאה. נסו שוב.");
    }
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader variant="back" onLeadingPress={handleBack} onBellPress={() => router.push("/notifications")} />
        <Text style={styles.title}>{isEdit ? "עריכת ארוחה" : "הוספת ארוחה"}</Text>
        <Text style={styles.subtitle}>{isEdit ? "עדכון פרטי הארוחה" : "תיעוד ארוחה ליום"}</Text>

        <AppCard style={styles.formCard}>
          <Text style={styles.fieldLabel}>סוג ארוחה</Text>
          <View style={styles.chipsRow}>
            {MEAL_TYPES.map((item) => {
              const selected = mealType === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => setMealType(item.id)}
                  style={[styles.chip, selected && styles.chipSelected]}
                  accessibilityRole="radio"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <AppTextInput label="שם הארוחה" value={title} onChangeText={setTitle} placeholder="לדוגמה: ארוחת צהריים" />
          <AppTextInput label="שעה" value={time} onChangeText={setTime} placeholder="12:30" />
          <AppTextInput
            label="תיאור"
            value={description}
            onChangeText={setDescription}
            placeholder="מה הוגש היום..."
            multiline
          />

          <AppButton title={saving ? "שומר..." : "שמירה"} onPress={handleSave} disabled={saving} />
        </AppCard>
      </AppScreen>

      <BottomNavBar activeItem="daily" variant="teacher" onItemPress={handleBottomNavPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.pageBackground },
  screenContent: { paddingBottom: Spacing.xxl },
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
  formCard: { gap: Spacing.md },
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
  chipText: { ...Typography.captionMedium, fontWeight: "700", color: Colors.textPrimary },
  chipTextSelected: { color: Colors.white },
});
