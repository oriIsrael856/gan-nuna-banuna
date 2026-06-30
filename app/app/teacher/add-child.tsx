import React, { useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppTextInput } from "../../src/components/AppTextInput";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import {
  addChild,
  getChildById,
  updateChild,
  updateGuardian,
} from "../../src/services/children.service";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";
import { isBlank, isValidEmail, isValidPhone } from "../../src/utils/validation";

type Gender = "male" | "female";

const RELATIONSHIP_OPTIONS = ["אמא", "אבא", "סבתא", "סבא", "אפוטרופוס", "אחר"];

export default function AddChildScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string }>();
  const editId = params.editId;
  const isEdit = Boolean(editId);
  const handleBottomNavPress = useBottomNavPress("teacher");
  const [childName, setChildName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<Gender>("male");
  const [relationshipType, setRelationshipType] = useState("אמא");
  const [parentFullName, setParentFullName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [guardianId, setGuardianId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editId) {
      return;
    }
    let active = true;
    getChildById(editId).then((child) => {
      if (!active || !child) {
        return;
      }
      setChildName(child.name);
      setBirthDate(child.birthDate ?? "");
      setGender(child.gender === "female" ? "female" : "male");
      setNotes(child.notes ?? "");
      const primary = child.guardians?.find((g) => g.isPrimaryContact) ?? child.guardians?.[0];
      if (primary) {
        setGuardianId(primary.id);
        setParentFullName(primary.fullName);
        setParentPhone(primary.phone ?? "");
        setParentEmail(primary.email ?? "");
        setRelationshipType(primary.relationshipType);
      }
    });
    return () => {
      active = false;
    };
  }, [editId]);

  function handleCancel() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push("/teacher/children");
  }

  async function handleSave() {
    if (isBlank(childName)) {
      setErrorMessage("יש להזין את שם הילד");
      return;
    }

    if (isBlank(birthDate)) {
      setErrorMessage("יש לבחור תאריך לידה");
      return;
    }

    if (isBlank(relationshipType)) {
      setErrorMessage("יש לבחור סוג קשר");
      return;
    }

    if (isBlank(parentFullName)) {
      setErrorMessage("יש להזין שם הורה / אפוטרופוס");
      return;
    }

    if (isBlank(parentPhone)) {
      setErrorMessage("יש להזין מספר טלפון");
      return;
    }

    if (!isValidPhone(parentPhone)) {
      setErrorMessage("יש להזין מספר טלפון תקין");
      return;
    }

    if (!isValidEmail(parentEmail)) {
      setErrorMessage("יש להזין כתובת אימייל תקינה או להשאיר את השדה ריק");
      return;
    }

    setErrorMessage("");
    setSaving(true);

    if (isEdit && editId) {
      const ok = await updateChild(editId, {
        fullName: childName.trim(),
        birthDate: birthDate.trim() || null,
        gender,
        notes: notes.trim() || null,
      });
      if (ok && guardianId) {
        await updateGuardian(guardianId, {
          fullName: parentFullName.trim(),
          phone: parentPhone.trim() || null,
          email: parentEmail.trim() || null,
          relationshipType,
        });
      }
      setSaving(false);
      if (ok) {
        Alert.alert("הפרטים עודכנו", "הפרטים נשמרו.", [
          { text: "אישור", onPress: () => router.push("/teacher/children") },
        ]);
      } else {
        setErrorMessage("שמירה נכשלה. נסו שוב.");
      }
      return;
    }

    const result = await addChild({
      fullName: childName.trim(),
      birthDate: birthDate.trim() || undefined,
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
      setErrorMessage("שמירה נכשלה. נסו שוב.");
      return;
    }

    let message = "הילד נוסף בהצלחה.";
    if (result.invite?.status === "invited") {
      message = `הילד נוסף והזמנה נשלחה להורה ב-${parentEmail.trim()}.`;
    } else if (result.invite?.status === "already_exists") {
      message = `הילד נוסף וההורה כבר קיים במערכת — חובר לחשבון ${parentEmail.trim()}.`;
    } else if (result.invite?.status === "failed") {
      message = `הילד נוסף, אך שליחת ההזמנה נכשלה: ${result.invite.error ?? "שגיאה"}.`;
    }

    Alert.alert("נשמר בהצלחה", message, [
      { text: "אישור", onPress: () => router.push("/teacher/children") },
    ]);
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader variant="back" onLeadingPress={handleCancel} onBellPress={() => router.push("/notifications")} />
        <Text style={styles.title}>{isEdit ? "עריכת ילד" : "הוספת ילד"}</Text>

        <AppCard style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>מידע רגיש</Text>
          <Text style={styles.noticeText}>
            כל המידע יישמר בצורה מאובטחת וישמש לצרכי ניהול ותיעוד בגן.
          </Text>
        </AppCard>

        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>פרטי הילד</Text>

          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera-outline" size={28} color={Colors.primary} />
            <Text style={styles.photoText}>הוספת תמונה</Text>
            <Text style={styles.photoSubtext}>בקרוב</Text>
          </View>

          <AppTextInput
            label="שם הילד *"
            value={childName}
            onChangeText={setChildName}
            placeholder="הזן שם הילד"
          />

          <Text style={styles.fieldLabel}>תאריך לידה *</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel={birthDate ? `תאריך לידה: ${birthDate}` : "בחירת תאריך לידה"}
          >
            <Text style={styles.dateButtonText}>
              {birthDate || "בחר תאריך לידה"}
            </Text>
          </TouchableOpacity>
          {showDatePicker ? (
            <DateTimePicker
              value={birthDate ? new Date(birthDate) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={(_event, date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (date) {
                  setBirthDate(date.toISOString().slice(0, 10));
                }
              }}
            />
          ) : null}

          <Text style={styles.fieldLabel}>מין</Text>
          <View style={styles.optionRow}>
            <OptionChip
              label="זכר"
              active={gender === "male"}
              onPress={() => setGender("male")}
            />
            <OptionChip
              label="נקבה"
              active={gender === "female"}
              onPress={() => setGender("female")}
            />
          </View>
        </AppCard>

        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>פרטי הורה / אפוטרופוס</Text>

          <Text style={styles.fieldLabel}>סוג קשר *</Text>
          <View style={styles.relationshipGrid}>
            {RELATIONSHIP_OPTIONS.map((option) => (
              <OptionChip
                key={option}
                label={option}
                active={relationshipType === option}
                onPress={() => setRelationshipType(option)}
              />
            ))}
          </View>

          <AppTextInput
            label="שם מלא *"
            value={parentFullName}
            onChangeText={setParentFullName}
            placeholder="הזן שם מלא"
          />

          <AppTextInput
            label="טלפון *"
            value={parentPhone}
            onChangeText={setParentPhone}
            placeholder="הזן מספר טלפון"
            keyboardType="phone-pad"
          />

          <AppTextInput
            label="אימייל"
            value={parentEmail}
            onChangeText={setParentEmail}
            placeholder="הזן כתובת אימייל"
            keyboardType="email-address"
          />
        </AppCard>

        <AppCard style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>מידע נוסף</Text>
            <Text style={styles.counterText}>{notes.length}/300</Text>
          </View>

          <AppTextInput
            label="הערות חשובות"
            value={notes}
            onChangeText={(value) => setNotes(value.slice(0, 300))}
            placeholder="לדוגמה: רגישויות, אלרגיות, מידע רפואי חשוב וכו'"
            multiline
          />
        </AppCard>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.actions}>
          <AppButton title={saving ? "שומר..." : "שמירה"} onPress={handleSave} disabled={saving} />
          <AppButton title="ביטול" onPress={handleCancel} variant="outline" />
        </View>
      </AppScreen>

      <BottomNavBar
        activeItem="home"
        variant="teacher"
        onItemPress={handleBottomNavPress}
      />
    </View>
  );
}

function OptionChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.optionChip, active ? styles.optionChipActive : undefined]}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.optionText, active ? styles.optionTextActive : undefined]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
  },
  screenContent: {
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  title: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
    textAlign: "right",
  },
  noticeCard: {
    backgroundColor: Colors.secondary,
  },
  noticeTitle: {
    ...Typography.bodyMedium,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  noticeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "right",
  },
  sectionCard: {
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    textAlign: "right",
  },
  sectionHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  photoPlaceholder: {
    alignSelf: "center",
    width: 116,
    height: 116,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  photoText: {
    ...Typography.captionMedium,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 4,
  },
  photoSubtext: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  fieldLabel: {
    ...Typography.bodyMedium,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  dateButton: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  dateButtonText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: "right",
  },
  optionRow: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
  },
  relationshipGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  optionChip: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  optionChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    ...Typography.bodyMedium,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  optionTextActive: {
    color: Colors.white,
  },
  errorText: {
    color: Colors.error,
    fontWeight: "700",
    textAlign: "right",
  },
  actions: {
    gap: Spacing.sm,
  },
});
