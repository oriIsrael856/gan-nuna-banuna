import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppTextInput } from "../../src/components/AppTextInput";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getActivityCatalog } from "../../src/services/activityCatalog.service";
import {
  addDailyActivity,
  getDailyActivities,
  updateDailyActivity,
} from "../../src/services/dailyReports.service";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";

const CATEGORIES: { id: string; label: string }[] = [
  { id: "learning", label: "למידה" },
  { id: "creative", label: "יצירה" },
  { id: "movement", label: "תנועה" },
  { id: "story", label: "סיפור" },
  { id: "outdoor", label: "חצר" },
];

export default function AddActivityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string }>();
  const editId = params.editId;
  const isEdit = Boolean(editId);
  const handleBottomNavPress = useBottomNavPress("teacher");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("learning");
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: catalog, loading: catalogLoading } = useAsyncData(
    () => getActivityCatalog(),
    [],
  );

  useEffect(() => {
    if (!editId) {
      return;
    }
    getDailyActivities().then((activities) => {
      const activity = activities.find((item) => item.id === editId);
      if (!activity) {
        return;
      }
      setTitle(activity.title);
      setTime(activity.time);
      setDescription(activity.description);
      setCategory(activity.category);
      setCatalogId(activity.catalogId ?? null);
    });
  }, [editId]);

  function handleSelectCatalog(item: { id: string; title: string; category: string | null }) {
    if (catalogId === item.id) {
      setCatalogId(null);
      return;
    }
    setCatalogId(item.id);
    setTitle(item.title);
    if (item.category) {
      setCategory(item.category);
    }
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push("/teacher/daily-report");
  }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert("חסר שם", "נא להזין שם לפעילות.");
      return;
    }
    setSaving(true);
    const ok = isEdit && editId
      ? await updateDailyActivity(editId, {
          title: title.trim(),
          time: time.trim(),
          description: description.trim(),
          category,
        })
      : await addDailyActivity({
          title: title.trim(),
          time: time.trim(),
          description: description.trim(),
          category,
          catalogId,
        });
    setSaving(false);
    if (ok) {
      Alert.alert("נשמר", isEdit ? "הפעילות עודכנה." : "הפעילות נוספה לסיכום היום.");
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
        <Text style={styles.title}>{isEdit ? "עריכת פעילות" : "הוספת פעילות"}</Text>
        <Text style={styles.subtitle}>{isEdit ? "עדכון פרטי הפעילות" : "תיעוד פעילות חדשה ליום"}</Text>

        <AppCard style={styles.formCard}>
          <Text style={styles.fieldLabel}>בחירה ממאגר הפעילויות</Text>
          {catalogLoading ? (
            <ActivityIndicator color={Colors.primary} style={styles.catalogLoader} />
          ) : (catalog ?? []).length === 0 ? (
            <Text style={styles.catalogEmpty}>אפשר להזין פעילות חופשית למטה.</Text>
          ) : (
            <View style={styles.catalogGrid}>
              {(catalog ?? []).map((item) => {
                const selected = catalogId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => handleSelectCatalog(item)}
                    style={[styles.catalogTile, selected && styles.catalogTileSelected]}
                  >
                    <View style={styles.catalogImageWrap}>
                      {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.catalogImage} />
                      ) : (
                        <Ionicons name="image-outline" size={22} color={Colors.textSecondary} />
                      )}
                    </View>
                    <Text style={styles.catalogTileText} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <AppTextInput label="שם הפעילות" value={title} onChangeText={setTitle} placeholder="לדוגמה: מפגש בוקר" />
          <AppTextInput label="שעה" value={time} onChangeText={setTime} placeholder="09:00" />

          <Text style={styles.fieldLabel}>קטגוריה</Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map((item) => {
              const selected = category === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => setCategory(item.id)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <AppTextInput
            label="תיאור"
            value={description}
            onChangeText={setDescription}
            placeholder="פירוט קצר על הפעילות..."
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
    backgroundColor: Colors.background,
  },
  screenContent: {
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  formCard: {
    gap: Spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  catalogLoader: {
    marginVertical: Spacing.md,
  },
  catalogEmpty: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  catalogGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  catalogTile: {
    width: "30%",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E8DDD2",
    backgroundColor: Colors.background,
    padding: Spacing.xs,
    alignItems: "center",
    gap: 4,
  },
  catalogTileSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary,
  },
  catalogImageWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#EFE7DD",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  catalogImage: {
    width: "100%",
    height: "100%",
  },
  catalogTileText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  chipsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: "#E8DDD2",
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
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
