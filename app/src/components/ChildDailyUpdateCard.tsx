import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "./AppCard";
import {
  hasAnyContent,
  mealAmountLabel,
  moodOption,
  type ChildDailyUpdate,
} from "../services/childDailyUpdates.service";
import { Colors } from "../theme/colors";
import { BorderRadius, Spacing } from "../theme/spacing";
import { Typography } from "../theme/typography";

interface ChildDailyUpdateCardProps {
  childName: string;
  update: ChildDailyUpdate | null;
}

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

/** Parent-facing view of the child's personal daily update. */
export function ChildDailyUpdateCard({ childName, update }: ChildDailyUpdateCardProps) {
  const mood = moodOption(update?.mood);
  const meals = update
    ? [
        { label: "בוקר", value: mealAmountLabel(update.mealBreakfast) },
        { label: "צהריים", value: mealAmountLabel(update.mealLunch) },
        { label: "ביניים", value: mealAmountLabel(update.mealSnack) },
      ].filter((meal) => meal.value)
    : [];
  const nap =
    update?.napStart || update?.napEnd
      ? `${update.napStart ?? "?"} – ${update.napEnd ?? "עדיין ישן/ה"}`
      : null;

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="heart" size={18} color={Colors.primary} />
        <Text style={styles.title}>היום של {childName}</Text>
      </View>

      {!hasAnyContent(update) ? (
        <Text style={styles.empty}>הצוות עדיין לא עדכן היום — העדכון יופיע כאן.</Text>
      ) : (
        <View style={styles.grid}>
          {mood ? (
            <Tile icon="happy-outline" label="מצב רוח" value={`${mood.emoji} ${mood.label}`} />
          ) : null}
          {meals.map((meal) => (
            <Tile key={meal.label} icon="restaurant-outline" label={`ארוחת ${meal.label}`} value={meal.value ?? ""} />
          ))}
          {nap ? <Tile icon="moon-outline" label="שינה" value={nap} /> : null}
          {update?.diaperCount !== null && update?.diaperCount !== undefined ? (
            <Tile icon="water-outline" label="החתלות" value={String(update.diaperCount)} />
          ) : null}
          {update?.note ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>מהצוות</Text>
              <Text style={styles.noteText}>{update.note}</Text>
            </View>
          ) : null}
        </View>
      )}
    </AppCard>
  );
}

function Tile({ icon, label, value }: { icon: IoniconName; label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Ionicons name={icon} size={16} color={Colors.primary} />
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.sm },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
  },
  title: {
    ...Typography.title,
    color: Colors.textPrimary,
    textAlign: "right",
  },
  empty: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  tile: {
    width: "48%",
    flexGrow: 1,
    alignItems: "flex-end",
    gap: 2,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
  },
  tileLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  tileValue: {
    ...Typography.captionMedium,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  noteBox: {
    width: "100%",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary,
    gap: 2,
  },
  noteLabel: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: "700",
    textAlign: "right",
  },
  noteText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    textAlign: "right",
  },
});
