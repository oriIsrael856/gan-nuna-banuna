import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import {
  getEventSuggestions,
  respondToEventSuggestion,
} from "../../src/services/eventSuggestions.service";
import { Colors } from "../../src/theme/colors";
import { Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

export default function ParentEventSuggestionsScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("parent");
  const { data, loading, error, reload } = useAsyncData(() => getEventSuggestions(), []);

  async function handleRsvp(suggestionId: string, attending: boolean) {
    await respondToEventSuggestion(suggestionId, attending);
    reload();
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader variant="back" onLeadingPress={() => router.back()} onBellPress={() => router.push("/notifications")} />
        <Text style={styles.title}>הצעות מהגן</Text>
        <Text style={styles.subtitle}>אירועים מיוחדים, ימי צילום ועוד</Text>

        {loading ? (
          <AppStateCard state="loading" title="טוען" message="רגע..." />
        ) : error ? (
          <AppStateCard state="error" title="שגיאה" message="לא הצלחנו לטעון." actionLabel="נסו שוב" onActionPress={reload} />
        ) : (data ?? []).length === 0 ? (
          <AppStateCard state="empty" title="אין הצעות כרגע" message="הגן ישלח הצעות לאירועים מיוחדים כאן." />
        ) : (
          (data ?? []).map((item) => (
            <AppCard key={item.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemBody}>{item.body}</Text>
              {item.eventDate ? <Text style={styles.itemDate}>תאריך: {item.eventDate}</Text> : null}
              {item.requiresRsvp ? (
                <View style={styles.rsvpRow}>
                  <AppButton
                    title={item.myResponse === true ? "✓ מגיע/ה" : "מגיע/ה"}
                    onPress={() => handleRsvp(item.id, true)}
                    style={styles.rsvpBtn}
                  />
                  <AppButton
                    title={item.myResponse === false ? "✓ לא מגיע/ה" : "לא מגיע/ה"}
                    variant="secondary"
                    onPress={() => handleRsvp(item.id, false)}
                    style={styles.rsvpBtn}
                  />
                </View>
              ) : null}
            </AppCard>
          ))
        )}
      </AppScreen>
      <BottomNavBar activeItem="home" variant="parent" onItemPress={handleBottomNavPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.pageBackground },
  screenContent: { paddingBottom: Spacing.xxl },
  title: { ...Typography.titleLarge, color: Colors.textPrimary, textAlign: "right", marginTop: Spacing.sm },
  subtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: "right", marginBottom: Spacing.lg },
  itemCard: { marginBottom: Spacing.md, gap: Spacing.sm },
  itemTitle: { ...Typography.subtitle, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  itemBody: { ...Typography.body, color: Colors.textSecondary, textAlign: "right" },
  itemDate: { ...Typography.labelBold, color: Colors.primary, textAlign: "right" },
  rsvpRow: { flexDirection: "row-reverse", gap: Spacing.sm, marginTop: Spacing.sm },
  rsvpBtn: { flex: 1 },
});
