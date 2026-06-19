import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "./AppCard";
import { StatusBadge } from "./StatusBadge";
import { getCurrentDaycareName } from "../services/auth.service";
import { Colors } from "../theme/colors";
import { BorderRadius, Spacing } from "../theme/spacing";
import type { Child } from "../types/child";
import type { Contract } from "../types/contract";

interface ChildProfileProps {
  child: Child;
  contract?: Contract;
}

export function ChildProfile({ child, contract }: ChildProfileProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{child.name.slice(0, 1)}</Text>
        </View>
        <Text style={styles.name}>{child.name}</Text>
        <Text style={styles.age}>{child.age}</Text>
        <View style={styles.badgeRow}>
          <StatusBadge status={child.attendanceStatus} />
          {contract ? <StatusBadge status={contract.status} /> : null}
        </View>
      </View>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>פרטים</Text>
        <DetailRow icon="calendar-outline" label="תאריך לידה" value={child.birthDate} />
        <DetailRow icon="home-outline" label="גן" value={getCurrentDaycareName()} />
        {child.notes ? (
          <DetailRow icon="alert-circle-outline" label="הערות" value={child.notes} />
        ) : null}
      </AppCard>

      {child.guardians && child.guardians.length > 0 ? (
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>אנשי קשר</Text>
          {child.guardians.map((guardian, index) => (
            <View
              key={guardian.id}
              style={[
                styles.guardianRow,
                index === (child.guardians?.length ?? 0) - 1 && styles.guardianRowLast,
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => Linking.openURL(`tel:${guardian.phone}`)}
                style={styles.callButton}
              >
                <Ionicons name="call" size={18} color={Colors.white} />
              </TouchableOpacity>

              <View style={styles.guardianInfo}>
                <View style={styles.guardianNameRow}>
                  <Text style={styles.guardianName}>{guardian.fullName}</Text>
                  {guardian.isPrimaryContact ? (
                    <View style={styles.primaryChip}>
                      <Text style={styles.primaryChipText}>ראשי</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.guardianMeta}>
                  {guardian.relationshipType} · {guardian.phone}
                </Text>
              </View>
            </View>
          ))}
        </AppCard>
      ) : null}
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailValue}>{value}</Text>
      <View style={styles.detailLabelBlock}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Ionicons name={icon} size={16} color={Colors.textSecondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "800",
    color: Colors.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  age: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row-reverse",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  card: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
    marginBottom: Spacing.xs,
  },
  detailRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  detailLabelBlock: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "700",
    flex: 1,
    textAlign: "left",
  },
  guardianRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  guardianRowLast: {
    borderBottomWidth: 0,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },
  guardianInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  guardianNameRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
  },
  guardianName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  guardianMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  primaryChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary,
  },
  primaryChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
});
