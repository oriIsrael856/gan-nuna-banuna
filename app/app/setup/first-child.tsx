import React, { useState } from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

import { AppCard } from "../../src/components/AppCard";
import { AppTextInput } from "../../src/components/AppTextInput";
import { SetupStepLayout } from "../../src/components/SetupStepLayout";
import { useDaycareColors } from "../../src/daycare/DaycareBrandingContext";
import { addChild } from "../../src/services/children.service";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";
import { isBlank, isValidEmail, isValidPhone } from "../../src/utils/validation";

const TOTAL_STEPS = 6;
const RELATIONSHIP_OPTIONS = ["אמא", "אבא", "סבתא", "סבא", "אפוטרופוס", "אחר"];

type Gender = "male" | "female";

export default function SetupFirstChildScreen() {
  const router = useRouter();
  const colors = useDaycareColors();
  const [childName, setChildName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<Gender>("male");
  const [relationshipType, setRelationshipType] = useState("אמא");
  const [parentFullName, setParentFullName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveAndContinue() {
    if (isBlank(childName) || isBlank(parentFullName)) {
      Alert.alert("שדות חסרים", "יש למלא שם ילד ושם הורה.");
      return;
    }
    if (parentPhone && !isValidPhone(parentPhone)) {
      Alert.alert("טלפון לא תקין", "בדקו את מספר הטלפון.");
      return;
    }
    if (parentEmail && !isValidEmail(parentEmail)) {
      Alert.alert("אימייל לא תקין", "בדקו את כתובת האימייל.");
      return;
    }

    setSaving(true);
    const result = await addChild({
      fullName: childName.trim(),
      birthDate: birthDate || undefined,
      gender,
      notes: notes.trim() || undefined,
      guardians: [
        {
          fullName: parentFullName.trim(),
          phone: parentPhone.trim() || undefined,
          email: parentEmail.trim() || undefined,
          relationshipType,
          isPrimaryContact: true,
        },
      ],
    });
    setSaving(false);

    if (!result.ok) {
      Alert.alert("שגיאה", "לא הצלחנו לשמור את הילד.");
      return;
    }

    if (result.invite?.status === "failed") {
      Alert.alert("הילד נשמר", "הזמנת ההורה נכשלה — אפשר לנסות שוב מניהול הגן.");
    }

    router.push("/setup/first-contract" as Href);
  }

  return (
    <SetupStepLayout
      step={4}
      totalSteps={TOTAL_STEPS}
      title="ילד ו הורה ראשונים"
      subtitle="הוסיפי לפחות ילד אחד והורה — אפשר להוסיף עוד אחר כך"
      onBack={() => router.back()}
      onSkip={() => router.push("/setup/first-contract" as Href)}
      onNext={saveAndContinue}
      loading={saving}
    >
      <AppCard>
        <AppTextInput label="שם הילד/ה" value={childName} onChangeText={setChildName} />
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.dateBtn}
          accessibilityRole="button"
          accessibilityLabel={birthDate ? `תאריך לידה: ${birthDate}` : "בחירת תאריך לידה"}
        >
          <Text style={[styles.dateText, { color: colors.textPrimary }]}>
            {birthDate ? `תאריך לידה: ${birthDate}` : "בחירת תאריך לידה (אופציונלי)"}
          </Text>
        </TouchableOpacity>
        {showDatePicker ? (
          <DateTimePicker
            value={birthDate ? new Date(birthDate) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, date) => {
              setShowDatePicker(Platform.OS === "ios");
              if (date) {
                setBirthDate(date.toISOString().slice(0, 10));
              }
            }}
          />
        ) : null}
        <View style={styles.chipsRow}>
          {(["male", "female"] as Gender[]).map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setGender(value)}
              style={[
                styles.chip,
                gender === value && { backgroundColor: colors.primary },
              ]}
              accessibilityRole="radio"
              accessibilityLabel={value === "male" ? "בן" : "בת"}
              accessibilityState={{ selected: gender === value }}
            >
              <Text style={[styles.chipText, gender === value && { color: Colors.white }]}>
                {value === "male" ? "בן" : "בת"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <AppTextInput label="הערות (אלרגיות וכו')" value={notes} onChangeText={setNotes} multiline />
      </AppCard>

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>הורה / אפוטרופוס</Text>
        <View style={styles.chipsRow}>
          {RELATIONSHIP_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => setRelationshipType(option)}
              style={[
                styles.chip,
                relationshipType === option && { backgroundColor: colors.secondary },
              ]}
              accessibilityRole="radio"
              accessibilityLabel={option}
              accessibilityState={{ selected: relationshipType === option }}
            >
              <Text style={styles.chipText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <AppTextInput label="שם מלא" value={parentFullName} onChangeText={setParentFullName} />
        <AppTextInput
          label="טלפון"
          value={parentPhone}
          onChangeText={setParentPhone}
          keyboardType="phone-pad"
        />
        <AppTextInput
          label="אימייל (להזמנה לאפליקציה)"
          value={parentEmail}
          onChangeText={setParentEmail}
          keyboardType="email-address"
        />
      </AppCard>
    </SetupStepLayout>
  );
}

const styles = StyleSheet.create({
  dateBtn: {
    paddingVertical: Spacing.sm,
  },
  dateText: {
    ...Typography.bodyMedium,
    textAlign: "right",
  },
  chipsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.divider,
  },
  chipText: {
    ...Typography.bodyMedium,
    fontWeight: "600",
  },
  sectionTitle: {
    ...Typography.subtitle,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: Spacing.xs,
  },
});
