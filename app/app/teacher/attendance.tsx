import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { HeroBanner } from "../../src/components/HeroBanner";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import {
  getInitialAttendanceByChildId,
  saveAttendance,
} from "../../src/services/attendance.service";
import { getChildren } from "../../src/services/children.service";
import { Colors } from "../../src/theme/colors";
import { Heroes } from "../../src/theme/heroes";
import { heroOverlayTextStyles } from "../../src/theme/heroOverlay";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import type { AttendanceStatus } from "../../src/types/child";

const STATUS_OPTIONS: { status: AttendanceStatus; label: string }[] = [
  { status: "arrived", label: "הגיע" },
  { status: "not_arrived", label: "לא הגיע" },
  { status: "late", label: "מאחר" },
  { status: "left_early", label: "יצא מוקדם" },
];

export default function AttendanceScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [children, initialAttendance] = await Promise.all([
      getChildren(),
      getInitialAttendanceByChildId(),
    ]);
    return { children, initialAttendance };
  }, []);
  const children = data?.children ?? [];

  const [attendanceByChildId, setAttendanceByChildId] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.initialAttendance) {
      setAttendanceByChildId(data.initialAttendance);
    }
  }, [data]);

  const summary = useMemo(() => {
    const statuses = Object.values(attendanceByChildId);

    return {
      arrived: statuses.filter((status) => status === "arrived").length,
      late: statuses.filter((status) => status === "late").length,
      notArrived: statuses.filter((status) => status === "not_arrived").length,
    };
  }, [attendanceByChildId]);

  const formattedDate = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function updateChildStatus(childId: string, status: AttendanceStatus) {
    setAttendanceByChildId((current) => ({
      ...current,
      [childId]: status,
    }));
  }

  async function handleSave() {
    setSaving(true);
    const ok = await saveAttendance(attendanceByChildId);
    setSaving(false);
    if (ok) {
      Alert.alert("הנוכחות נשמרה בהצלחה", "הנתונים עודכנו.");
    } else {
      Alert.alert("שמירת הנוכחות נכשלה", "אירעה שגיאה. נסו שוב.");
    }
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable noPadding contentStyle={styles.screenContent}>
        <HeroBanner source={Heroes.attendance} height={220}>
          <View style={styles.headerOverlay}>
            <AppHeader
              onBellPress={() => router.push("/notifications")}
              onLeadingPress={() => router.push("/settings")}
            />
          </View>
          <View style={styles.titleBlock}>
            <Text style={heroOverlayTextStyles.title}>נוכחות היום</Text>
            <Text style={heroOverlayTextStyles.subtitle}>{formattedDate}</Text>
          </View>
        </HeroBanner>

        <View style={styles.body}>
          {loading ? (
            <AppStateCard
              state="loading"
              title="טוען נתונים"
              message="רגע, טוענים את רשימת הנוכחות"
            />
          ) : error ? (
            <AppStateCard
              state="error"
              title="לא הצלחנו לטעון"
              message="אירעה שגיאה בטעינת הנתונים. נסו שוב."
              actionLabel="נסו שוב"
              onActionPress={reload}
            />
          ) : (
            <>
          <AppCard style={styles.summaryCard}>
            <SummaryItem label="הגיעו" value={summary.arrived} tone="success" />
            <SummaryItem label="מאחרים" value={summary.late} tone="warning" />
            <SummaryItem label="לא הגיעו" value={summary.notArrived} tone="error" />
          </AppCard>

          <Text style={styles.sectionTitle}>רשימת ילדים</Text>

          {children.map((child) => {
            const selectedStatus = attendanceByChildId[child.id];

            return (
              <AppCard key={child.id} style={styles.childCard}>
                <View style={styles.childHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{child.name.slice(0, 1)}</Text>
                  </View>

                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childAge}>{child.age}</Text>
                  </View>
                </View>

                <View style={styles.statusGrid}>
                  {STATUS_OPTIONS.map((option) => (
                    <StatusChip
                      key={option.status}
                      label={option.label}
                      status={option.status}
                      active={selectedStatus === option.status}
                      onPress={() => updateChildStatus(child.id, option.status)}
                    />
                  ))}
                </View>
              </AppCard>
            );
          })}

          <AppButton
            title={saving ? "שומר..." : "שמור נוכחות"}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
          />
            </>
          )}
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

function SummaryItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "error";
}) {
  const color =
    tone === "success"
      ? Colors.presentText
      : tone === "warning"
        ? Colors.lateText
        : Colors.absentText;

  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summarySubtext}>ילדים</Text>
    </View>
  );
}

function StatusChip({
  label,
  status,
  active,
  onPress,
}: {
  label: string;
  status: AttendanceStatus;
  active: boolean;
  onPress: () => void;
}) {
  const colors = getStatusColors(status);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.statusChip,
        {
          backgroundColor: active ? colors.backgroundColor : Colors.background,
          borderColor: active ? colors.color : Colors.background,
        },
      ]}
    >
      <Text style={[styles.statusText, { color: active ? colors.color : Colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function getStatusColors(status: AttendanceStatus) {
  switch (status) {
    case "arrived":
      return { backgroundColor: Colors.presentBackground, color: Colors.presentText };
    case "not_arrived":
      return { backgroundColor: Colors.absentBackground, color: Colors.absentText };
    case "late":
      return { backgroundColor: Colors.lateBackground, color: Colors.lateText };
    case "left_early":
      return { backgroundColor: Colors.leftEarlyBackground, color: Colors.leftEarlyText };
  }
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
    fontSize: 26,
    fontWeight: "800",
    color: Colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "700",
    marginTop: 2,
    textAlign: "center",
  },
  body: {
    paddingHorizontal: Spacing.md,
    marginTop: -Spacing.xl,
  },
  summaryCard: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "700",
    marginTop: 2,
  },
  summarySubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  childCard: {
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  childHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: "800",
  },
  childInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  childName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  childAge: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  statusChip: {
    minHeight: 38,
    minWidth: "45%",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
  },
  saveButton: {
    marginTop: Spacing.md,
  },
});
