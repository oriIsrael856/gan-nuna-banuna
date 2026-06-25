import React, { useCallback, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { AppButton } from "./AppButton";
import { AppCard } from "./AppCard";
import { useDaycareColors } from "../daycare/DaycareBrandingContext";
import { deleteHeroImage, uploadHeroImage } from "../services/daycareSetup.service";
import { BorderRadius, Spacing } from "../theme/spacing";
import { HERO_KEYS, HERO_LABELS, type HeroKey } from "../types/daycareBranding";

interface HeroImageEditorProps {
  heroUrls: Partial<Record<HeroKey, string>>;
  onChanged: () => void;
  compact?: boolean;
}

export function HeroImageEditor({ heroUrls, onChanged, compact }: HeroImageEditorProps) {
  const colors = useDaycareColors();
  const [uploadingKey, setUploadingKey] = useState<HeroKey | null>(null);

  const keys = compact ? (["login", "parentHome", "teacherHome"] as HeroKey[]) : [...HERO_KEYS];

  const pickAndUpload = useCallback(
    async (heroKey: HeroKey) => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("הרשאה נדרשת", "יש לאשר גישה לגלריה.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      setUploadingKey(heroKey);
      const ok = await uploadHeroImage(heroKey, result.assets[0].uri, result.assets[0].mimeType);
      setUploadingKey(null);

      if (!ok) {
        Alert.alert("שגיאה", "לא הצלחנו להעלות את התמונה.");
        return;
      }

      onChanged();
    },
    [onChanged],
  );

  const handleDelete = useCallback(
    (heroKey: HeroKey) => {
      Alert.alert("מחיקת תמונה", `להסיר את ${HERO_LABELS[heroKey]}?`, [
        { text: "ביטול", style: "cancel" },
        {
          text: "מחיקה",
          style: "destructive",
          onPress: async () => {
            const ok = await deleteHeroImage(heroKey);
            if (!ok) {
              Alert.alert("שגיאה", "לא הצלחנו למחוק את התמונה.");
              return;
            }
            onChanged();
          },
        },
      ]);
    },
    [onChanged],
  );

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {keys.map((key) => {
        const url = heroUrls[key];
        const busy = uploadingKey === key;
        return (
          <AppCard key={key} style={styles.card}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>{HERO_LABELS[key]}</Text>
            {url ? (
              <Image source={{ uri: url }} style={styles.preview} resizeMode="cover" />
            ) : (
              <View style={[styles.placeholder, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                  ברירת מחדל מהאפליקציה
                </Text>
              </View>
            )}
            <View style={styles.row}>
              <AppButton
                title={busy ? "מעלה..." : url ? "החלפה" : "העלאה"}
                variant="secondary"
                onPress={() => pickAndUpload(key)}
                disabled={busy}
              />
              {url ? (
                <TouchableOpacity onPress={() => handleDelete(key)} style={styles.deleteBtn}>
                  <Text style={{ color: colors.error, fontWeight: "700" }}>מחיקה</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </AppCard>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  card: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right",
  },
  preview: {
    width: "100%",
    height: 120,
    borderRadius: BorderRadius.md,
  },
  placeholder: {
    width: "100%",
    height: 120,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 13,
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },
  deleteBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
});
