import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { AppButton } from "../../../src/components/AppButton";
import { AppCard } from "../../../src/components/AppCard";
import { AppHeader } from "../../../src/components/AppHeader";
import { AppScreen } from "../../../src/components/AppScreen";
import { useDaycareColors } from "../../../src/daycare/DaycareBrandingContext";
import { getStaffMembers, removeStaffMember, type StaffMember } from "../../../src/services/staff.service";
import { confirmDelete } from "../../../src/utils/confirm";
import { BorderRadius, Spacing } from "../../../src/theme/spacing";

export default function AdminStaffScreen() {
  const router = useRouter();
  const colors = useDaycareColors();
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const load = useCallback(() => {
    void getStaffMembers().then(setStaff);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleRemove(member: StaffMember) {
    if (member.role === "admin") {
      Alert.alert("לא ניתן", "לא ניתן להסיר את מנהל/ת הגן.");
      return;
    }
    confirmDelete(`להסיר את ${member.fullName} מהצוות?`, async () => {
      const ok = await removeStaffMember(member.id);
      if (!ok) {
        Alert.alert("שגיאה", "לא הצלחנו להסיר את המורה.");
        return;
      }
      load();
    });
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppScreen scrollable contentStyle={styles.content}>
        <AppHeader onBellPress={() => router.push("/notifications")} onLeadingPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>צוות הגן</Text>
        <AppButton title="הזמנת מורה" onPress={() => router.push("/admin/staff/invite" as Href)} />
        <AppCard style={styles.list}>
          {staff.map((member) => (
            <View key={member.id} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{member.fullName}</Text>
                <Text style={[styles.role, { color: colors.textSecondary }]}>
                  {member.role === "admin" ? "מנהל/ת" : "מורה"}
                  {member.phone ? ` · ${member.phone}` : ""}
                </Text>
              </View>
              {member.role === "teacher" ? (
                <TouchableOpacity onPress={() => handleRemove(member)}>
                  <Text style={{ color: colors.error, fontWeight: "700" }}>הסרה</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
          {staff.length === 0 ? (
            <Text style={[styles.empty, { color: colors.textSecondary }]}>אין עדיין מורים נוספים.</Text>
          ) : null}
        </AppCard>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: Spacing.lg, paddingBottom: Spacing.xxl },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  list: { gap: Spacing.sm },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  rowText: { flex: 1, alignItems: "flex-end" },
  name: { fontSize: 16, fontWeight: "700" },
  role: { fontSize: 13, marginTop: 2 },
  empty: { textAlign: "right", fontSize: 14 },
});
