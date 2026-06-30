import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { BrandedHeroBanner } from "../../src/components/BrandedHeroBanner";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import {
  getDailyActivities,
  getDailyMeals,
  getDailyMessages,
  getDailyNotes,
  getDailyReportSummary,
} from "../../src/services/dailyReports.service";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { Colors } from "../../src/theme/colors";
import { heroOverlayTextStyles } from "../../src/theme/heroOverlay";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "ארוחת בוקר",
  lunch: "ארוחת צהריים",
  snack: "ארוחת נישנוש",
};

function formatToday() {
  return new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DailySummaryScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("parent");
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [summary, activities, meals, messages, notes] = await Promise.all([
      getDailyReportSummary(),
      getDailyActivities(),
      getDailyMeals(),
      getDailyMessages(),
      getDailyNotes(),
    ]);
    return { summary, activities, meals, messages, notes };
  }, []);

  const summary = data?.summary;
  const dailyActivities = data?.activities ?? [];
  const dailyMeals = data?.meals ?? [];
  const dailyMessages = data?.messages ?? [];
  const dailyNotes = data?.notes ?? [];

  const stats: { label: string; value: string; text: string; icon: IoniconName }[] = summary
    ? [
        {
          label: "נוכחות",
          value: String(summary.presentChildren),
          text: "ילדים הגיעו",
          icon: "people-outline",
        },
        {
          label: "פעילויות",
          value: String(summary.activitiesCount),
          text: "פעילויות",
          icon: "color-palette-outline",
        },
        {
          label: "ארוחות",
          value: String(summary.mealsCount),
          text: "ארוחות",
          icon: "restaurant-outline",
        },
        {
          label: "הודעות להורים",
          value: String(summary.messagesCount),
          text: "נשלחו",
          icon: "chatbubble-ellipses-outline",
        },
      ]
    : [];

  return (
    <View style={styles.root}>
      <AppScreen scrollable noPadding contentStyle={styles.screenContent}>
        <BrandedHeroBanner heroKey="dailySummary" height={230}>
          <View style={styles.headerOverlay}>
            <AppHeader
              onBellPress={() => router.push("/notifications")}
              onLeadingPress={() => router.push("/settings")}
            />
          </View>
          <View style={styles.titleBlock}>
            <Text style={heroOverlayTextStyles.title}>סיכום יום</Text>
            <Text style={heroOverlayTextStyles.subtitle}>{formatToday()}</Text>
          </View>
        </BrandedHeroBanner>

        <View style={styles.body}>
          {loading || !data ? (
            <AppStateCard
              state="loading"
              title="טוען סיכום"
              message="רגע, טוענים את סיכום היום"
            />
          ) : error ? (
            <AppStateCard
              state="error"
              title="לא הצלחנו לטעון"
              message="אירעה שגיאה בטעינת הסיכום. נסו שוב."
              actionLabel="נסו שוב"
              onActionPress={reload}
            />
          ) : (
            <>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <AppCard key={stat.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Ionicons
                  name={stat.icon}
                  size={22}
                  color={Colors.primary}
                  style={styles.statIcon}
                />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statText}>{stat.text}</Text>
              </AppCard>
            ))}
          </View>

          <AppCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>פעילויות מרכזיות</Text>
            </View>

            {dailyActivities.length === 0 ? (
              <Text style={styles.emptySectionText}>אין פעילויות שתועדו היום</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.activitiesScroll}
              >
                {dailyActivities.map((activity) => (
                  <View key={activity.id} style={styles.activityCard}>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                    <View style={styles.activityThumb}>
                      {activity.imageUrl ? (
                        <Image source={{ uri: activity.imageUrl }} style={styles.activityImage} />
                      ) : (
                        <Ionicons name="image-outline" size={26} color={Colors.primary} />
                      )}
                    </View>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityText} numberOfLines={1}>
                      {activity.description}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </AppCard>

          <View style={styles.twoColumns}>
            <AppCard style={styles.columnCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="clipboard-outline" size={18} color={Colors.primary} />
                <Text style={styles.columnTitle}>הערות מהיום</Text>
              </View>
              {dailyNotes.length === 0 ? (
                <Text style={styles.emptySectionText}>אין הערות היום</Text>
              ) : (
                dailyNotes.map((note) => (
                  <View key={note.id} style={styles.noteRow}>
                    <Text style={styles.noteBullet}>•</Text>
                    <Text style={styles.noteText}>{note.text}</Text>
                  </View>
                ))
              )}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push("/messages")}
                style={styles.columnButton}
                accessibilityRole="button"
                accessibilityLabel="שליחת הודעה לגננת"
              >
                <Ionicons name="add" size={16} color={Colors.primary} />
                <Text style={styles.columnButtonText}>שליחת הודעה לגננת</Text>
              </TouchableOpacity>
            </AppCard>

            <AppCard style={styles.columnCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="paper-plane-outline" size={18} color={Colors.primary} />
                <Text style={styles.columnTitle}>הודעות להורים</Text>
              </View>
              {dailyMessages.length === 0 ? (
                <Text style={styles.emptySectionText}>אין הודעות חדשות</Text>
              ) : (
                dailyMessages.map((message) => (
                  <View key={message.id} style={styles.messageItem}>
                    <Text style={styles.messageTime}>{message.time}</Text>
                    <Text style={styles.messageText} numberOfLines={2}>
                      {message.text}
                    </Text>
                  </View>
                ))
              )}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push("/messages")}
                style={styles.columnButton}
                accessibilityRole="button"
                accessibilityLabel="צפייה בכל ההודעות"
              >
                <Ionicons name="chatbubbles-outline" size={16} color={Colors.primary} />
                <Text style={styles.columnButtonText}>צפייה בכל ההודעות</Text>
              </TouchableOpacity>
            </AppCard>
          </View>

          <View style={styles.sectionHeaderPlain}>
            <Ionicons name="restaurant" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>מה אכלנו היום</Text>
          </View>

          {dailyMeals.length === 0 ? (
            <Text style={styles.emptySectionText}>אין ארוחות שתועדו היום</Text>
          ) : (
            <View style={styles.mealsRow}>
              {dailyMeals.map((meal) => (
                <AppCard key={meal.id} style={styles.mealCard}>
                  <Text style={styles.mealTitle}>
                    {MEAL_TYPE_LABELS[meal.mealType] ?? meal.title}
                  </Text>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                  <View style={styles.mealThumb}>
                    <Ionicons name="fast-food-outline" size={22} color={Colors.primary} />
                  </View>
                  <Text style={styles.mealText} numberOfLines={2}>
                    {meal.description}
                  </Text>
                </AppCard>
              ))}
            </View>
          )}
            </>
          )}
        </View>
      </AppScreen>

      <BottomNavBar
        activeItem="daily"
        variant="parent"
        onItemPress={handleBottomNavPress}
      />
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
  statsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  statCard: {
    width: "48%",
    alignItems: "center",
  },
  statIcon: {
    marginVertical: 4,
  },
  statValue: {
    ...Typography.titleLarge,
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.captionMedium,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  statText: {
    ...Typography.label,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  sectionCard: {
    marginTop: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionHeaderPlain: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    textAlign: "right",
  },
  activitiesScroll: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
  },
  activityCard: {
    width: 150,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
  },
  activityTime: {
    ...Typography.label,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  activityThumb: {
    height: 80,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
    marginVertical: Spacing.xs,
    overflow: "hidden",
  },
  activityImage: {
    width: "100%",
    height: "100%",
  },
  activityTitle: {
    ...Typography.bodyMedium,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  activityText: {
    ...Typography.label,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
  },
  twoColumns: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  columnCard: {
    flex: 1,
  },
  columnTitle: {
    flex: 1,
    ...Typography.subtitle,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  noteRow: {
    flexDirection: "row-reverse",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  noteBullet: {
    ...Typography.body,
    fontWeight: "700",
    color: Colors.primary,
  },
  noteText: {
    flex: 1,
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  columnButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.xs,
  },
  columnButtonText: {
    ...Typography.label,
    fontWeight: "700",
    color: Colors.primary,
  },
  emptySectionText: {
    ...Typography.label,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  messageItem: {
    paddingVertical: Spacing.xs,
    alignItems: "flex-end",
  },
  messageTime: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  messageText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
  },
  mealsRow: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
  },
  mealCard: {
    flex: 1,
    alignItems: "center",
  },
  mealTitle: {
    ...Typography.captionMedium,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  mealTime: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  mealThumb: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
    marginVertical: Spacing.xs,
  },
  mealText: {
    ...Typography.label,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
