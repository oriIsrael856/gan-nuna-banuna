import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { StatusBadge } from "../../src/components/StatusBadge";
import { useDaycareColors } from "../../src/daycare/DaycareBrandingContext";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getTodayUpdatedChildIds } from "../../src/services/childDailyUpdates.service";
import { getChildren } from "../../src/services/children.service";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";
import type { Child } from "../../src/types/child";

export default function TeacherChildUpdatesScreen() {
  const router = useRouter();
  const colors = useDaycareColors();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const [children, setChildren] = useState<Child[]>([]);
  const [updatedIds, setUpdatedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [list, updated] = await Promise.all([getChildren(), getTodayUpdatedChildIds()]);
    setChildren(list);
    setUpdatedIds(updated);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const updatedCount = children.filter((child) => updatedIds.has(child.id)).length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppScreen scrollable contentStyle={styles.content}>
        <AppHeader
          variant="back"
          onLeadingPress={() => router.back()}
          onBellPress={() => router.push("/notifications")}
        />
        <Text style={[styles.title, { color: colors.textPrimary }]}>עדכון אישי לילדים</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {loading ? "טוען..." : `${updatedCount} מתוך ${children.length} ילדים עודכנו היום`}
        </Text>

        {loading ? (
          <AppStateCard state="loading" title="טוען ילדים" message="רגע..." />
        ) : children.length === 0 ? (
          <AppStateCard state="empty" title="אין ילדים" message="הוסיפו ילדים כדי לעדכן דיווח אישי." />
        ) : (
          <AppCard style={styles.list}>
            {children.map((child, index) => {
              const done = updatedIds.has(child.id);
              return (
                <TouchableOpacity
                  key={child.id}
                  activeOpacity={0.75}
                  onPress={() => router.push(`/teacher/child-update?childId=${child.id}` as Href)}
                  style={[styles.row, index === children.length - 1 && styles.rowLast]}
                  accessibilityRole="button"
                  accessibilityLabel={`עדכון אישי עבור ${child.name}`}
                >
                  <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
                  <View style={styles.rowText}>
                    <Text style={[styles.name, { color: colors.textPrimary }]}>{child.name}</Text>
                    <View style={styles.badgeRow}>
                      <StatusBadge status={child.attendanceStatus} />
                      <Text style={[styles.doneText, { color: done ? colors.primary : colors.textSecondary }]}>
                        {done ? "עודכן ✓" : "טרם עודכן"}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.avatar, { backgroundColor: done ? colors.primary : colors.secondary }]}>
                    <Text style={[styles.avatarText, { color: done ? "#FFFFFF" : colors.primary }]}>
                      {child.name.slice(0, 1)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </AppCard>
        )}
      </AppScreen>

      <BottomNavBar activeItem="home" variant="teacher" onItemPress={handleBottomNavPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: Spacing.md, paddingBottom: 120 },
  title: {
    ...Typography.titleLarge,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    textAlign: "right",
    marginTop: -Spacing.sm,
  },
  list: { gap: 0, paddingVertical: Spacing.xs },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowLast: { borderBottomWidth: 0 },
  rowText: { flex: 1, alignItems: "flex-end", gap: 4 },
  name: { ...Typography.subtitle, fontWeight: "700" },
  badgeRow: { flexDirection: "row-reverse", alignItems: "center", gap: Spacing.sm },
  doneText: { ...Typography.caption, fontWeight: "700" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "800" },
});
