import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { AppTextInput } from "../../src/components/AppTextInput";
import { useDaycareColors } from "../../src/daycare/DaycareBrandingContext";
import {
  MEAL_AMOUNT_OPTIONS,
  MOOD_OPTIONS,
  getChildDailyUpdate,
  saveChildDailyUpdate,
  type MealAmount,
  type Mood,
} from "../../src/services/childDailyUpdates.service";
import { getChildById } from "../../src/services/children.service";
import { showAlert } from "../../src/utils/alert";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

const TIME_PATTERN = /^([01]?\d|2[0-3]):[0-5]\d$/;

export default function TeacherChildUpdateScreen() {
  const router = useRouter();
  const colors = useDaycareColors();
  const { childId } = useLocalSearchParams<{ childId: string }>();

  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [mealBreakfast, setMealBreakfast] = useState<MealAmount | null>(null);
  const [mealLunch, setMealLunch] = useState<MealAmount | null>(null);
  const [mealSnack, setMealSnack] = useState<MealAmount | null>(null);
  const [napStart, setNapStart] = useState("");
  const [napEnd, setNapEnd] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [diaperCount, setDiaperCount] = useState<number | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!childId) {
      return;
    }
    let active = true;
    Promise.all([getChildById(childId), getChildDailyUpdate(childId)]).then(([child, update]) => {
      if (!active) {
        return;
      }
      setChildName(child?.name ?? "");
      if (update) {
        setMealBreakfast(update.mealBreakfast);
        setMealLunch(update.mealLunch);
        setMealSnack(update.mealSnack);
        setNapStart(update.napStart ?? "");
        setNapEnd(update.napEnd ?? "");
        setMood(update.mood);
        setDiaperCount(update.diaperCount);
        setNote(update.note ?? "");
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [childId]);

  function toggle<T>(current: T | null, value: T, set: (next: T | null) => void) {
    set(current === value ? null : value);
  }

  async function handleSave() {
    if (!childId) {
      return;
    }
    if (napStart.trim() && !TIME_PATTERN.test(napStart.trim())) {
      setError("שעת תחילת שינה לא תקינה (לדוגמה 12:30)");
      return;
    }
    if (napEnd.trim() && !TIME_PATTERN.test(napEnd.trim())) {
      setError("שעת סיום שינה לא תקינה (לדוגמה 14:00)");
      return;
    }

    setError("");
    setSaving(true);
    const ok = await saveChildDailyUpdate(childId, {
      mealBreakfast,
      mealLunch,
      mealSnack,
      napStart: napStart.trim() || null,
      napEnd: napEnd.trim() || null,
      mood,
      diaperCount,
      note: note.trim() || null,
    });
    setSaving(false);

    if (!ok) {
      setError("השמירה נכשלה. נסו שוב.");
      return;
    }

    showAlert("העדכון נשמר", `ההורים של ${childName} יראו את העדכון בסיכום היומי.`, [
      { text: "אישור", onPress: () => router.back() },
    ]);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppScreen scrollable contentStyle={styles.content}>
        <AppHeader
          variant="back"
          onLeadingPress={() => router.back()}
          onBellPress={() => router.push("/notifications")}
        />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {childName ? `היום של ${childName}` : "עדכון אישי"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          רק ההורים של הילד/ה רואים את העדכון הזה
        </Text>

        {loading ? (
          <AppStateCard state="loading" title="טוען" message="רגע..." />
        ) : (
          <>
            <AppCard style={styles.section}>
              <SectionTitle icon="restaurant-outline" title="ארוחות" />
              <MealRow label="בוקר" value={mealBreakfast} onChange={(v) => toggle(mealBreakfast, v, setMealBreakfast)} />
              <MealRow label="צהריים" value={mealLunch} onChange={(v) => toggle(mealLunch, v, setMealLunch)} />
              <MealRow label="ביניים" value={mealSnack} onChange={(v) => toggle(mealSnack, v, setMealSnack)} />
            </AppCard>

            <AppCard style={styles.section}>
              <SectionTitle icon="moon-outline" title="שינה" />
              <View style={styles.timeRow}>
                <AppTextInput
                  label="נרדם/ה"
                  value={napStart}
                  onChangeText={setNapStart}
                  placeholder="12:30"
                  keyboardType="numbers-and-punctuation"
                  style={styles.timeInput}
                />
                <AppTextInput
                  label="התעורר/ה"
                  value={napEnd}
                  onChangeText={setNapEnd}
                  placeholder="14:00"
                  keyboardType="numbers-and-punctuation"
                  style={styles.timeInput}
                />
              </View>
            </AppCard>

            <AppCard style={styles.section}>
              <SectionTitle icon="happy-outline" title="מצב רוח" />
              <View style={styles.chipRow}>
                {MOOD_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    label={`${option.emoji} ${option.label}`}
                    active={mood === option.value}
                    onPress={() => toggle(mood, option.value, setMood)}
                  />
                ))}
              </View>
            </AppCard>

            <AppCard style={styles.section}>
              <SectionTitle icon="water-outline" title="החתלות" />
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  onPress={() => setDiaperCount((diaperCount ?? 0) + 1)}
                  style={[styles.stepperButton, { backgroundColor: colors.secondary }]}
                  accessibilityRole="button"
                  accessibilityLabel="הוספת החתלה"
                >
                  <Ionicons name="add" size={22} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.stepperValue, { color: colors.textPrimary }]}>
                  {diaperCount ?? "–"}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setDiaperCount(diaperCount === null || diaperCount <= 0 ? null : diaperCount - 1)
                  }
                  style={[styles.stepperButton, { backgroundColor: colors.secondary }]}
                  accessibilityRole="button"
                  accessibilityLabel="הפחתת החתלה"
                >
                  <Ionicons name="remove" size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </AppCard>

            <AppCard style={styles.section}>
              <SectionTitle icon="chatbox-ellipses-outline" title="הערה להורים" />
              <AppTextInput
                value={note}
                onChangeText={(value) => setNote(value.slice(0, 400))}
                placeholder="לדוגמה: היה יום נהדר, שיחק הרבה בחצר"
                multiline
              />
            </AppCard>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.actions}>
              <AppButton title={saving ? "שומר..." : "שמירת עדכון"} onPress={handleSave} disabled={saving} />
              <AppButton title="ביטול" onPress={() => router.back()} variant="outline" />
            </View>
          </>
        )}
      </AppScreen>
    </View>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function MealRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: MealAmount | null;
  onChange: (value: MealAmount) => void;
}) {
  return (
    <View style={styles.mealRow}>
      <Text style={styles.mealLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {MEAL_AMOUNT_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            active={value === option.value}
            onPress={() => onChange(option.value)}
            compact
          />
        ))}
      </View>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
  compact,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.chip, compact && styles.chipCompact, active && styles.chipActive]}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: Spacing.md, paddingBottom: Spacing.xxl },
  title: {
    ...Typography.titleLarge,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  subtitle: {
    ...Typography.caption,
    textAlign: "right",
    marginTop: -Spacing.sm,
  },
  section: { gap: Spacing.sm },
  sectionTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.subtitle,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  mealRow: { gap: 6 },
  mealLabel: {
    ...Typography.captionMedium,
    fontWeight: "700",
    color: Colors.textSecondary,
    textAlign: "right",
  },
  chipRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  chipCompact: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary,
  },
  chipText: {
    ...Typography.captionMedium,
    color: Colors.textPrimary,
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  timeRow: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
  },
  timeInput: { flex: 1 },
  stepperRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: {
    fontSize: 28,
    fontWeight: "800",
    minWidth: 40,
    textAlign: "center",
  },
  errorText: {
    ...Typography.body,
    color: Colors.errorStrong,
    textAlign: "right",
  },
  actions: { gap: Spacing.sm },
});
