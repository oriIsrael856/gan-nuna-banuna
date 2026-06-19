import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppTextInput } from "../../src/components/AppTextInput";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { HeroBanner } from "../../src/components/HeroBanner";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getChildren } from "../../src/services/children.service";
import { createContract } from "../../src/services/contracts.service";
import { Colors } from "../../src/theme/colors";
import { Heroes } from "../../src/theme/heroes";
import { heroOverlayTextStyles } from "../../src/theme/heroOverlay";
import { BorderRadius, Spacing } from "../../src/theme/spacing";

const CONTRACT_TYPES = ["חוזה הרשמה", "חידוש חוזה", "אישור מיוחד", "נספח לחוזה"];
const STEPS = ["פרטי חוזה", "בחירת הורה", "תצוגה מקדימה", "שליחה"];

export default function UploadContractScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const { data } = useAsyncData(() => getChildren(), []);
  const children = data ?? [];
  const [currentStep, setCurrentStep] = useState(0);
  const [contractName, setContractName] = useState("");
  const [contractType, setContractType] = useState(CONTRACT_TYPES[0]);
  const [contractDate, setContractDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | undefined>(undefined);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedChild = children.find((child) => child.id === selectedChildId);
  const selectedGuardian =
    selectedChild?.guardians?.find((guardian) => guardian.isPrimaryContact) ??
    selectedChild?.guardians?.[0];

  function handleCancel() {
    router.push("/teacher/contracts");
  }

  async function handleChooseFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    setFileName(asset.name || "contract.pdf");
    setFileUri(asset.uri);
    setFileMimeType(asset.mimeType ?? "application/pdf");
    setErrorMessage("");
  }

  function handleBackStep() {
    setErrorMessage("");
    if (currentStep === 0) {
      handleCancel();
      return;
    }
    setCurrentStep((step) => step - 1);
  }

  async function handleContinue() {
    if (currentStep === 0) {
      if (!contractName.trim()) {
        setErrorMessage("יש להזין שם חוזה");
        return;
      }
      if (!contractType.trim()) {
        setErrorMessage("יש לבחור סוג חוזה");
        return;
      }
      if (!contractDate.trim()) {
        setErrorMessage("יש לבחור תאריך חוזה");
        return;
      }
      if (!fileName.trim()) {
        setErrorMessage("יש לצרף קובץ PDF");
        return;
      }
      setErrorMessage("");
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      if (!selectedChildId) {
        setErrorMessage("יש לבחור ילד/ה לשליחת החוזה");
        return;
      }
      setErrorMessage("");
      setCurrentStep(2);
      return;
    }

    if (!selectedChildId) {
      setErrorMessage("יש לבחור ילד/ה לשליחת החוזה");
      return;
    }

    setErrorMessage("");
    setSaving(true);
    const ok = await createContract({
      childId: selectedChildId,
      fileName: fileName || `${contractName}.pdf`,
      expiryDate: expiryDate.trim() || undefined,
      fileUri: fileUri ?? undefined,
      mimeType: fileMimeType,
    });
    setSaving(false);

    if (!ok) {
      setErrorMessage("שליחת החוזה נכשלה. נסו שוב.");
      return;
    }

    setCurrentStep(3);
    Alert.alert(
      "החוזה נשלח",
      `החוזה "${contractName}" נשלח אל ${selectedGuardian?.fullName ?? "ההורה"} לחתימה דיגיטלית.`,
      [{ text: "סגירה", onPress: () => router.push("/teacher/contracts") }],
    );
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable noPadding contentStyle={styles.screenContent}>
        <HeroBanner source={Heroes.uploadContract} height={210}>
          <View style={styles.headerOverlay}>
            <AppHeader variant="back" onLeadingPress={handleCancel} onBellPress={() => router.push("/notifications")} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={heroOverlayTextStyles.title}>העלאת חוזה חדש</Text>
            <Text style={heroOverlayTextStyles.subtitle}>העלאת חוזה ושליחה להורה לחתימה</Text>
          </View>
        </HeroBanner>

        <View style={styles.body}>
        <AppCard style={styles.stepperCard}>
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isDone = index < currentStep;

            return (
              <View key={step} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepNumber,
                    (isActive || isDone) && styles.stepNumberActive,
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                  ) : (
                    <Text
                      style={[styles.stepNumberText, isActive && styles.stepNumberTextActive]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{step}</Text>
              </View>
            );
          })}
        </AppCard>

        {currentStep === 0 ? (
        <>
        <AppCard style={styles.formCard}>
          <Text style={styles.sectionTitle}>פרטי חוזה</Text>

          <AppTextInput
            label="שם החוזה *"
            value={contractName}
            onChangeText={setContractName}
            placeholder="לדוגמה: חוזה הרשמה לשנת 2025-2026"
          />

          <Text style={styles.fieldLabel}>סוג החוזה *</Text>
          <View style={styles.typeGrid}>
            {CONTRACT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                activeOpacity={0.75}
                onPress={() => setContractType(type)}
                style={[styles.typeChip, contractType === type && styles.typeChipActive]}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    contractType === type && styles.typeChipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <AppTextInput
            label="תאריך החוזה *"
            value={contractDate}
            onChangeText={setContractDate}
            placeholder="בחר תאריך"
          />

          <AppTextInput
            label="תאריך תפוגה (אופציונלי)"
            value={expiryDate}
            onChangeText={setExpiryDate}
            placeholder="בחר תאריך תפוגה"
          />

          <AppTextInput
            label="הערות (אופציונלי)"
            value={notes}
            onChangeText={setNotes}
            placeholder="הוסף הערות או מידע נוסף הקשור לחוזה..."
            multiline
          />
        </AppCard>

        <AppCard style={styles.formCard}>
          <Text style={styles.sectionTitle}>קובץ החוזה</Text>

          <TouchableOpacity activeOpacity={0.75} onPress={handleChooseFile} style={styles.uploadBox}>
            <Ionicons name="cloud-upload-outline" size={34} color={Colors.primary} />
            <Text style={styles.uploadTitle}>
              {fileName ? fileName : "גרור קובץ לכאן או לחץ לבחירה"}
            </Text>
            <Text style={styles.uploadText}>PDF בלבד, עד 10MB</Text>
          </TouchableOpacity>

          <View style={styles.securityNotice}>
            <Text style={styles.securityText}>
              הקובץ יישמר בצורה מאובטחת. ההורה יוכל לצפות ולחתום דיגיטלית.
            </Text>
          </View>
        </AppCard>
        </>
        ) : null}

        {currentStep === 1 ? (
          <AppCard style={styles.formCard}>
            <Text style={styles.sectionTitle}>בחירת הורה</Text>
            <Text style={styles.helperText}>בחר/י את הילד/ה שאליו ישויך החוזה</Text>

            {children.map((child) => {
              const selected = selectedChildId === child.id;
              const guardian =
                child.guardians?.find((item) => item.isPrimaryContact) ??
                child.guardians?.[0];

              return (
                <TouchableOpacity
                  key={child.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedChildId(child.id)}
                  style={[styles.childRow, selected && styles.childRowActive]}
                >
                  <View
                    style={[styles.radio, selected && styles.radioActive]}
                  >
                    {selected ? (
                      <Ionicons name="checkmark" size={14} color={Colors.white} />
                    ) : null}
                  </View>
                  <View style={styles.childRowInfo}>
                    <Text style={styles.childRowName}>{child.name}</Text>
                    <Text style={styles.childRowMeta}>
                      {guardian ? `${guardian.relationshipType}: ${guardian.fullName}` : child.age}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </AppCard>
        ) : null}

        {currentStep >= 2 ? (
          <AppCard style={styles.formCard}>
            <Text style={styles.sectionTitle}>תצוגה מקדימה</Text>
            <PreviewRow label="שם החוזה" value={contractName} />
            <PreviewRow label="סוג" value={contractType} />
            <PreviewRow label="תאריך" value={contractDate} />
            {expiryDate ? <PreviewRow label="תוקף" value={expiryDate} /> : null}
            <PreviewRow label="קובץ" value={fileName} />
            <PreviewRow label="ילד/ה" value={selectedChild?.name ?? "-"} />
            <PreviewRow label="נמען" value={selectedGuardian?.fullName ?? "-"} />
            {notes ? <PreviewRow label="הערות" value={notes} /> : null}

            <View style={styles.securityNotice}>
              <Text style={styles.securityText}>
                בלחיצה על שליחה, החוזה יישלח להורה לחתימה דיגיטלית.
              </Text>
            </View>
          </AppCard>
        ) : null}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.actions}>
          <AppButton
            title={
              currentStep === 2 ? (saving ? "שולח..." : "שליחה לחתימה") : "המשך"
            }
            onPress={handleContinue}
            disabled={saving}
          />
          <AppButton title="חזרה" onPress={handleBackStep} variant="outline" />
        </View>
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

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewValue}>{value}</Text>
      <Text style={styles.previewLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContent: {
    paddingBottom: Spacing.xxl,
  },
  headerOverlay: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  titleBlock: {
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "700",
    marginTop: 2,
    textAlign: "center",
  },
  body: {
    paddingHorizontal: Spacing.md,
    marginTop: -Spacing.xl,
    gap: Spacing.lg,
  },
  stepperCard: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  stepNumberActive: {
    backgroundColor: Colors.primary,
  },
  stepNumberText: {
    color: Colors.textSecondary,
    fontWeight: "800",
  },
  stepNumberTextActive: {
    color: Colors.white,
  },
  stepLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: "800",
  },
  formCard: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  typeGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  typeChip: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
  },
  typeChipText: {
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  typeChipTextActive: {
    color: Colors.white,
  },
  uploadBox: {
    minHeight: 132,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
  uploadTitle: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: "800",
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  uploadText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
    textAlign: "center",
  },
  securityNotice: {
    backgroundColor: Colors.presentBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  securityText: {
    color: Colors.presentText,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "right",
    fontWeight: "700",
  },
  errorText: {
    color: Colors.error,
    fontWeight: "700",
    textAlign: "right",
  },
  actions: {
    gap: Spacing.sm,
  },
  helperText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  childRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E8DDD2",
  },
  childRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.presentBackground,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: "#D8D8D8",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  childRowInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  childRowName: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  childRowMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
  },
  previewRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  previewLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "left",
  },
});
