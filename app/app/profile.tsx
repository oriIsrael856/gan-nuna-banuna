import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "../src/components/AppCard";
import { AppHeader } from "../src/components/AppHeader";
import { AppScreen } from "../src/components/AppScreen";
import { BottomNavBar } from "../src/components/BottomNavBar";
import { useBottomNavPress } from "../src/navigation/useBottomNavPress";
import {
  getCurrentDaycareName,
  getCurrentUser,
  getCurrentUserRole,
} from "../src/services/auth.service";
import { Colors } from "../src/theme/colors";
import { BorderRadius, Spacing } from "../src/theme/spacing";
import { Typography } from "../src/theme/typography";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export default function ProfileScreen() {
  const router = useRouter();
  const user = getCurrentUser();
  const role = getCurrentUserRole();
  const variant = role === "teacher" || role === "admin" ? "teacher" : "parent";
  const handleBottomNavPress = useBottomNavPress(variant);
  const roleLabel = variant === "teacher" ? "צוות הגן" : "הורה";

  const menuItems: { id: string; label: string; icon: IoniconName; route: Href }[] = [
    { id: "messages", label: "ההודעות שלי", icon: "chatbubble-ellipses-outline", route: "/messages" },
    { id: "calendar", label: "לוח שנה", icon: "calendar-outline", route: "/calendar" },
    { id: "notifications", label: "התראות", icon: "notifications-outline", route: "/notifications" },
    { id: "settings", label: "הגדרות", icon: "settings-outline", route: "/settings" },
  ];

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader
          onBellPress={() => router.push("/notifications")}
          onLeadingPress={() => {}}
        />

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.slice(0, 1)}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.roleChip}>
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>

        <AppCard style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>פרטים אישיים</Text>
          <DetailRow icon="call-outline" label="טלפון" value={user.phone ?? "לא הוזן"} />
          <DetailRow icon="mail-outline" label="אימייל" value={user.email ?? "לא הוזן"} />
          <DetailRow icon="home-outline" label="גן" value={getCurrentDaycareName()} />
        </AppCard>

        <AppCard style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              onPress={() => router.push(item.route)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]}
            >
              <Ionicons name="chevron-back" size={18} color={Colors.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={18} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </AppCard>
      </AppScreen>

      <BottomNavBar
        activeItem="profile"
        variant={variant}
        onItemPress={handleBottomNavPress}
      />
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: IoniconName;
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
  root: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
  },
  screenContent: {
    paddingBottom: Spacing.xxl,
  },
  profileHeader: {
    alignItems: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  avatarText: {
    fontSize: 38,
    fontWeight: "800",
    color: Colors.primary,
  },
  name: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  roleChip: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary,
  },
  roleText: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.primary,
  },
  detailsCard: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.title,
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
    borderBottomColor: Colors.divider,
  },
  detailLabelBlock: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.body,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "left",
  },
  menuCard: {
    marginTop: Spacing.lg,
  },
  menuItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    minHeight: 44,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  menuLabel: {
    ...Typography.body,
    fontWeight: "700",
    flex: 1,
    color: Colors.textPrimary,
    textAlign: "right",
  },
});
