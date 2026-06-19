import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { HeroBanner } from "../../src/components/HeroBanner";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import {
  deleteDailyActivity,
  deleteDailyMeal,
  deleteDailyNote,
  getDailyActivities,
  getDailyMeals,
  getDailyMessages,
  getDailyNotes,
  getDailyReportSummary,
} from "../../src/services/dailyReports.service";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { confirmDelete } from "../../src/utils/confirm";
import { Colors } from "../../src/theme/colors";
import { Heroes } from "../../src/theme/heroes";
import { heroOverlayTextStyles } from "../../src/theme/heroOverlay";
import { BorderRadius, Spacing } from "../../src/theme/spacing";

const CATEGORY_LABELS: Record<string, string> = {
  learning: "למידה",
  creative: "יצירה",
  movement: "תנועה",
  story: "סיפור",
  outdoor: "חצר",
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: "בוקר",
  lunch: "צהריים",
  snack: "ביניים",
};

export default function TeacherDailyReportScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("teacher");
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

  const dailyReportSummary = data?.summary;
  const dailyActivities = data?.activities ?? [];
  const dailyMeals = data?.meals ?? [];
  const dailyMessages = data?.messages ?? [];
  const dailyNotes = data?.notes ?? [];

  function handleDeleteActivity(id: string) {
    confirmDelete("למחוק את הפעילות?", async () => {
      await deleteDailyActivity(id);
      reload();
    });
  }

  function handleDeleteMeal(id: string) {
    confirmDelete("למחוק את הארוחה?", async () => {
      await deleteDailyMeal(id);
      reload();
    });
  }

  function handleDeleteNote(id: string) {
    confirmDelete("למחוק את ההערה?", async () => {
      await deleteDailyNote(id);
      reload();
    });
  }
  const formattedDate = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={styles.root}>
      <AppScreen scrollable noPadding contentStyle={styles.screenContent}>
        <HeroBanner source={Heroes.dailySummary} height={220}>
          <View style={styles.headerOverlay}>
            <AppHeader
              onBellPress={() => router.push("/notifications")}
              onLeadingPress={() => router.push("/settings")}
            />
          </View>
          <View style={styles.titleBlock}>
            <Text style={heroOverlayTextStyles.title}>סיכום יום</Text>
            <Text style={heroOverlayTextStyles.subtitle}>{formattedDate}</Text>
          </View>
        </HeroBanner>

        <View style={styles.body}>
        {loading || !dailyReportSummary ? (
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
        <View style={styles.summaryGrid}>
          <SummaryCard
            label="נוכחות"
            value={dailyReportSummary.presentChildren}
            text="ילדים הגיעו"
          />
          <SummaryCard
            label="פעילויות"
            value={dailyReportSummary.activitiesCount}
            text="פעילויות"
          />
          <SummaryCard
            label="ארוחות"
            value={dailyReportSummary.mealsCount}
            text="ארוחות"
          />
          <SummaryCard
            label="הודעות להורים"
            value={dailyReportSummary.messagesCount}
            text="נשלחו"
          />
        </View>

        <SectionHeader
          title="פעילויות מרכזיות"
          actionLabel="הוספת פעילות"
          onPress={() => router.push("/teacher/add-activity")}
        />

        {dailyActivities.map((activity) => (
          <AppCard key={activity.id} style={styles.contentCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTime}>{activity.time}</Text>
              <View style={styles.itemHeaderRight}>
                <Text style={styles.badge}>{CATEGORY_LABELS[activity.category]}</Text>
                <TouchableOpacity
                  hitSlop={8}
                  onPress={() => router.push(`/teacher/add-activity?editId=${activity.id}`)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  hitSlop={8}
                  onPress={() => handleDeleteActivity(activity.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            {activity.imageUrl ? (
              <Image source={{ uri: activity.imageUrl }} style={styles.activityImage} />
            ) : null}
            <Text style={styles.itemTitle}>{activity.title}</Text>
            <Text style={styles.itemText}>{activity.description}</Text>
          </AppCard>
        ))}

        <SectionHeader
          title="הודעות להורים"
          actionLabel="צפייה בכל ההודעות"
          onPress={() => router.push("/messages")}
        />

        <AppCard style={styles.contentCard}>
          {dailyMessages.map((message, index) => (
            <View
              key={message.id}
              style={[
                styles.compactItem,
                index === dailyMessages.length - 1 && styles.lastCompactItem,
              ]}
            >
              <Text style={styles.itemTime}>{message.time}</Text>
              <Text style={styles.itemText}>{message.text}</Text>
            </View>
          ))}
        </AppCard>

        <SectionHeader
          title="הערות מהיום"
          actionLabel="הוספת הערה"
          onPress={() => router.push("/teacher/add-note")}
        />

        <AppCard style={styles.contentCard}>
          {dailyNotes.map((note, index) => (
            <View
              key={note.id}
              style={[
                styles.compactItem,
                index === dailyNotes.length - 1 && styles.lastCompactItem,
              ]}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{note.childName ?? "הערה כללית"}</Text>
                <TouchableOpacity
                  hitSlop={8}
                  onPress={() => router.push(`/teacher/add-note?editId=${note.id}`)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  hitSlop={8}
                  onPress={() => handleDeleteNote(note.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.itemText}>{note.text}</Text>
            </View>
          ))}
        </AppCard>

        <SectionHeader
          title="מה אכלנו היום"
          actionLabel="הוספת ארוחה"
          onPress={() => router.push("/teacher/add-meal")}
        />
        {dailyMeals.map((meal) => (
          <AppCard key={meal.id} style={styles.contentCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTime}>{meal.time}</Text>
              <View style={styles.itemHeaderRight}>
                <Text style={styles.badge}>{MEAL_LABELS[meal.mealType]}</Text>
                <TouchableOpacity
                  hitSlop={8}
                  onPress={() => router.push(`/teacher/add-meal?editId=${meal.id}`)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  hitSlop={8}
                  onPress={() => handleDeleteMeal(meal.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.itemTitle}>{meal.title}</Text>
            <Text style={styles.itemText}>{meal.description}</Text>
          </AppCard>
        ))}
          </>
        )}
        </View>
      </AppScreen>

      <BottomNavBar
        activeItem="daily"
        variant="teacher"
        onItemPress={handleBottomNavPress}
      />
    </View>
  );
}

function SummaryCard({
  label,
  value,
  text,
}: {
  label: string;
  value: number;
  text: string;
}) {
  return (
    <AppCard style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryText}>{text}</Text>
    </AppCard>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onPress,
}: {
  title: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </TouchableOpacity>
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
  summaryGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  summaryCard: {
    width: "48%",
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "700",
    marginTop: 2,
    textAlign: "center",
  },
  summaryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionAction: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  contentCard: {
    marginBottom: Spacing.sm,
  },
  itemHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  itemHeaderRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },
  deleteButton: {
    padding: 2,
  },
  itemTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  badge: {
    fontSize: 12,
    color: Colors.primary,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  activityImage: {
    width: "100%",
    height: 140,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  itemText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "right",
  },
  compactItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  lastCompactItem: {
    borderBottomWidth: 0,
  },
});
