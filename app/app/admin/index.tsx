import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { useDaycareColors, useDaycareSettings } from "../../src/daycare/DaycareBrandingContext";
import { BorderRadius, Spacing } from "../../src/theme/spacing";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const MENU_ITEMS: { href: Href; icon: IoniconName; label: string; subtitle: string }[] = [
  {
    href: "/admin/daycare-details" as Href,
    icon: "business-outline",
    label: "פרטי הגן",
    subtitle: "שם, קשר, גננת",
  },
  {
    href: "/admin/branding" as Href,
    icon: "color-palette-outline",
    label: "מיתוג וצבעים",
    subtitle: "סלוגן, צבעים",
  },
  {
    href: "/admin/heroes" as Href,
    icon: "images-outline",
    label: "תמונות הירו",
    subtitle: "העלאה והחלפה",
  },
  {
    href: "/admin/staff" as Href,
    icon: "people-outline",
    label: "צוות הגן",
    subtitle: "מורים והזמנות",
  },
  {
    href: "/teacher/children",
    icon: "happy-outline",
    label: "ילדים והורים",
    subtitle: "הוספה, עריכה, מחיקה",
  },
  {
    href: "/teacher/contracts",
    icon: "document-text-outline",
    label: "חוזים",
    subtitle: "העלאה ומחיקה",
  },
];

export default function AdminHomeScreen() {
  const router = useRouter();
  const colors = useDaycareColors();
  const settings = useDaycareSettings();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppScreen scrollable contentStyle={styles.content}>
        <AppHeader onBellPress={() => router.push("/notifications")} onLeadingPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>ניהול הגן</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{settings.daycareName}</Text>

        <AppCard style={styles.menu}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.href as string}
              activeOpacity={0.75}
              onPress={() => router.push(item.href)}
              style={[styles.row, index === MENU_ITEMS.length - 1 && styles.rowLast]}
            >
              <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{item.subtitle}</Text>
              </View>
              <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </AppCard>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: Spacing.xxl },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "right",
    marginBottom: Spacing.lg,
  },
  menu: { gap: 0, paddingVertical: Spacing.xs },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  rowLast: { borderBottomWidth: 0 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1, alignItems: "flex-end" },
  rowLabel: { fontSize: 16, fontWeight: "700" },
  rowSub: { fontSize: 12, marginTop: 2 },
});
