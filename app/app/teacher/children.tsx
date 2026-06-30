import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { AppTextInput } from "../../src/components/AppTextInput";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { BrandedHeroBanner } from "../../src/components/BrandedHeroBanner";
import { EmptyState } from "../../src/components/EmptyState";
import { StatusBadge } from "../../src/components/StatusBadge";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getCurrentDaycareName } from "../../src/services/auth.service";
import { deleteChild, getChildren } from "../../src/services/children.service";
import { confirmDelete } from "../../src/utils/confirm";
import { Colors } from "../../src/theme/colors";
import { heroOverlayTextStyles } from "../../src/theme/heroOverlay";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

export default function TeacherChildrenScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const [searchText, setSearchText] = useState("");
  const { data, loading, error, reload } = useAsyncData(() => getChildren(), []);
  const children = useMemo(() => data ?? [], [data]);

  const filteredChildren = useMemo(() => {
    const query = searchText.trim();

    if (!query) {
      return children;
    }

    return children.filter((child) => child.name.includes(query));
  }, [children, searchText]);

  const presentCount = children.filter(
    (child) => child.attendanceStatus === "arrived",
  ).length;
  const absentCount = children.length - presentCount;

  function handleDeleteChild(id: string, name: string) {
    confirmDelete(`למחוק את ${name} מהרשימה?`, async () => {
      await deleteChild(id);
      reload();
    });
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable noPadding contentStyle={styles.screenContent}>
        <BrandedHeroBanner heroKey="children" height={220} contentPosition="top">
          <View style={styles.headerOverlay}>
            <AppHeader
              onBellPress={() => router.push("/notifications")}
              onLeadingPress={() => router.push("/settings")}
            />
          </View>
          <View style={styles.titleBlock}>
            <Text style={heroOverlayTextStyles.title}>ילדים בגן</Text>
            <Text style={heroOverlayTextStyles.subtitle}>רשימת הילדים ב{getCurrentDaycareName()}</Text>
          </View>
        </BrandedHeroBanner>

        <View style={styles.body}>
          <AppTextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="חיפוש ילד..."
          />

          <AppCard style={styles.summaryCard}>
            <SummaryItem label="סה״כ ילדים" value={children.length} />
            <SummaryItem label="נוכחים היום" value={presentCount} />
            <SummaryItem label="נעדרים היום" value={absentCount} />
          </AppCard>

          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>רשימת ילדים</Text>
            <Text style={styles.sectionMeta}>{filteredChildren.length} מוצגים</Text>
          </View>

          {loading ? (
            <AppStateCard
              state="loading"
              title="טוען ילדים"
              message="רגע, טוענים את רשימת הילדים"
            />
          ) : error ? (
            <AppStateCard
              state="error"
              title="לא הצלחנו לטעון"
              message="אירעה שגיאה בטעינת הרשימה. נסו שוב."
              actionLabel="נסו שוב"
              onActionPress={reload}
            />
          ) : filteredChildren.length === 0 ? (
            children.length === 0 ? (
              <EmptyState
                icon="happy-outline"
                title="עדיין אין ילדים בגן"
                message="הוסיפו את הילד/ה הראשון/ה כדי להתחיל לנהל נוכחות, דוחות וחוזים."
                actionLabel="הוספת ילד/ה"
                onActionPress={() => router.push("/teacher/add-child")}
              />
            ) : (
              <EmptyState
                icon="search-outline"
                title="לא נמצאו ילדים"
                message="נסו לחפש שם אחר או לנקות את החיפוש."
              />
            )
          ) : (
            filteredChildren.map((child) => (
              <TouchableOpacity
                key={child.id}
                activeOpacity={0.85}
                onPress={() => router.push(`/teacher/child/${child.id}`)}
                onLongPress={() => handleDeleteChild(child.id, child.name)}
                accessibilityRole="button"
                accessibilityLabel={`${child.name}, פרטי ילד`}
              >
                <AppCard style={styles.childCard}>
                <View style={styles.childMain}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{child.name.slice(0, 1)}</Text>
                  </View>

                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childAge}>{child.age}</Text>

                    <View style={styles.badgeRow}>
                      <StatusBadge status={child.attendanceStatus} />
                      {child.contractStatus ? (
                        <StatusBadge status={child.contractStatus} />
                      ) : null}
                      {child.guardians?.[0] ? (
                        <View style={styles.guardianBadge}>
                          <Text style={styles.guardianBadgeText}>
                            {child.guardians[0].isLinked
                              ? "הורה מחובר"
                              : child.guardians[0].email
                                ? "הורה מוזמן"
                                : "ללא אימייל"}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
                </View>
                </AppCard>
              </TouchableOpacity>
            ))
          )}

          <AppButton
            title="הוספת ילד"
            onPress={() => router.push("/teacher/add-child")}
            style={styles.addButton}
          />
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

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
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
  headerOverlay: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  titleBlock: {
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  body: {
    paddingHorizontal: Spacing.md,
    marginTop: -Spacing.xl,
  },
  summaryCard: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    ...Typography.titleLarge,
    color: Colors.primary,
  },
  summaryLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  listHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    textAlign: "right",
  },
  sectionMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  childCard: {
    marginBottom: Spacing.sm,
  },
  childMain: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  avatarText: {
    ...Typography.titleLarge,
    color: Colors.primary,
  },
  childInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  childName: {
    ...Typography.subtitle,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  childAge: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "right",
  },
  badgeRow: {
    flexDirection: "row-reverse",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    flexWrap: "wrap",
  },
  guardianBadge: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  guardianBadgeText: {
    ...Typography.labelBold,
    color: Colors.primary,
  },
  addButton: {
    marginTop: Spacing.md,
  },
});
